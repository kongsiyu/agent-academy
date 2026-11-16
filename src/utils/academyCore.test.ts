import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { CurriculumContent } from '../types/academy';
import {
  buildArtifactMarkdown,
  buildFilledPrompt,
  computeAcademyStats,
  createInitialState,
  isTaskCompleted,
  isTaskDraft,
  validateAndNormalizeState,
} from './academyCore';

const curriculum = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'src/data/curriculum.json'), 'utf8')
) as CurriculumContent;

test('createInitialState initializes all lessons and tasks cleanly', () => {
  const state = createInitialState(curriculum, new Date('2026-11-16T08:00:00Z'));
  assert.equal(Object.keys(state.lessons).length, 15);
  assert.equal(Object.keys(state.tasks).length, 6);
  assert.equal(state.profile.goalId, 'starter');
  assert.equal(state.profile.weeklyMinutes, 120);
  assert.equal(state.activities.length, 0);
});

test('computeAcademyStats calculates lesson mastery, nextLesson, and weighted goal progress', () => {
  const state = createInitialState(curriculum);
  state.lessons.l1 = {
    passed: true,
    selectedIndex: 1,
    passedAt: '2026-11-16T10:00:00.000Z',
  };
  state.activities.push({
    type: 'lesson',
    id: 'l1',
    date: '2026-11-16',
    at: '2026-11-16T10:00:00.000Z',
  });

  const stats = computeAcademyStats(state, curriculum);
  assert.equal(stats.passedLessonsCount, 1);
  assert.equal(stats.learnedMinutes, 8);
  assert.equal(stats.learningDaysCount, 1);
  assert.equal(stats.nextLesson?.id, 'l2');
  // 1/12 * 0.6 = 5%
  assert.equal(stats.overallProgressPercent, 5);
  assert.equal(stats.moduleProgress[0].passedCount, 1);
  assert.equal(stats.moduleProgress[0].totalCount, 3);
});

test('task completion requires practice mode, non-empty output, and all criteria checked', () => {
  const state = createInitialState(curriculum);
  const meetingTask = curriculum.tasks.find((t) => t.id === 'meeting')!;

  // Draft only (missing criteria)
  state.tasks.meeting.mode = 'practice';
  state.tasks.meeting.input = '会议纪要原文';
  state.tasks.meeting.output = '待办清单草稿';
  assert.equal(isTaskCompleted(meetingTask, state.tasks.meeting), false);
  assert.equal(isTaskDraft(meetingTask, state.tasks.meeting), true);

  // Check all criteria and set completedAt
  for (const c of meetingTask.criteria) {
    state.tasks.meeting.checks[c.id] = true;
  }
  state.tasks.meeting.completedAt = '2026-11-16T12:00:00.000Z';

  assert.equal(isTaskCompleted(meetingTask, state.tasks.meeting), true);
  assert.equal(isTaskDraft(meetingTask, state.tasks.meeting), false);

  const stats = computeAcademyStats(state, curriculum);
  assert.equal(stats.completedTasksCount, 1);
  assert.equal(stats.draftsCount, 0);
  // 1/3 tasks * 40% = 13.33 -> 13%
  assert.equal(stats.overallProgressPercent, 13);
});

test('validateAndNormalizeState rejects unknown fields in strict mode and restores valid backups', () => {
  const valid = createInitialState(curriculum);
  valid.lessons.l1.passed = true;
  valid.lessons.l1.passedAt = '2026-11-16T09:00:00.000Z';

  const restored = validateAndNormalizeState(JSON.parse(JSON.stringify(valid)), curriculum, {
    strict: true,
  });
  assert.equal(restored.lessons.l1.passed, true);

  assert.throws(
    () =>
      validateAndNormalizeState(
        { profile: { goalId: 'unknown-goal' } },
        curriculum,
        { strict: true }
      ),
    /未知学习目标/
  );
});

test('buildFilledPrompt replaces bracket placeholder and buildArtifactMarkdown formats cleanly', () => {
  const meetingTask = curriculum.tasks.find((t) => t.id === 'meeting')!;
  const filled = buildFilledPrompt(meetingTask, '张三周五前交方案');
  assert.ok(filled.includes('张三周五前交方案'));
  assert.ok(!filled.includes('[粘贴会议记录]'));

  const state = createInitialState(curriculum);
  state.tasks.meeting.input = '测试输入';
  state.tasks.meeting.output = '测试输出';
  state.tasks.meeting.completedAt = '2026-11-16T12:00:00.000Z';
  const md = buildArtifactMarkdown(meetingTask, state.tasks.meeting);
  assert.ok(md.includes('# 把会议记录变成待办清单'));
  assert.ok(md.includes('测试输出'));
});
