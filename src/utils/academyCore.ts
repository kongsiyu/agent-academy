import type {
  AcademyStats,
  ActivityRecord,
  CurriculumContent,
  LabTask,
  LearningGoal,
  LearningState,
  Lesson,
  TaskProgress,
} from '../types/academy';

export const STORAGE_KEY = 'qicheng.agent-academy.v2';
export const LEGACY_STORAGE_KEY = 'qicheng.agent-academy.v1';

export const ROLE_TRACKS = [
  '通用办公',
  '运营市场',
  '行政人事',
  '产品项目',
  '销售客服',
  '内容编辑',
] as const;

export const WEEKLY_MINUTE_OPTIONS = [60, 120, 180, 240] as const;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayDay(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatChineseDateLabel(now = new Date()): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;
}

export function formatShortChineseDate(dayStr: string): string {
  if (!DAY_RE.test(dayStr)) return dayStr;
  const [, m, d] = dayStr.split('-');
  return `${Number(m)}月${Number(d)}日`;
}

export function isValidDay(value: unknown): value is string {
  return typeof value === 'string' && DAY_RE.test(value);
}

export function isValidISO(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

export function getDefaultGoal(content: CurriculumContent): LearningGoal {
  return (
    content.goals.find((g) => g.id === 'starter') ||
    content.goals[0] || {
      id: 'starter',
      title: '独立用好 Agent',
      description: '掌握使用方法，完成 3 类真实工作任务。',
      targetTasks: 3,
      targetLessons: 12,
      weeks: 4,
    }
  );
}

export function createBlankTaskProgress(task: LabTask): TaskProgress {
  const checks: Record<string, boolean> = {};
  for (const c of task.criteria) {
    checks[c.id] = false;
  }
  return {
    mode: 'walkthrough',
    stepIndex: 0,
    walkthroughCompleted: false,
    input: '',
    output: '',
    reflection: '',
    checks,
    completedAt: null,
    updatedAt: null,
  };
}

export function createInitialState(
  content: CurriculumContent,
  now = new Date()
): LearningState {
  const defaultGoal = getDefaultGoal(content);
  const lessons: LearningState['lessons'] = {};
  for (const lesson of content.lessons) {
    lessons[lesson.id] = {
      passed: false,
      selectedIndex: null,
      passedAt: null,
    };
  }

  const tasks: LearningState['tasks'] = {};
  for (const task of content.tasks) {
    tasks[task.id] = createBlankTaskProgress(task);
  }

  return {
    version: 2,
    profile: {
      goalId: defaultGoal.id,
      roleTrack: '通用办公',
      weeklyMinutes: 120,
      startDate: getTodayDay(now),
    },
    lessons,
    tasks,
    activities: [],
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clampText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.slice(0, maxLen);
}

export function validateAndNormalizeState(
  raw: unknown,
  content: CurriculumContent,
  options: { strict?: boolean } = {}
): LearningState {
  const strict = Boolean(options.strict);
  if (!isPlainObject(raw)) {
    if (strict) throw new Error('备份文件格式不正确：根节点必须是 JSON 对象。');
    return createInitialState(content);
  }

  const base = createInitialState(content);

  // Profile normalization
  if (isPlainObject(raw.profile)) {
    const p = raw.profile;
    if (typeof p.goalId === 'string' && content.goals.some((g) => g.id === p.goalId)) {
      base.profile.goalId = p.goalId;
    } else if (strict && p.goalId !== undefined) {
      throw new Error(`备份中包含未知学习目标：${String(p.goalId)}`);
    }

    if (typeof p.roleTrack === 'string' && p.roleTrack.trim().length > 0) {
      base.profile.roleTrack = clampText(p.roleTrack.trim(), 30);
    }
    if (typeof p.weeklyMinutes === 'number' && Number.isFinite(p.weeklyMinutes) && p.weeklyMinutes >= 30 && p.weeklyMinutes <= 1200) {
      base.profile.weeklyMinutes = Math.round(p.weeklyMinutes);
    }
    if (isValidDay(p.startDate)) {
      base.profile.startDate = p.startDate;
    }
  } else if (strict) {
    throw new Error('备份文件缺少 profile 字段。');
  }

  // Lessons normalization
  if (isPlainObject(raw.lessons)) {
    for (const [id, rec] of Object.entries(raw.lessons)) {
      if (!base.lessons[id]) {
        if (strict) throw new Error(`备份中包含未知课程编号：${id}`);
        continue;
      }
      if (!isPlainObject(rec)) continue;
      const passed = Boolean(rec.passed);
      const selectedIndex =
        typeof rec.selectedIndex === 'number' && Number.isInteger(rec.selectedIndex) && rec.selectedIndex >= 0
          ? rec.selectedIndex
          : null;
      const passedAt = passed && isValidISO(rec.passedAt) ? rec.passedAt : null;
      base.lessons[id] = { passed, selectedIndex, passedAt };
    }
  }

  // Tasks normalization
  if (isPlainObject(raw.tasks)) {
    for (const [id, rec] of Object.entries(raw.tasks)) {
      const taskMeta = content.tasks.find((t) => t.id === id);
      if (!taskMeta || !base.tasks[id]) {
        if (strict) throw new Error(`备份中包含未知任务编号：${id}`);
        continue;
      }
      if (!isPlainObject(rec)) continue;

      const rawMode = rec.mode;
      const mode =
        rawMode === 'practice'
          ? 'practice'
          : 'walkthrough';

      const stepIndex =
        typeof rec.stepIndex === 'number' && Number.isInteger(rec.stepIndex)
          ? Math.max(0, Math.min(rec.stepIndex, Math.max(0, taskMeta.checkpoints.length - 1)))
          : 0;

      const checks: Record<string, boolean> = { ...base.tasks[id].checks };
      if (isPlainObject(rec.checks)) {
        for (const criterion of taskMeta.criteria) {
          checks[criterion.id] = Boolean(rec.checks[criterion.id]);
        }
      }

      base.tasks[id] = {
        mode,
        stepIndex,
        walkthroughCompleted: Boolean(rec.walkthroughCompleted),
        input: clampText(rec.input, 12000),
        output: clampText(rec.output, 20000),
        reflection: clampText(rec.reflection, 4000),
        checks,
        completedAt: isValidISO(rec.completedAt) ? rec.completedAt : null,
        updatedAt: isValidISO(rec.updatedAt) ? rec.updatedAt : null,
      };
    }
  }

  // Activities normalization
  if (Array.isArray(raw.activities)) {
    const validLessonIds = new Set(content.lessons.map((l) => l.id));
    const validTaskIds = new Set(content.tasks.map((t) => t.id));
    const cleaned: ActivityRecord[] = [];
    for (const item of raw.activities) {
      if (!isPlainObject(item)) continue;
      if (
        (item.type === 'lesson' && typeof item.id === 'string' && validLessonIds.has(item.id)) ||
        (item.type === 'task' && typeof item.id === 'string' && validTaskIds.has(item.id))
      ) {
        if (isValidDay(item.date) && isValidISO(item.at)) {
          cleaned.push({
            type: item.type,
            id: item.id,
            date: item.date,
            at: item.at,
          });
        }
      }
    }
    base.activities = cleaned.slice(-500);
  }

  return base;
}

export function isTaskCompleted(task: LabTask, progress?: TaskProgress): boolean {
  if (!progress) return false;
  if (progress.mode !== 'practice' || !progress.completedAt) return false;
  if (progress.output.trim().length === 0) return false;
  return task.criteria.every((c) => progress.checks[c.id] === true);
}

export function isTaskDraft(task: LabTask, progress?: TaskProgress): boolean {
  if (!progress) return false;
  if (isTaskCompleted(task, progress)) return false;
  return (
    progress.input.trim().length > 0 ||
    progress.output.trim().length > 0 ||
    progress.reflection.trim().length > 0
  );
}

export function computeAcademyStats(
  state: LearningState,
  content: CurriculumContent
): AcademyStats {
  const goal =
    content.goals.find((g) => g.id === state.profile.goalId) ||
    getDefaultGoal(content);

  const passedLessonsCount = content.lessons.filter(
    (l) => state.lessons[l.id]?.passed
  ).length;

  const completedTaskIds = content.tasks
    .filter((t) => isTaskCompleted(t, state.tasks[t.id]))
    .map((t) => t.id);

  const draftTaskIds = content.tasks
    .filter((t) => isTaskDraft(t, state.tasks[t.id]))
    .map((t) => t.id);

  const learningDaysCount = new Set(state.activities.map((a) => a.date)).size;

  const learnedMinutes = content.lessons
    .filter((l) => state.lessons[l.id]?.passed)
    .reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);

  const moduleProgress = content.modules.map((mod) => {
    const modLessons = content.lessons.filter((l) => l.moduleId === mod.id);
    const passedCount = modLessons.filter((l) => state.lessons[l.id]?.passed).length;
    const totalCount = modLessons.length;
    return {
      moduleId: mod.id,
      week: mod.week,
      title: mod.title,
      subtitle: mod.subtitle,
      optional: mod.optional,
      passedCount,
      totalCount,
      ratio: totalCount > 0 ? passedCount / totalCount : 0,
    };
  });

  // Core lessons prioritized before optional modules for "nextLesson"
  const coreModuleIds = new Set(
    content.modules.filter((m) => !m.optional).map((m) => m.id)
  );
  const orderedLessons: Lesson[] = [
    ...content.lessons.filter((l) => coreModuleIds.has(l.moduleId)),
    ...content.lessons.filter((l) => !coreModuleIds.has(l.moduleId)),
  ];
  const nextLesson = orderedLessons.find((l) => !state.lessons[l.id]?.passed) || null;

  const lessonRatio =
    goal.targetLessons > 0
      ? Math.min(1, passedLessonsCount / goal.targetLessons)
      : 0;
  const taskRatio =
    goal.targetTasks > 0
      ? Math.min(1, completedTaskIds.length / goal.targetTasks)
      : 0;

  // Weighted: 60% lessons + 40% independent tasks
  const overallProgressPercent = Math.round((lessonRatio * 0.6 + taskRatio * 0.4) * 100);

  return {
    goal,
    passedLessonsCount,
    totalLessonsCount: content.lessons.length,
    completedTaskIds,
    completedTasksCount: completedTaskIds.length,
    draftTaskIds,
    draftsCount: draftTaskIds.length,
    learningDaysCount,
    learnedMinutes,
    overallProgressPercent,
    lessonProgressPercent: Math.round(lessonRatio * 100),
    taskProgressPercent: Math.round(taskRatio * 100),
    nextLesson,
    moduleProgress,
  };
}

export function buildFilledPrompt(task: LabTask, inputText: string): string {
  const cleaned = inputText.trim();
  if (!cleaned) return task.prompt;
  // Replace bracketed placeholder line like [粘贴会议记录]
  if (/\[[^\]]+\]/.test(task.prompt)) {
    return task.prompt.replace(/\[[^\]]+\]/, cleaned);
  }
  return `${task.prompt}\n\n${cleaned}`;
}

export function buildArtifactMarkdown(task: LabTask, progress: TaskProgress): string {
  const lines = [
    `# ${task.title}`,
    `- 分类：${task.category} · 难度：${task.level}`,
    `- 验收完成时间：${progress.completedAt ? progress.completedAt.slice(0, 10) : '未完成'}`,
    '',
    '## 我的输入资料',
    progress.input.trim() || '（未填写）',
    '',
    '## Agent 交付结果',
    progress.output.trim() || '（未填写）',
    '',
    '## 验收核对项',
    ...task.criteria.map(
      (c) => `- [${progress.checks[c.id] ? 'x' : ' '}] ${c.label}`
    ),
  ];
  if (progress.reflection.trim()) {
    lines.push('', '## 复盘与修改心得', progress.reflection.trim());
  }
  return lines.join('\n');
}
