import { useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { ArtifactsPage } from './components/ArtifactsPage';
import { GoalModal } from './components/GoalModal';
import { LessonPage } from './components/LessonPage';
import { OverviewPage } from './components/OverviewPage';
import { RoutePage } from './components/RoutePage';
import { SettingsPage } from './components/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { TaskLabPage } from './components/TaskLabPage';
import { TasksPage } from './components/TasksPage';
import { TopBar } from './components/TopBar';
import { useAcademyStore } from './hooks/useAcademyStore';
import type { AcademyRoute } from './types/academy';

function parseHashRoute(hash: string): AcademyRoute {
  const cleaned = hash.replace(/^#\/?/, '');
  const parts = cleaned.split('/').filter(Boolean);
  if (parts.length === 0 || parts[0] === 'overview') {
    return { page: 'overview' };
  }
  if (parts[0] === 'route') return { page: 'route' };
  if (parts[0] === 'lesson' && parts[1]) {
    return { page: 'lesson', lessonId: parts[1] };
  }
  if (parts[0] === 'tasks') return { page: 'tasks' };
  if (parts[0] === 'task' && parts[1]) {
    return { page: 'task', taskId: parts[1] };
  }
  if (parts[0] === 'artifacts') return { page: 'artifacts' };
  if (parts[0] === 'settings') return { page: 'settings' };
  return { page: 'overview' };
}

export default function App() {
  const {
    curriculum,
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
  } = useAcademyStore();

  const [route, setRoute] = useState<AcademyRoute>(() =>
    parseHashRoute(window.location.hash)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHashRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const titles: Record<AcademyRoute['page'], string> = {
      overview: '学习总览 · 启程 Agent Academy',
      route: '学习路线 · 启程 Agent Academy',
      lesson: '课程学习 · 启程 Agent Academy',
      tasks: '任务实验室 · 启程 Agent Academy',
      task: '任务工作台 · 启程 Agent Academy',
      artifacts: '我的成果 · 启程 Agent Academy',
      settings: '学习设置 · 启程 Agent Academy',
    };
    document.title = titles[route.page];
  }, [route]);

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#171916]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-[#0D5C4B] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        跳到主要内容
      </a>

      <Sidebar
        route={route}
        stats={stats}
        profile={state.profile}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenGoalModal={() => setGoalModalOpen(true)}
      />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopBar
          route={route}
          curriculum={curriculum}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenGoalModal={() => setGoalModalOpen(true)}
        />

        <main
          id="main-content"
          className="mx-auto w-full max-w-[1160px] flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10"
        >
          {warning && (
            <div
              role="status"
              className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[#B45309]/30 bg-[#FEF3C7]/60 px-4 py-3 text-sm text-[#78350F]"
            >
              <span>{warning}</span>
              <button
                type="button"
                onClick={dismissWarning}
                aria-label="关闭提示"
                className="rounded p-1 hover:bg-[#FDE68A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {route.page === 'overview' && (
            <OverviewPage
              curriculum={curriculum}
              state={state}
              stats={stats}
            />
          )}

          {route.page === 'route' && (
            <RoutePage curriculum={curriculum} state={state} stats={stats} />
          )}

          {route.page === 'lesson' && (
            <LessonPage
              lessonId={route.lessonId}
              curriculum={curriculum}
              state={state}
              onSubmitQuiz={submitLessonQuiz}
            />
          )}

          {route.page === 'tasks' && (
            <TasksPage curriculum={curriculum} state={state} stats={stats} />
          )}

          {route.page === 'task' && (
            <TaskLabPage
              taskId={route.taskId}
              curriculum={curriculum}
              state={state}
              onSetMode={setTaskMode}
              onSetStep={setTaskStep}
              onUpdateProgress={updateTaskProgress}
              onToggleCriterion={toggleTaskCriterion}
              onCompletePractice={completeTaskPractice}
              onCompleteWalkthrough={completeWalkthrough}
              onShowToast={showToast}
            />
          )}

          {route.page === 'artifacts' && (
            <ArtifactsPage
              curriculum={curriculum}
              state={state}
              stats={stats}
              onShowToast={showToast}
            />
          )}

          {route.page === 'settings' && (
            <SettingsPage
              curriculum={curriculum}
              state={state}
              stats={stats}
              onOpenGoalModal={() => setGoalModalOpen(true)}
              onImportBackup={importBackupState}
              onResetAll={resetAllProgress}
              onShowToast={showToast}
            />
          )}
        </main>

        <footer className="border-t border-[#E2E3DD] px-4 py-5 text-xs text-[#666A63] sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-[1160px] flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <span>一点点学会，一次次做好。</span>
            <a href="#/settings" className="hover:text-[#171916] hover:underline">
              本地数据与备份设置
            </a>
          </div>
        </footer>
      </div>

      <GoalModal
        open={goalModalOpen}
        goals={curriculum.goals}
        profile={state.profile}
        onClose={() => setGoalModalOpen(false)}
        onSave={updateGoalProfile}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 bottom-5 z-50 flex items-center gap-2 rounded-xl bg-[#171916] px-4 py-2.5 text-xs font-medium text-white shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-[#34D399]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
