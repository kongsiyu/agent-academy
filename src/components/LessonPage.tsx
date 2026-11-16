import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  XCircle,
} from 'lucide-react';
import type {
  CurriculumContent,
  LearningState,
} from '../types/academy';

interface LessonPageProps {
  lessonId: string;
  curriculum: CurriculumContent;
  state: LearningState;
  onSubmitQuiz: (lessonId: string, selectedIndex: number) => boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export function LessonPage({
  lessonId,
  curriculum,
  state,
  onSubmitQuiz,
}: LessonPageProps) {
  const lessonIndex = curriculum.lessons.findIndex((l) => l.id === lessonId);
  const lesson = curriculum.lessons[lessonIndex] || curriculum.lessons[0];
  const mod = curriculum.modules.find((m) => m.id === lesson.moduleId);
  const weekLessons = curriculum.lessons.filter(
    (l) => l.moduleId === lesson.moduleId
  );
  const nextLesson =
    lessonIndex >= 0 && lessonIndex + 1 < curriculum.lessons.length
      ? curriculum.lessons[lessonIndex + 1]
      : null;

  const relatedTasks = curriculum.tasks.filter((t) =>
    t.lessonIds.includes(lesson.id)
  );

  const savedProgress = state.lessons[lesson.id];
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    savedProgress?.selectedIndex ?? null
  );
  const [submittedState, setSubmittedState] = useState<
    'idle' | 'correct' | 'wrong'
  >(savedProgress?.passed ? 'correct' : 'idle');

  useEffect(() => {
    const rec = state.lessons[lesson.id];
    setSelectedIndex(rec?.selectedIndex ?? null);
    setSubmittedState(rec?.passed ? 'correct' : 'idle');
  }, [lesson.id, state.lessons]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex === null) return;
    const ok = onSubmitQuiz(lesson.id, selectedIndex);
    setSubmittedState(ok ? 'correct' : 'wrong');
  };

  return (
    <div className="space-y-8">
      <div>
        <a
          href="#/route"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#575B56] hover:text-[#171916]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>返回学习路线</span>
        </a>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Main Editorial Lesson Column */}
        <article className="space-y-8 lg:col-span-8">
          <header className="border-b border-[#E2E3DD] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#666A63]">
              <span>
                第 {mod?.week ?? 1} 周 · {mod?.title}
              </span>
              <span aria-hidden="true">·</span>
              <span>{lesson.skill}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{lesson.minutes} 分钟</span>
              {savedProgress?.passed && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-[#0D5C4B]">已掌握</span>
                </>
              )}
            </div>

            <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-[#171916]">
              {lesson.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-[#575B56]">
              {lesson.summary}
            </p>
          </header>

          {/* Numbered Teaching Blocks */}
          <div className="divide-y divide-[#E2E3DD] rounded-2xl border border-[#DFDFD8] bg-white">
            {lesson.blocks.map((block, index) => (
              <section key={block.title} className="p-6 sm:p-8">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-[#0D5C4B]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h2 className="font-serif text-xl font-semibold text-[#171916]">
                    {block.title}
                  </h2>
                </div>
                <p className="mt-3 pl-0 text-[15px] leading-[1.75] text-[#373B35] sm:pl-8">
                  {block.text}
                </p>
              </section>
            ))}
          </div>

          {/* Interactive Comprehension Quiz */}
          <section
            aria-labelledby="quiz-heading"
            className="rounded-2xl border border-[#DFDFD8] bg-white p-6 sm:p-8"
          >
            <div className="text-xs font-semibold tracking-wider text-[#0D5C4B]">
              CHECK YOUR UNDERSTANDING · 随堂判断
            </div>
            <h2
              id="quiz-heading"
              className="mt-2 font-serif text-xl font-semibold text-[#171916]"
            >
              {lesson.quiz.question}
            </h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              <fieldset className="space-y-2.5">
                <legend className="sr-only">{lesson.quiz.question}</legend>
                {lesson.quiz.options.map((option, idx) => {
                  const isSelected = selectedIndex === idx;
                  const isCorrectOption = idx === lesson.quiz.answerIndex;
                  const showCorrectHighlight =
                    submittedState === 'correct' && isCorrectOption;
                  const showWrongHighlight =
                    submittedState === 'wrong' && isSelected;

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors ${
                        showCorrectHighlight
                          ? 'border-[#0D5C4B] bg-[#0D5C4B]/[0.05]'
                          : showWrongHighlight
                            ? 'border-[#B91C1C] bg-[#B91C1C]/[0.04]'
                            : isSelected
                              ? 'border-[#171916] bg-[#FAF9F6]'
                              : 'border-[#E2E3DD] bg-white hover:border-[#C2C4BA]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${lesson.id}`}
                        value={idx}
                        checked={isSelected}
                        onChange={() => {
                          setSelectedIndex(idx);
                          if (submittedState === 'wrong') {
                            setSubmittedState('idle');
                          }
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold ${
                          showCorrectHighlight
                            ? 'bg-[#0D5C4B] text-white'
                            : showWrongHighlight
                              ? 'bg-[#B91C1C] text-white'
                              : isSelected
                                ? 'bg-[#171916] text-white'
                                : 'bg-[#EFEFEA] text-[#474B45]'
                        }`}
                      >
                        {OPTION_LETTERS[idx] ?? idx + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-[#171916]">
                        {option}
                      </span>
                    </label>
                  );
                })}
              </fieldset>

              {submittedState === 'correct' && (
                <div
                  role="status"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-[#0D5C4B]/25 bg-[#0D5C4B]/[0.05] p-4 text-sm text-[#143D32]"
                >
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#0D5C4B]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-semibold">判断正确，本课已掌握</div>
                    <p className="mt-1 leading-relaxed text-[#255246]">
                      {lesson.quiz.explanation}
                    </p>
                  </div>
                </div>
              )}

              {submittedState === 'wrong' && (
                <div
                  role="alert"
                  className="mt-4 flex items-start gap-3 rounded-xl border border-[#B91C1C]/25 bg-[#B91C1C]/[0.05] p-4 text-sm text-[#7F1D1D]"
                >
                  <XCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#B91C1C]"
                    aria-hidden="true"
                  />
                  <div>
                    <div className="font-semibold">这一项还不够稳妥</div>
                    <p className="mt-1 leading-relaxed">
                      再想一想：好的初次练习需要“输入清楚、输出可描述、结果容易核对”。重新选择一个选项试试看。
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
                <button
                  type="submit"
                  disabled={selectedIndex === null}
                  className="rounded-lg bg-[#0D5C4B] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#09473A] disabled:cursor-not-allowed disabled:bg-[#C8CBC3]"
                >
                  {savedProgress?.passed ? '重新验证答案' : '提交答案并完成本课'}
                </button>

                {nextLesson && (
                  <a
                    href={`#/lesson/${nextLesson.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D5C4B] hover:underline"
                  >
                    <span>下一课：{nextLesson.title}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </form>
          </section>
        </article>

        {/* Right Sidebar: Week Syllabus & Related Tasks */}
        <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
            <div className="text-xs font-medium text-[#666A63]">
              第 {mod?.week ?? 1} 周目录
            </div>
            <h3 className="mt-1 font-serif text-lg font-semibold text-[#171916]">
              {mod?.title}
            </h3>

            <nav aria-label="本周课程" className="mt-4 space-y-1.5">
              {weekLessons.map((item) => {
                const isCurrent = item.id === lesson.id;
                const isPassed = Boolean(state.lessons[item.id]?.passed);
                return (
                  <a
                    key={item.id}
                    href={`#/lesson/${item.id}`}
                    className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      isCurrent
                        ? 'bg-[#EFEFEA] font-semibold text-[#171916]'
                        : 'text-[#525650] hover:bg-[#FAF9F6] hover:text-[#171916]'
                    }`}
                  >
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        isPassed ? 'text-[#0D5C4B]' : 'text-[#D0D2C9]'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="leading-snug">{item.title}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="rounded-2xl border border-[#DFDFD8] bg-white p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D5C4B]">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              <span>把方法用起来</span>
            </div>
            <h3 className="mt-1.5 font-serif text-lg font-semibold text-[#171916]">
              关联实战任务
            </h3>

            {relatedTasks.length > 0 ? (
              <div className="mt-4 divide-y divide-[#ECECE6]">
                {relatedTasks.map((task) => (
                  <a
                    key={task.id}
                    href={`#/task/${task.id}`}
                    className="group block py-3 first:pt-0 last:pb-0"
                  >
                    <div className="text-xs text-[#666A63]">
                      {task.category} · {task.minutes} 分钟
                    </div>
                    <div className="mt-1 flex items-center justify-between gap-2 text-sm font-semibold text-[#171916] group-hover:text-[#0D5C4B]">
                      <span>{task.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="mt-3">
                <p className="text-xs leading-relaxed text-[#5C605A]">
                  到任务实验室选一件你手头正在做的工作，立刻实战一次。
                </p>
                <a
                  href="#/tasks"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D5C4B] hover:underline"
                >
                  <span>打开任务实验室</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
