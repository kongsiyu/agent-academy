import {
  Archive,
  Compass,
  FlaskConical,
  LayoutGrid,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { AcademyRoute, AcademyStats, UserProfile } from '../types/academy';

interface SidebarProps {
  route: AcademyRoute;
  stats: AcademyStats;
  profile: UserProfile;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenGoalModal: () => void;
}

const NAV_ITEMS = [
  { key: 'overview', href: '#/overview', label: '学习总览', icon: LayoutGrid },
  { key: 'route', href: '#/route', label: '学习路线', icon: Compass },
  { key: 'tasks', href: '#/tasks', label: '任务实验室', icon: FlaskConical },
  { key: 'artifacts', href: '#/artifacts', label: '我的成果', icon: Archive },
  { key: 'settings', href: '#/settings', label: '学习设置', icon: SlidersHorizontal },
] as const;

export function Sidebar({
  route,
  stats,
  profile,
  mobileOpen,
  onCloseMobile,
  onOpenGoalModal,
}: SidebarProps) {
  const activeKey =
    route.page === 'lesson'
      ? 'route'
      : route.page === 'task'
        ? 'tasks'
        : route.page;

  const content = (
    <div className="flex h-full flex-col justify-between bg-[#EFEFEA] px-4 py-6 text-[#171916]">
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <a
            href="#/overview"
            onClick={onCloseMobile}
            className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C4B] rounded-lg"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0D5C4B] font-serif text-base font-semibold text-white">
              启
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-serif text-base font-semibold tracking-tight text-[#171916]">
                启程
              </span>
              <span className="text-[11px] font-medium tracking-[0.14em] text-[#666A63]">
                Agent Academy
              </span>
            </span>
          </a>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="关闭导航菜单"
            className="rounded-lg p-2 text-[#575B56] hover:bg-[#E4E4DD] hover:text-[#171916] lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-2 pb-2 text-xs font-medium text-[#6B7068]">
          学习工作台
        </div>

        <nav aria-label="主导航" className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;
            return (
              <a
                key={item.key}
                href={item.href}
                onClick={onCloseMobile}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C4B] ${
                  isActive
                    ? 'bg-white text-[#171916] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-[#DFDFD8]'
                    : 'text-[#525650] hover:bg-[#E6E6DF] hover:text-[#171916]'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-[#0D5C4B]' : 'text-[#6B7068]'
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 pt-6">
        <div className="rounded-xl border border-[#DFDFD8] bg-white p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-medium text-[#666A63]">当前目标</span>
            <span className="font-mono text-sm font-semibold tabular-nums text-[#0D5C4B]">
              {stats.overallProgressPercent}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="当前学习目标总进度"
            aria-valuenow={stats.overallProgressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#ECECE6]"
          >
            <div
              className="h-full rounded-full bg-[#0D5C4B] transition-all duration-300"
              style={{ width: `${stats.overallProgressPercent}%` }}
            />
          </div>

          <div className="mt-3 text-sm font-semibold text-[#171916]">
            {stats.goal.title}
          </div>
          <div className="mt-1 text-xs tabular-nums text-[#666A63]">
            {stats.passedLessonsCount}/{stats.goal.targetLessons} 课 ·{' '}
            {stats.completedTasksCount}/{stats.goal.targetTasks} 个成果
          </div>

          <button
            type="button"
            onClick={() => {
              onCloseMobile();
              onOpenGoalModal();
            }}
            className="mt-3 w-full rounded-lg border border-[#E2E3DD] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#373B35] transition-colors hover:border-[#C9CBC2] hover:bg-[#F1F1EC] whitespace-nowrap"
          >
            {profile.roleTrack} · 调整目标
          </button>
        </div>

        <p className="px-2 text-[11px] leading-relaxed text-[#6B7068]">
          进度与草稿仅保存在本地浏览器。
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64 lg:border-r lg:border-[#E2E3DD]">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="导航菜单"
        >
          <div
            className="fixed inset-0 bg-[#171916]/35 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] border-r border-[#E2E3DD] shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
