import { useState } from 'react';
import { ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type {
  AcademyStats,
  CurriculumContent,
  LearningState,
} from '../types/academy';

interface RoutePageProps {
  curriculum: CurriculumContent;
  state: LearningState;
  stats: AcademyStats;
}

type RouteFilter = 'all' | 'core' | 'optional' | 'pending';

const FILTERS: { id: RouteFilter; label: string }[] = [
  { id: 'all', label: '全部课程' },
  { id: 'core', label: '核心必修（1-4周）' },
  { id: 'optional', label: '进阶选修（5-6周）' },
  { id: 'pending', label: '待掌握' },
];

export function RoutePage({ curriculum, state, stats }: RoutePageProps) {
  const [filter, setFilter] = useState<RouteFilter>('all');

  const visibleModules = curriculum.modules.filter((mod) => {
    if (filter === 'core') return !mod.optional;
    if (filter === 'optional') return mod.optional;
    if (filter === 'pending') {
      const modLessons = curriculum.lessons.filter((l) => l.moduleId === mod.id);
      return modLessons.some((l) => !state.lessons[l.id]?.passed);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 border-b border-[#E2E3DD] pb-7 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="text-xs font-medium tracking-[0.14em] text-[#666A63]">
            CURRICULUM ROUTE · 6 周进阶路径
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916]">
            学习路线与课程目录
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#575B56] sm:text-base">
            15 节精炼短课，每节 8–15 分钟。学完核心概念并完成 1 道随堂判断，即可点亮对应能力模块。
          </p>
        </div>

        <div className="flex items-center gap-6 rounded-xl border border-[#DFDFD8] bg-white px-5 py-3.5 shrink-0">
          <div>
            <div className="text-xs text-[#666A63]">已掌握课程</div>
            <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#171916]">
              {stats.passedLessonsCount} / {stats.totalLessonsCount}
            </div>
          </div>
          <div className="h-8 w-px bg-[#E2E3DD]" aria-hidden="true" />
          <div>
            <div className="text-xs text-[#666A63]">已学时长</div>
            <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-[#0D5C4B]">
              {stats.learnedMinutes} 分钟
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="筛选课程阶段"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#DFDFD8] bg-[#EFEFEA] p-1"
        >
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#171916] shadow-xs'
                    : 'text-[#575B56] hover:text-[#171916]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {stats.nextLesson && (
          <a
            href={`#/lesson/${stats.nextLesson.id}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0D5C4B] hover:underline whitespace-nowrap"
          >
            <span>继续下一节：{stats.nextLesson.title}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Modules List */}
      {visibleModules.length === 0 ? (
        <div className="rounded-2xl border border-[#DFDFD8] bg-white p-10 text-center">
          <p className="font-serif text-lg font-medium text-[#171916]">
            该筛选条件下没有待学习课程
          </p>
          <p className="mt-1.5 text-sm text-[#5C605A]">
            你已经掌握了所有相关课程，可以前往任务实验室动手实践。
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="rounded-lg border border-[#D8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#171916] hover:bg-[#F5F5F0]"
            >
              查看全部课程
            </button>
            <a
              href="#/tasks"
              className="rounded-lg bg-[#0D5C4B] px-4 py-2 text-sm font-medium text-white hover:bg-[#09473A]"
            >
              前往任务实验室
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {visibleModules.map((mod) => {
            const lessons = curriculum.lessons.filter((l) => {
              if (l.moduleId !== mod.id) return false;
              if (filter === 'pending') return !state.lessons[l.id]?.passed;
              return true;
            });
            const allModLessons = curriculum.lessons.filter(
              (l) => l.moduleId === mod.id
            );
            const passedCount = allModLessons.filter(
              (l) => state.lessons[l.id]?.passed
            ).length;

            return (
              <section
                key={mod.id}
                aria-labelledby={`module-${mod.id}`}
                className="overflow-hidden rounded-2xl border border-[#DFDFD8] bg-white"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-[#ECECE6] bg-[#FAF9F6] px-6 py-5 sm:flex-row sm:items-center">
                  <div>
                    <div className="text-xs font-medium text-[#666A63]">
                      第 {mod.week} 周{mod.optional ? ' · 选修进阶' : ' · 核心必修'}
                    </div>
                    <h2
                      id={`module-${mod.id}`}
                      className="mt-1 font-serif text-xl font-semibold text-[#171916]"
                    >
                      {mod.title}
                    </h2>
                    <p className="mt-0.5 text-sm text-[#5C605A]">{mod.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-semibold tabular-nums text-[#474B45]">
                      已完成 {passedCount}/{allModLessons.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#ECECE6]">
                  {lessons.map((lesson, idx) => {
                    const passed = Boolean(state.lessons[lesson.id]?.passed);
                    return (
                      <a
                        key={lesson.id}
                        href={`#/lesson/${lesson.id}`}
                        className="group flex flex-col justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#FAF9F6] sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 items-start gap-4">
                          <span className="mt-0.5 shrink-0">
                            {passed ? (
                              <CheckCircle2
                                className="h-5 w-5 text-[#0D5C4B]"
                                aria-label="已掌握"
                              />
                            ) : (
                              <Circle
                                className="h-5 w-5 text-[#C5C7BD] group-hover:text-[#0D5C4B]"
                                aria-label="未完成"
                              />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-baseline gap-2">
                              <span className="font-mono text-xs text-[#6B7068]">
                                {String(idx + 1).padStart(2, '0')}
                              </span>
                              <h3 className="text-base font-semibold text-[#171916] group-hover:text-[#0D5C4B]">
                                {lesson.title}
                              </h3>
                            </div>
                            <p className="mt-1 text-sm text-[#5C605A]">
                              {lesson.summary}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-5 pl-9 sm:justify-end sm:pl-0">
                          <span className="text-xs tabular-nums text-[#666A63] whitespace-nowrap">
                            {lesson.skill} · {lesson.minutes} 分钟
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0D5C4B] whitespace-nowrap">
                            <span>{passed ? '回顾' : '学习'}</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
