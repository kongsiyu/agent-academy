import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import type {
  AcademyStats,
  CurriculumContent,
  LearningState,
} from '../types/academy';

interface TasksPageProps {
  curriculum: CurriculumContent;
  state: LearningState;
  stats: AcademyStats;
}

export function TasksPage({ curriculum, state, stats }: TasksPageProps) {
  const [category, setCategory] = useState<string>('全部');
  const [query, setQuery] = useState<string>('');

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(curriculum.tasks.map((t) => t.category)))],
    [curriculum.tasks]
  );

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return curriculum.tasks.filter((task) => {
      if (category !== '全部' && task.category !== category) return false;
      if (!q) return true;
      return (
        task.title.toLowerCase().includes(q) ||
        task.summary.toLowerCase().includes(q) ||
        task.category.toLowerCase().includes(q) ||
        task.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [category, curriculum.tasks, query]);

  return (
    <div className="space-y-8">
      {/* Editorial Banner */}
      <section className="overflow-hidden rounded-2xl border border-[#DFDFD8] bg-white">
        <div className="grid lg:grid-cols-12 items-stretch">
          <div className="flex flex-col justify-center p-7 sm:p-9 lg:col-span-7">
            <div className="text-xs font-medium tracking-[0.14em] text-[#666A63]">
              TASK LABORATORY · 6 个真实工作任务包
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916]">
              任务实验室
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-[#575B56] sm:text-base">
              每个任务都配有可直接复制的任务说明模板、教学示例与四项验收标准。先跟做一遍熟悉结构，再换上你自己的真实材料完成独立交付。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-6 text-xs text-[#666A63]">
              <span>
                已验收成果：
                <strong className="ml-1 font-mono text-sm tabular-nums text-[#0D5C4B]">
                  {stats.completedTasksCount}/{curriculum.tasks.length}
                </strong>
              </span>
              <span>
                进行中草稿：
                <strong className="ml-1 font-mono text-sm tabular-nums text-[#171916]">
                  {stats.draftsCount}
                </strong>
              </span>
            </div>
          </div>

          <div className="relative min-h-[200px] border-t border-[#E2E3DD] bg-[#EFEFEA] lg:col-span-5 lg:border-t-0 lg:border-l">
            <img
              src="/src/assets/images/banner_task_lab_1794840698152.jpg"
              alt="任务实验室工作桌与结构化笔记本"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Filter + Search Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div
          role="tablist"
          aria-label="任务分类筛选"
          className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[#DFDFD8] bg-[#EFEFEA] p-1"
        >
          {categories.map((cat) => {
            const active = category === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white text-[#171916] shadow-xs'
                    : 'text-[#575B56] hover:text-[#171916]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#6B7068]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索任务或能力关键词..."
            aria-label="搜索任务"
            className="w-full rounded-lg border border-[#D8D9D1] bg-white py-2 pr-3 pl-9 text-sm text-[#171916] placeholder:text-[#8E9289] focus:border-[#0D5C4B] focus:outline-none"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-[#DFDFD8] bg-white p-10 text-center">
          <p className="font-serif text-lg font-medium text-[#171916]">
            没有匹配的任务
          </p>
          <p className="mt-1 text-sm text-[#5C605A]">
            试试切换分类或清空搜索关键词。
          </p>
          <button
            type="button"
            onClick={() => {
              setCategory('全部');
              setQuery('');
            }}
            className="mt-4 rounded-lg border border-[#D8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#171916] hover:bg-[#F5F5F0]"
          >
            重置筛选
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredTasks.map((task) => {
            const isCompleted = stats.completedTaskIds.includes(task.id);
            const isDraft = stats.draftTaskIds.includes(task.id);
            const rec = state.tasks[task.id];

            return (
              <article
                key={task.id}
                className="flex flex-col justify-between rounded-2xl border border-[#DFDFD8] bg-white p-6 transition-colors hover:border-[#C2C4BA]"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs text-[#666A63]">
                    <span>
                      {task.category} · {task.minutes} 分钟 · {task.level}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-[#0D5C4B]">
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>已验收成果</span>
                      </span>
                    ) : isDraft ? (
                      <span className="font-semibold text-[#B45309]">
                        练习草稿中
                      </span>
                    ) : rec?.walkthroughCompleted ? (
                      <span className="text-[#474B45]">已体验示例</span>
                    ) : null}
                  </div>

                  <h2 className="mt-3 font-serif text-xl font-semibold text-[#171916]">
                    {task.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#575B56]">
                    {task.summary}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#ECECE6] pt-4">
                  <span className="truncate text-xs text-[#6B7068]">
                    训练能力：{task.skills.join(' / ')}
                  </span>
                  <a
                    href={`#/task/${task.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D5C4B] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#09473A] whitespace-nowrap shrink-0"
                  >
                    <span>{isCompleted ? '查看成果' : '开始任务'}</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
