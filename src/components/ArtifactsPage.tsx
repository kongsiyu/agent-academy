import { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  FileText,
} from 'lucide-react';
import type {
  AcademyStats,
  CurriculumContent,
  LearningState,
} from '../types/academy';
import {
  buildArtifactMarkdown,
  isTaskCompleted,
  isTaskDraft,
} from '../utils/academyCore';

interface ArtifactsPageProps {
  curriculum: CurriculumContent;
  state: LearningState;
  stats: AcademyStats;
  onShowToast: (msg: string) => void;
}

type ArtifactFilter = 'all' | 'completed' | 'draft';

export function ArtifactsPage({
  curriculum,
  state,
  stats,
  onShowToast,
}: ArtifactsPageProps) {
  const [filter, setFilter] = useState<ArtifactFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const items = curriculum.tasks
    .map((task) => {
      const progress = state.tasks[task.id];
      const completed = isTaskCompleted(task, progress);
      const draft = isTaskDraft(task, progress);
      return { task, progress, completed, draft };
    })
    .filter((item) => {
      if (filter === 'completed') return item.completed;
      if (filter === 'draft') return item.draft;
      return item.completed || item.draft;
    });

  const handleCopyMarkdown = async (
    taskTitle: string,
    md: string
  ) => {
    try {
      await navigator.clipboard.writeText(md);
      onShowToast(`已复制《${taskTitle}》Markdown 归档`);
    } catch {
      onShowToast('复制失败，请稍后再试');
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-6 border-b border-[#E2E3DD] pb-7 sm:flex-row sm:items-end">
        <div>
          <div className="text-xs font-medium tracking-[0.14em] text-[#666A63]">
            YOUR WORK, YOUR PROGRESS · 个人成果库
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916]">
            学到的方法，做成的成果。
          </h1>
          <p className="mt-2 text-sm text-[#575B56] sm:text-base">
            <span className="font-mono font-semibold tabular-nums text-[#0D5C4B]">
              {stats.completedTasksCount}
            </span>{' '}
            个已验收独立成果 ·{' '}
            <span className="font-mono font-semibold tabular-nums text-[#171916]">
              {stats.draftsCount}
            </span>{' '}
            份进行中的练习草稿。保留每一次尝试，也看见每一次进步。
          </p>
        </div>

        <a
          href="#/settings"
          className="inline-flex items-center gap-2 rounded-lg border border-[#D8D9D1] bg-white px-4 py-2 text-xs font-medium text-[#171916] hover:bg-[#FAF9F6] whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Download className="h-3.5 w-3.5 text-[#0D5C4B]" aria-hidden="true" />
          <span>备份全部记录</span>
        </a>
      </section>

      {stats.completedTasksCount + stats.draftsCount === 0 ? (
        <section className="overflow-hidden rounded-2xl border border-[#DFDFD8] bg-white">
          <div className="grid items-stretch lg:grid-cols-12">
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-7">
              <h2 className="font-serif text-2xl font-semibold text-[#171916]">
                你的第一份成果，从这里开始。
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#575B56] sm:text-base">
                在任务实验室选一个贴近日常工作的任务，换上你自己的真实材料。保存的草稿与通过四项标准验收的成果，都会沉淀在这里方便随时导出复用。
              </p>
              <div className="mt-6">
                <a
                  href="#/tasks"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0D5C4B] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#09473A]"
                >
                  <span>去任务实验室</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="relative min-h-[220px] border-t border-[#E2E3DD] bg-[#EFEFEA] lg:col-span-5 lg:border-t-0 lg:border-l">
              <img
                src="/src/assets/images/empty_artifacts_desk_1794840698378.jpg"
                alt="静谧学习书桌与笔记本"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="筛选成果与草稿"
            className="inline-flex items-center gap-1 rounded-xl border border-[#DFDFD8] bg-[#EFEFEA] p-1"
          >
            {(
              [
                { id: 'all', label: '全部记录' },
                { id: 'completed', label: '已验收成果' },
                { id: 'draft', label: '练习草稿' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={filter === tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-white text-[#171916] shadow-xs'
                    : 'text-[#575B56] hover:text-[#171916]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-[#DFDFD8] bg-white p-8 text-center text-sm text-[#5C605A]">
              当前筛选下暂无记录。
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(({ task, progress, completed }) => {
                const isExpanded = expandedId === task.id;
                const md = buildArtifactMarkdown(task, progress);
                return (
                  <article
                    key={task.id}
                    className="rounded-2xl border border-[#DFDFD8] bg-white p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-[#666A63]">
                          <span>{task.category}</span>
                          <span aria-hidden="true">·</span>
                          {completed ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#0D5C4B]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>
                                已验收 ·{' '}
                                {progress.completedAt?.slice(0, 10) || ''}
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-[#B45309]">
                              <FileText className="h-3.5 w-3.5" />
                              <span>练习草稿</span>
                            </span>
                          )}
                        </div>
                        <h2 className="mt-2 font-serif text-xl font-semibold text-[#171916]">
                          {task.title}
                        </h2>
                        {progress.reflection && (
                          <p className="mt-1.5 text-sm text-[#575B56]">
                            复盘笔记：{progress.reflection}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyMarkdown(task.title, md)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D9D1] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171916] hover:bg-[#EFEFEA]"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>复制 Markdown</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(isExpanded ? null : task.id)
                          }
                          className="rounded-lg border border-[#D8D9D1] bg-white px-3 py-1.5 text-xs font-medium text-[#171916] hover:bg-[#FAF9F6]"
                        >
                          {isExpanded ? '收起内容' : '展开详情'}
                        </button>
                        <a
                          href={`#/task/${task.id}`}
                          className="rounded-lg bg-[#0D5C4B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#09473A]"
                        >
                          继续编辑
                        </a>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 grid gap-4 border-t border-[#ECECE6] pt-5 md:grid-cols-2">
                        <div>
                          <div className="text-xs font-semibold text-[#666A63]">
                            输入材料
                          </div>
                          <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#373B35]">
                            {progress.input.trim() || '（未填写输入材料）'}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#0D5C4B]">
                            Agent 输出结果
                          </div>
                          <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#171916]">
                            {progress.output.trim() || '（尚未填写输出结果）'}
                          </pre>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
