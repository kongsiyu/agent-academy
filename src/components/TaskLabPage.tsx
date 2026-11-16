import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react';
import type {
  CurriculumContent,
  LearningState,
  TaskMode,
  TaskProgress,
} from '../types/academy';
import {
  buildFilledPrompt,
  createBlankTaskProgress,
  isTaskCompleted,
} from '../utils/academyCore';

interface TaskLabPageProps {
  taskId: string;
  curriculum: CurriculumContent;
  state: LearningState;
  onSetMode: (taskId: string, mode: TaskMode) => void;
  onSetStep: (taskId: string, stepIndex: number) => void;
  onUpdateProgress: (
    taskId: string,
    updater: (current: TaskProgress) => Partial<TaskProgress>
  ) => void;
  onToggleCriterion: (
    taskId: string,
    criterionId: string,
    checked: boolean
  ) => void;
  onCompletePractice: (taskId: string) => { ok: boolean; error?: string };
  onCompleteWalkthrough: (taskId: string) => void;
  onShowToast: (msg: string) => void;
}

export function TaskLabPage({
  taskId,
  curriculum,
  state,
  onSetMode,
  onSetStep,
  onUpdateProgress,
  onToggleCriterion,
  onCompletePractice,
  onCompleteWalkthrough,
  onShowToast,
}: TaskLabPageProps) {
  const task =
    curriculum.tasks.find((t) => t.id === taskId) || curriculum.tasks[0];
  const progress =
    state.tasks[task.id] || createBlankTaskProgress(task);
  const completed = isTaskCompleted(task, progress);
  const relatedLessons = curriculum.lessons.filter((l) =>
    task.lessonIds.includes(l.id)
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const stepIndex = Math.max(
    0,
    Math.min(progress.stepIndex, task.checkpoints.length - 1)
  );
  const activeStep = task.checkpoints[stepIndex];
  const checkedCount = task.criteria.filter(
    (c) => progress.checks[c.id]
  ).length;

  const copyText = async (key: string, text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      onShowToast(`已复制${label}`);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      onShowToast('复制失败，请手动选中文本复制');
    }
  };

  const filledPrompt = buildFilledPrompt(task, progress.input);
  const sampleFilledPrompt = buildFilledPrompt(task, task.sampleInput);

  const handlePublishPractice = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onCompletePractice(task.id);
    if (!res.ok) {
      setPracticeError(res.error || '请完善结果并完成所有验收检查。');
    } else {
      setPracticeError(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <a
          href="#/tasks"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#575B56] hover:text-[#171916]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>返回任务实验室</span>
        </a>
      </div>

      {/* Task Header + Mode Switcher */}
      <section className="flex flex-col justify-between gap-6 border-b border-[#E2E3DD] pb-6 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#666A63]">
            <span>{task.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{task.minutes} 分钟</span>
            <span aria-hidden="true">·</span>
            <span>{task.level}</span>
            {completed && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#0D5C4B]">
                  已收入成果库
                </span>
              </>
            )}
          </div>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916]">
            {task.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#575B56] sm:text-base">
            {task.summary}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="练习模式切换"
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-xl border border-[#DFDFD8] bg-[#EFEFEA] p-1 lg:self-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={progress.mode === 'walkthrough'}
            onClick={() => onSetMode(task.id, 'walkthrough')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              progress.mode === 'walkthrough'
                ? 'bg-white text-[#171916] shadow-xs'
                : 'text-[#575B56] hover:text-[#171916]'
            }`}
          >
            示例跟做
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={progress.mode === 'practice'}
            onClick={() => onSetMode(task.id, 'practice')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              progress.mode === 'practice'
                ? 'bg-white text-[#171916] shadow-xs'
                : 'text-[#575B56] hover:text-[#171916]'
            }`}
          >
            独立练习
          </button>
        </div>
      </section>

      {/* Main Split: Workbench + Guidance Rail */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Workbench */}
        <div className="space-y-6 lg:col-span-8">
          {progress.mode === 'walkthrough' ? (
            <>
              {/* 4-Step Guided Checkpoints */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {task.checkpoints.map((cp, idx) => {
                  const active = idx === stepIndex;
                  const done = idx < stepIndex || progress.walkthroughCompleted;
                  return (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => onSetStep(task.id, idx)}
                      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors ${
                        active
                          ? 'border-[#0D5C4B] bg-white ring-1 ring-[#0D5C4B]/20'
                          : 'border-[#DFDFD8] bg-[#FAF9F6] hover:bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums ${
                          active
                            ? 'bg-[#0D5C4B] text-white'
                            : done
                              ? 'bg-[#0D5C4B]/15 text-[#0D5C4B]'
                              : 'bg-[#E6E6DF] text-[#575B56]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="truncate text-xs font-semibold text-[#171916]">
                        {cp.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Card */}
              <div className="rounded-2xl border border-[#DFDFD8] bg-white p-6 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wider text-[#0D5C4B]">
                    示例体验 · 第 {stepIndex + 1}/{task.checkpoints.length} 步
                  </span>
                  <span className="text-xs text-[#6B7068]">
                    示例体验不计入独立成果数
                  </span>
                </div>
                <h2 className="mt-2 font-serif text-xl font-semibold text-[#171916]">
                  {activeStep.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[#575B56]">
                  {activeStep.description}
                </p>

                {/* Step-specific Interactive Material */}
                {stepIndex === 0 && (
                  <div className="mt-6 space-y-5">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[#666A63]">
                        本次任务的验收标准（先看标准再动手）
                      </h3>
                      <ul className="mt-2.5 space-y-2 rounded-xl border border-[#ECECE6] bg-[#FAF9F6] p-4">
                        {task.criteria.map((c) => (
                          <li
                            key={c.id}
                            className="flex items-start gap-2.5 text-sm text-[#373B35]"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0D5C4B]" />
                            <span>{c.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs font-semibold tracking-wide text-[#666A63]">
                          教学示例输入资料
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            copyText('sampleInput', task.sampleInput, '示例资料')
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D5C4B] hover:underline"
                        >
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>
                            {copiedKey === 'sampleInput' ? '已复制' : '复制示例资料'}
                          </span>
                        </button>
                      </div>
                      <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#2D302B]">
                        {task.sampleInput}
                      </pre>
                    </div>
                  </div>
                )}

                {stepIndex === 1 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-semibold tracking-wide text-[#666A63]">
                        已拼装完成的示例任务说明（可直接发给任意 Agent 测试）
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            'samplePrompt',
                            sampleFilledPrompt,
                            '完整示例指令'
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D9D1] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171916] hover:bg-[#EFEFEA]"
                      >
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {copiedKey === 'samplePrompt' ? '已复制' : '复制完整指令'}
                        </span>
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#2D302B]">
                      {sampleFilledPrompt}
                    </pre>
                  </div>
                )}

                {stepIndex === 2 && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[#666A63]">
                        原始输入资料
                      </h3>
                      <pre className="mt-2 h-full max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#373B35]">
                        {task.sampleInput}
                      </pre>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[#0D5C4B]">
                        参考交付结果（注意看依据标注与未知保留）
                      </h3>
                      <pre className="mt-2 h-full max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#0D5C4B]/25 bg-[#0D5C4B]/[0.03] p-4 font-mono text-xs leading-relaxed text-[#171916]">
                        {task.sampleOutput}
                      </pre>
                    </div>
                  </div>
                )}

                {stepIndex === 3 && (
                  <div className="mt-6 space-y-5">
                    <div className="rounded-xl border border-[#0D5C4B]/20 bg-[#0D5C4B]/[0.04] p-5">
                      <h3 className="text-sm font-semibold text-[#171916]">
                        下一步：用自己的真实工作资料试一次
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#474B45]">
                        示例已经演示了清晰的要求与验收方式。点击下方按钮切换到「独立练习」，把你自己的会议记录、表格或文档放进去，带回 Agent 的结果并逐项验收，即可沉淀成你的个人成果。
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold tracking-wide text-[#666A63]">
                        可复用的指令模板
                      </h3>
                      <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#2D302B]">
                        {task.prompt}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Stepper Footer Navigation */}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#ECECE6] pt-5">
                  <button
                    type="button"
                    disabled={stepIndex === 0}
                    onClick={() => onSetStep(task.id, stepIndex - 1)}
                    className="rounded-lg border border-[#D8D9D1] bg-white px-4 py-2 text-xs font-medium text-[#373B35] hover:bg-[#FAF9F6] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    上一步
                  </button>

                  {stepIndex < task.checkpoints.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => onSetStep(task.id, stepIndex + 1)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D5C4B] px-5 py-2 text-xs font-medium text-white hover:bg-[#09473A]"
                    >
                      <span>下一步：{task.checkpoints[stepIndex + 1].title}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onCompleteWalkthrough(task.id)}
                        className="rounded-lg border border-[#0D5C4B] bg-white px-4 py-2 text-xs font-medium text-[#0D5C4B] hover:bg-[#0D5C4B]/[0.05]"
                      >
                        标记示例已完成
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onCompleteWalkthrough(task.id);
                          onSetMode(task.id, 'practice');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D5C4B] px-5 py-2 text-xs font-medium text-white hover:bg-[#09473A]"
                      >
                        <span>进入独立练习</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Independent Practice Mode */
            <form onSubmit={handlePublishPractice} className="space-y-6">
              {/* Step 1: User Input Material */}
              <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#0D5C4B]">
                      01 · 准备输入资料
                    </span>
                    <h2 className="mt-1 font-serif text-lg font-semibold text-[#171916]">
                      粘贴你要处理的真实材料
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateProgress(task.id, () => ({
                        input: task.sampleInput,
                      }))
                    }
                    className="text-xs font-medium text-[#0D5C4B] hover:underline"
                  >
                    填入示例材料试试看
                  </button>
                </div>

                <label htmlFor="practice-input" className="sr-only">
                  输入材料
                </label>
                <textarea
                  id="practice-input"
                  rows={5}
                  value={progress.input}
                  onChange={(e) =>
                    onUpdateProgress(task.id, () => ({ input: e.target.value }))
                  }
                  placeholder="在这里粘贴你的工作原文、会议记录、数据摘要或待审文稿（草稿自动保存在本地）..."
                  className="mt-3 w-full rounded-xl border border-[#D8D9D1] bg-[#FAF9F6] p-3.5 text-sm leading-relaxed text-[#171916] placeholder:text-[#8E9289] focus:border-[#0D5C4B] focus:bg-white focus:outline-none"
                />
              </section>

              {/* Step 2: Generated Prompt to Copy */}
              <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs font-semibold text-[#0D5C4B]">
                      02 · 交代任务给你的 Agent
                    </span>
                    <h2 className="mt-1 font-serif text-lg font-semibold text-[#171916]">
                      复制组装好的任务说明
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      copyText('practicePrompt', filledPrompt, '任务说明')
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#171916] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#2F332E] whitespace-nowrap"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      {copiedKey === 'practicePrompt'
                        ? '已复制任务说明'
                        : '复制完整任务说明'}
                    </span>
                  </button>
                </div>

                <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#E2E3DD] bg-[#FAF9F6] p-4 font-mono text-xs leading-relaxed text-[#2D302B]">
                  {filledPrompt}
                </pre>
              </section>

              {/* Step 3: Paste Output & Verify Criteria */}
              <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6 space-y-5">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0D5C4B]">
                    03 · 带回结果并逐项验收
                  </span>
                  <h2 className="mt-1 font-serif text-lg font-semibold text-[#171916]">
                    粘贴 Agent 返回结果并核对标准
                  </h2>
                </div>

                <div>
                  <label
                    htmlFor="practice-output"
                    className="block text-xs font-medium text-[#5C605A]"
                  >
                    Agent 返回结果（必填）
                  </label>
                  <textarea
                    id="practice-output"
                    rows={6}
                    value={progress.output}
                    onChange={(e) => {
                      setPracticeError(null);
                      onUpdateProgress(task.id, () => ({
                        output: e.target.value,
                      }));
                    }}
                    placeholder="把 Agent 生成的结果粘贴到这里，然后对照下方验收标准逐条核对与修改..."
                    className="mt-2 w-full rounded-xl border border-[#D8D9D1] bg-[#FAF9F6] p-3.5 text-sm leading-relaxed text-[#171916] placeholder:text-[#8E9289] focus:border-[#0D5C4B] focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#171916]">
                      验收检查表（需全部确认）
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[#0D5C4B]">
                      {checkedCount}/{task.criteria.length}
                    </span>
                  </div>
                  <div className="mt-2.5 divide-y divide-[#ECECE6] rounded-xl border border-[#E2E3DD] bg-[#FAF9F6]">
                    {task.criteria.map((c) => {
                      const checked = Boolean(progress.checks[c.id]);
                      return (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-start gap-3 p-3.5 transition-colors hover:bg-white"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              setPracticeError(null);
                              onToggleCriterion(
                                task.id,
                                c.id,
                                e.target.checked
                              );
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-[#C2C4BA] accent-[#0D5C4B]"
                          />
                          <span
                            className={`text-sm leading-snug ${
                              checked
                                ? 'font-medium text-[#171916]'
                                : 'text-[#474B45]'
                            }`}
                          >
                            {c.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="practice-reflection"
                    className="block text-xs font-medium text-[#5C605A]"
                  >
                    复盘与修改记录（选填，便于下次复用）
                  </label>
                  <input
                    id="practice-reflection"
                    type="text"
                    value={progress.reflection}
                    onChange={(e) =>
                      onUpdateProgress(task.id, () => ({
                        reflection: e.target.value,
                      }))
                    }
                    placeholder="例如：补充了会议日期参照后，相对时间不再换算错误"
                    className="mt-2 w-full rounded-xl border border-[#D8D9D1] bg-[#FAF9F6] px-3.5 py-2.5 text-sm text-[#171916] placeholder:text-[#8E9289] focus:border-[#0D5C4B] focus:bg-white focus:outline-none"
                  />
                </div>

                {practiceError && (
                  <div
                    role="alert"
                    className="flex items-center gap-2 rounded-xl border border-[#B91C1C]/25 bg-[#B91C1C]/[0.05] px-4 py-3 text-xs font-medium text-[#7F1D1D]"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#B91C1C]" />
                    <span>{practiceError}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ECECE6] pt-4">
                  <span className="text-xs text-[#666A63]">
                    草稿已自动保存在本机，随时可继续编辑
                  </span>
                  <div className="flex items-center gap-3">
                    {completed && (
                      <a
                        href="#/artifacts"
                        className="text-xs font-semibold text-[#0D5C4B] hover:underline"
                      >
                        在我的成果中查看
                      </a>
                    )}
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0D5C4B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#09473A]"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {completed ? '更新已验收成果' : '完成验收并收入成果库'}
                      </span>
                    </button>
                  </div>
                </div>
              </section>
            </form>
          )}
        </div>

        {/* Right Contextual Rail */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          {progress.mode === 'walkthrough' && (
            <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
              <div className="text-xs font-semibold text-[#0D5C4B]">
                这一步的小提示
              </div>
              <div className="mt-1.5 text-sm font-semibold text-[#171916]">
                {activeStep.title}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-[#575B56]">
                {activeStep.tip}
              </p>
            </div>
          )}

          {/* Pitfalls */}
          <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
            <h3 className="font-serif text-base font-semibold text-[#171916]">
              卡住了？常见偏差与改法
            </h3>
            <div className="mt-3.5 divide-y divide-[#ECECE6]">
              {task.pitfalls.map((p) => (
                <div key={p.problem} className="py-3 first:pt-0 last:pb-0">
                  <div className="text-xs font-semibold text-[#991B1B]">
                    常见情况：{p.problem}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#474B45]">
                    修正方法：{p.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Extension Challenges */}
          <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666A63]">
              <Sparkles className="h-3.5 w-3.5 text-[#B45309]" />
              <span>进阶挑战</span>
            </div>
            <div className="mt-3 divide-y divide-[#ECECE6]">
              {task.challenges.map((ch) => (
                <div key={ch.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="text-sm font-semibold text-[#171916]">
                    {ch.title}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#5C605A]">
                    {ch.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Lessons */}
          <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#666A63]">
              <BookOpen className="h-3.5 w-3.5 text-[#0D5C4B]" />
              <span>背后对应的方法课</span>
            </div>
            <div className="mt-3 space-y-2">
              {relatedLessons.map((lesson) => (
                <a
                  key={lesson.id}
                  href={`#/lesson/${lesson.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[#ECECE6] bg-[#FAF9F6] px-3 py-2 text-xs font-medium text-[#171916] hover:border-[#0D5C4B] hover:text-[#0D5C4B]"
                >
                  <span className="truncate">{lesson.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
