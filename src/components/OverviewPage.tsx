import { ArrowRight, CheckCircle2 } from 'lucide-react';
import type {
  AcademyStats,
  CurriculumContent,
  LearningState,
} from '../types/academy';
import { formatChineseDateLabel } from '../utils/academyCore';

interface OverviewPageProps {
  curriculum: CurriculumContent;
  state: LearningState;
  stats: AcademyStats;
}

export function OverviewPage({
  curriculum,
  state,
  stats,
}: OverviewPageProps) {
  const todayLabel = formatChineseDateLabel();
  const coreModules = curriculum.modules.filter((m) => !m.optional);
  const featuredTasks = curriculum.tasks.slice(0, 3);
  const nextLesson = stats.nextLesson;
  const nextLessonModule = nextLesson
    ? curriculum.modules.find((m) => m.id === nextLesson.moduleId)
    : null;

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <section className="flex flex-col justify-between gap-4 border-b border-[#E2E3DD] pb-8 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <div className="text-xs font-medium tracking-[0.14em] text-[#666A63]">
            每日精进 · {todayLabel}
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916] sm:text-4xl">
            从第一次上手，到独立做好。
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-[#575B56]">
            把学习放进真实工作任务，在一次次交付、核对与沉淀中建立自己的 Agent 工作法。
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-[#575B56] shrink-0">
          <div>
            <div className="text-xs text-[#6B7068]">当前路线</div>
            <div className="mt-0.5 font-medium text-[#171916]">
              {stats.goal.title}
            </div>
          </div>
          <div className="h-8 w-px bg-[#E2E3DD]" aria-hidden="true" />
          <div>
            <div className="text-xs text-[#6B7068]">建议投入</div>
            <div className="mt-0.5 font-medium tabular-nums text-[#171916]">
              每周 {state.profile.weeklyMinutes} 分钟
            </div>
          </div>
        </div>
      </section>

      {/* Primary Focal Anchor: Next Step + Editorial Artwork */}
      <section
        aria-label="当前下一步"
        className="overflow-hidden rounded-2xl border border-[#DFDFD8] bg-white"
      >
        <div className="grid lg:grid-cols-12 items-stretch">
          <div className="flex flex-col justify-between p-7 sm:p-9 lg:col-span-7">
            <div>
              <div className="text-xs font-semibold tracking-wider text-[#0D5C4B]">
                {nextLesson
                  ? `下一步建议 · 第 ${nextLessonModule?.week ?? 1} 周`
                  : '学习里程碑 · 全部课程已完成'}
              </div>

              <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug text-[#171916] sm:text-[28px]">
                {nextLesson
                  ? nextLesson.title
                  : '你已完成所有课程，现在可以在任务实验室打磨更多独立成果'}
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#575B56] sm:text-base">
                {nextLesson
                  ? `${nextLesson.summary}（约 ${nextLesson.minutes} 分钟 · ${nextLesson.skill}）`
                  : '将学到的方法带入你手头正在处理的真实资料，沉淀成可反复使用的个人工作流。'}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <a
                  href={nextLesson ? `#/lesson/${nextLesson.id}` : '#/tasks'}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0D5C4B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#09473A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C4B]"
                >
                  <span>
                    {nextLesson
                      ? stats.passedLessonsCount === 0
                        ? '开始第一课'
                        : '继续下一课'
                      : '前往任务实验室'}
                  </span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>

                <a
                  href="#/tasks"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D9D1] bg-[#FAF9F6] px-4 py-2.5 text-sm font-medium text-[#171916] transition-colors hover:bg-[#EFEFEA] whitespace-nowrap shrink-0"
                >
                  <span>直接挑战实战任务</span>
                </a>
              </div>
            </div>

            <div className="mt-8 border-t border-[#ECECE6] pt-5">
              <div className="flex items-center justify-between text-xs text-[#666A63]">
                <span>目标总进度 · {stats.goal.title}</span>
                <span className="font-mono font-semibold tabular-nums text-[#171916]">
                  {stats.overallProgressPercent}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#ECECE6]">
                <div
                  className="h-full rounded-full bg-[#0D5C4B] transition-all duration-300"
                  style={{ width: `${stats.overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="relative h-48 border-t border-[#E2E3DD] bg-[#EFEFEA] sm:h-56 lg:col-span-5 lg:h-auto lg:min-h-[320px] lg:border-t-0 lg:border-l">
            <img
              src="/src/assets/images/hero_agent_workflow_1794840697653.jpg"
              alt="启程 Agent Academy 工作台卡片与流程草稿"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 4-Column Tabular Metrics Strip (Flat, hairline divided, zero card clutter) */}
      <section
        aria-label="学习数据概览"
        className="grid grid-cols-2 divide-y divide-[#E2E3DD] rounded-xl border border-[#DFDFD8] bg-white sm:grid-cols-4 sm:divide-x sm:divide-y-0"
      >
        <div className="p-5 sm:p-6">
          <div className="text-xs font-medium text-[#666A63]">已掌握课程</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums text-[#171916]">
              {stats.passedLessonsCount}
            </span>
            <span className="text-xs tabular-nums text-[#6B7068]">
              / {stats.goal.targetLessons} 节
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-xs font-medium text-[#666A63]">独立成果</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums text-[#171916]">
              {stats.completedTasksCount}
            </span>
            <span className="text-xs tabular-nums text-[#6B7068]">
              / {stats.goal.targetTasks} 份
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-xs font-medium text-[#666A63]">学习记录</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums text-[#171916]">
              {stats.learningDaysCount}
            </span>
            <span className="text-xs tabular-nums text-[#6B7068]">
              天 · 累计 {stats.learnedMinutes} 分钟
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="text-xs font-medium text-[#666A63]">进行中草稿</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tabular-nums text-[#171916]">
              {stats.draftsCount}
            </span>
            <span className="text-xs text-[#6B7068]">份练习草稿</span>
          </div>
        </div>
      </section>

      {/* Main Split: Growth Route & Recommended Tasks */}
      <div className="grid gap-10 lg:grid-cols-12">
        {/* Left: 4-Week Growth Route */}
        <section className="lg:col-span-7">
          <div className="flex items-end justify-between gap-4 pb-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#171916]">
                你的成长路线
              </h2>
              <p className="mt-1 text-sm text-[#5C605A]">
                前四周掌握核心方法，后两周按需选修定制与流程串联。
              </p>
            </div>
            <a
              href="#/route"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0D5C4B] hover:underline whitespace-nowrap shrink-0"
            >
              <span>完整路线</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="divide-y divide-[#E2E3DD] rounded-xl border border-[#DFDFD8] bg-white">
            {coreModules.map((mod) => {
              const modLessons = curriculum.lessons.filter(
                (l) => l.moduleId === mod.id
              );
              const passed = modLessons.filter(
                (l) => state.lessons[l.id]?.passed
              ).length;
              const targetLesson =
                modLessons.find((l) => !state.lessons[l.id]?.passed) ||
                modLessons[0];
              const isDone = passed === modLessons.length && modLessons.length > 0;

              return (
                <a
                  key={mod.id}
                  href={`#/lesson/${targetLesson?.id ?? 'l1'}`}
                  className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-[#FAF9F6]"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold tabular-nums ${
                        isDone
                          ? 'bg-[#0D5C4B] text-white'
                          : 'bg-[#F1F1EC] text-[#373B35]'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        `0${mod.week}`
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#171916] group-hover:text-[#0D5C4B]">
                          {mod.title}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-[#666A63]">
                        第 {mod.week} 周 · {mod.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono text-xs font-medium tabular-nums text-[#5C605A]">
                      {passed}/{modLessons.length}
                    </span>
                    <ArrowRight
                      className="h-4 w-4 text-[#8E9289] transition-transform group-hover:translate-x-0.5 group-hover:text-[#0D5C4B]"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[#666A63]">
            学习方法：先用预置示例跑通一次，再切换成自己的工作资料。示例体验与独立验收成果会分开统计。
          </p>
        </section>

        {/* Right: Featured Lab Tasks */}
        <section className="lg:col-span-5">
          <div className="flex items-end justify-between gap-4 pb-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#171916]">
                从一个小任务开始
              </h2>
              <p className="mt-1 text-sm text-[#5C605A]">
                带着成果离开，带着方法回来。
              </p>
            </div>
            <a
              href="#/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0D5C4B] hover:underline whitespace-nowrap shrink-0"
            >
              <span>全部 6 个任务</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="divide-y divide-[#E2E3DD] rounded-xl border border-[#DFDFD8] bg-white">
            {featuredTasks.map((task) => {
              const isCompleted = stats.completedTaskIds.includes(task.id);
              const isDraft = stats.draftTaskIds.includes(task.id);
              return (
                <article key={task.id} className="p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-[#666A63]">
                    <span>
                      {task.category} · {task.minutes} 分钟 · {task.level}
                    </span>
                    {isCompleted ? (
                      <span className="font-medium text-[#0D5C4B]">已完成验收</span>
                    ) : isDraft ? (
                      <span className="font-medium text-[#B45309]">草稿进行中</span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-[#171916]">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#5C605A]">
                    {task.summary}
                  </p>
                  <div className="mt-3.5">
                    <a
                      href={`#/task/${task.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D5C4B] hover:underline whitespace-nowrap"
                    >
                      <span>{isCompleted ? '查看或复盘任务' : '进入任务实验室'}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom: 6-Axis Capability Progress */}
      <section className="border-t border-[#E2E3DD] pt-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#171916]">
              正在积累的能力
            </h2>
            <p className="mt-1 text-sm text-[#5C605A]">
              由通过测验的课程实时计算，覆盖从委派任务到流程自动化的六个阶段。
            </p>
          </div>
          <a
            href="#/route"
            className="text-xs font-medium text-[#575B56] hover:text-[#171916] whitespace-nowrap"
          >
            查看全部 15 节课程
          </a>
        </div>

        <div className="mt-5 grid gap-x-8 gap-y-5 rounded-xl border border-[#DFDFD8] bg-white p-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.moduleProgress.map((mod) => {
            const pct = Math.round(mod.ratio * 100);
            return (
              <div key={mod.moduleId} className="space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#171916]">
                    {mod.title}
                    {mod.optional && (
                      <span className="ml-1.5 text-xs font-normal text-[#6B7068]">
                        · 选修
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-[#5C605A] shrink-0">
                    {mod.passedCount}/{mod.totalCount}
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-label={`${mod.title}完成进度`}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-[#ECECE6]"
                >
                  <div
                    className="h-full rounded-full bg-[#0D5C4B] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
