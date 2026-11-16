import { useCallback, useEffect, useMemo, useState } from 'react';
import rawCurriculum from '../data/curriculum.json';
import type {
  CurriculumContent,
  LearningState,
  TaskMode,
  TaskProgress,
} from '../types/academy';
import {
  computeAcademyStats,
  createBlankTaskProgress,
  createInitialState,
  getTodayDay,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  validateAndNormalizeState,
} from '../utils/academyCore';

export const CURRICULUM = rawCurriculum as CurriculumContent;

function loadStoredState(): { state: LearningState; warning: string | null } {
  try {
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      return {
        state: validateAndNormalizeState(JSON.parse(rawV2), CURRICULUM, {
          strict: false,
        }),
        warning: null,
      };
    }
    // Migrate seamlessly from v1 if present
    const rawV1 = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawV1) {
      return {
        state: validateAndNormalizeState(JSON.parse(rawV1), CURRICULUM, {
          strict: false,
        }),
        warning: null,
      };
    }
    return { state: createInitialState(CURRICULUM), warning: null };
  } catch {
    return {
      state: createInitialState(CURRICULUM),
      warning: '本地学习记录格式异常，已为你启用新的学习空间。',
    };
  }
}

export function useAcademyStore() {
  const [{ state, warning }, setBoot] = useState(() => loadStoredState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors silently
    }
  }, [state]);

  const stats = useMemo(
    () => computeAcademyStats(state, CURRICULUM),
    [state]
  );

  const submitLessonQuiz = useCallback(
    (lessonId: string, selectedIndex: number): boolean => {
      const lesson = CURRICULUM.lessons.find((l) => l.id === lessonId);
      if (!lesson) return false;
      const isCorrect = selectedIndex === lesson.quiz.answerIndex;
      const nowIso = new Date().toISOString();
      const today = getTodayDay();

      setBoot((prev) => {
        const current = prev.state.lessons[lessonId] || {
          passed: false,
          selectedIndex: null,
          passedAt: null,
        };
        const passed = isCorrect ? true : current.passed;
        const nextActivities = isCorrect
          ? [
              ...prev.state.activities,
              { type: 'lesson' as const, id: lessonId, date: today, at: nowIso },
            ].slice(-500)
          : prev.state.activities;

        return {
          ...prev,
          state: {
            ...prev.state,
            lessons: {
              ...prev.state.lessons,
              [lessonId]: {
                passed,
                selectedIndex,
                passedAt: isCorrect ? current.passedAt || nowIso : current.passedAt,
              },
            },
            activities: nextActivities,
          },
        };
      });

      if (isCorrect) {
        showToast(`已完成《${lesson.title}》`);
      }
      return isCorrect;
    },
    [showToast]
  );

  const updateTaskProgress = useCallback(
    (
      taskId: string,
      updater: (current: TaskProgress) => Partial<TaskProgress>
    ) => {
      const task = CURRICULUM.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const nowIso = new Date().toISOString();

      setBoot((prev) => {
        const current =
          prev.state.tasks[taskId] || createBlankTaskProgress(task);
        const patch = updater(current);
        return {
          ...prev,
          state: {
            ...prev.state,
            tasks: {
              ...prev.state.tasks,
              [taskId]: {
                ...current,
                ...patch,
                updatedAt: nowIso,
              },
            },
          },
        };
      });
    },
    []
  );

  const setTaskMode = useCallback(
    (taskId: string, mode: TaskMode) => {
      updateTaskProgress(taskId, () => ({ mode }));
    },
    [updateTaskProgress]
  );

  const setTaskStep = useCallback(
    (taskId: string, stepIndex: number) => {
      updateTaskProgress(taskId, () => ({ stepIndex }));
    },
    [updateTaskProgress]
  );

  const toggleTaskCriterion = useCallback(
    (taskId: string, criterionId: string, checked: boolean) => {
      updateTaskProgress(taskId, (current) => ({
        checks: {
          ...current.checks,
          [criterionId]: checked,
        },
      }));
    },
    [updateTaskProgress]
  );

  const completeTaskPractice = useCallback(
    (taskId: string): { ok: boolean; error?: string } => {
      const task = CURRICULUM.tasks.find((t) => t.id === taskId);
      if (!task) return { ok: false, error: '未找到该任务。' };
      const current = state.tasks[taskId];
      if (!current || current.output.trim().length === 0) {
        return { ok: false, error: '请先粘贴或整理 Agent 的输出结果。' };
      }
      const unchecked = task.criteria.filter((c) => !current.checks[c.id]);
      if (unchecked.length > 0) {
        return {
          ok: false,
          error: `还有 ${unchecked.length} 项验收标准未勾选确认。`,
        };
      }

      const nowIso = new Date().toISOString();
      const today = getTodayDay();
      setBoot((prev) => ({
        ...prev,
        state: {
          ...prev.state,
          tasks: {
            ...prev.state.tasks,
            [taskId]: {
              ...prev.state.tasks[taskId],
              mode: 'practice',
              completedAt: prev.state.tasks[taskId].completedAt || nowIso,
              updatedAt: nowIso,
            },
          },
          activities: [
            ...prev.state.activities,
            { type: 'task' as const, id: taskId, date: today, at: nowIso },
          ].slice(-500),
        },
      }));
      showToast(`已收录成果：${task.title}`);
      return { ok: true };
    },
    [showToast, state.tasks]
  );

  const completeWalkthrough = useCallback(
    (taskId: string) => {
      const task = CURRICULUM.tasks.find((t) => t.id === taskId);
      if (!task) return;
      updateTaskProgress(taskId, () => ({
        walkthroughCompleted: true,
        stepIndex: task.checkpoints.length - 1,
      }));
      showToast('示例体验完成，建议切换到「独立练习」用自己的资料试一次');
    },
    [showToast, updateTaskProgress]
  );

  const updateGoalProfile = useCallback(
    (patch: { goalId?: string; roleTrack?: string; weeklyMinutes?: number }) => {
      setBoot((prev) => ({
        ...prev,
        state: {
          ...prev.state,
          profile: {
            ...prev.state.profile,
            ...patch,
          },
        },
      }));
      showToast('学习目标已更新');
    },
    [showToast]
  );

  const importBackupState = useCallback(
    (nextState: LearningState) => {
      setBoot({ state: nextState, warning: null });
      showToast('已从备份恢复学习记录');
    },
    [showToast]
  );

  const resetAllProgress = useCallback(() => {
    const fresh = createInitialState(CURRICULUM);
    setBoot({ state: fresh, warning: null });
    showToast('已清空本机学习记录');
  }, [showToast]);

  const dismissWarning = useCallback(() => {
    setBoot((prev) => ({ ...prev, warning: null }));
  }, []);

  return {
    curriculum: CURRICULUM,
    state,
    stats,
    warning,
    toastMessage,
    showToast,
    dismissWarning,
    submitLessonQuiz,
    setTaskMode,
    setTaskStep,
    updateTaskProgress,
    toggleTaskCriterion,
    completeTaskPractice,
    completeWalkthrough,
    updateGoalProfile,
    importBackupState,
    resetAllProgress,
  };
}
