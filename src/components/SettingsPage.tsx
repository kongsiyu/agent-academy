import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Download,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  AcademyStats,
  CurriculumContent,
  LearningState,
} from '../types/academy';
import {
  computeAcademyStats,
  formatShortChineseDate,
  validateAndNormalizeState,
} from '../utils/academyCore';

interface SettingsPageProps {
  curriculum: CurriculumContent;
  state: LearningState;
  stats: AcademyStats;
  onOpenGoalModal: () => void;
  onImportBackup: (nextState: LearningState) => void;
  onResetAll: () => void;
  onShowToast: (msg: string) => void;
}

export function SettingsPage({
  curriculum,
  state,
  stats,
  onOpenGoalModal,
  onImportBackup,
  onResetAll,
  onShowToast,
}: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingRestore, setPendingRestore] = useState<{
    state: LearningState;
    stats: AcademyStats;
    filename: string;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleExport = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qicheng-agent-academy-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    onShowToast('已导出完整学习记录备份');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validated = validateAndNormalizeState(parsed, curriculum, {
        strict: true,
      });
      const previewStats = computeAcademyStats(validated, curriculum);
      setPendingRestore({
        state: validated,
        stats: previewStats,
        filename: file.name,
      });
      setImportError(null);
    } catch (err) {
      setPendingRestore(null);
      setImportError(
        err instanceof Error
          ? err.message
          : '无法读取备份文件，请确认它是有效的 JSON 备份。'
      );
    }
  };

  return (
    <div className="space-y-8">
      <section className="border-b border-[#E2E3DD] pb-7">
        <div className="text-xs font-medium tracking-[0.14em] text-[#666A63]">
          MAKE IT YOURS · 本地设置与备份
        </div>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#171916]">
          按自己的节奏，学会新方法。
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#575B56] sm:text-base">
          设置目标、安排投入，也照顾好自己的学习记录。所有资料仅在你的浏览器本地保存。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan Card */}
        <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-serif text-xl font-semibold text-[#171916]">
              我的学习计划
            </h2>
            <button
              type="button"
              onClick={onOpenGoalModal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8D9D1] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#171916] hover:bg-[#EFEFEA]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#0D5C4B]" />
              <span>调整目标与节奏</span>
            </button>
          </div>

          <dl className="mt-5 divide-y divide-[#ECECE6] text-sm">
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#666A63]">当前目标</dt>
              <dd className="font-semibold text-[#171916]">{stats.goal.title}</dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#666A63]">岗位方向</dt>
              <dd className="font-medium text-[#171916]">
                {state.profile.roleTrack}
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#666A63]">每周投入</dt>
              <dd className="font-mono tabular-nums text-[#171916]">
                {state.profile.weeklyMinutes} 分钟
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#666A63]">目标要求</dt>
              <dd className="font-mono tabular-nums text-[#171916]">
                {stats.goal.targetLessons} 节课 + {stats.goal.targetTasks} 个成果
              </dd>
            </div>
            <div className="flex items-center justify-between py-3">
              <dt className="text-[#666A63]">开始日期</dt>
              <dd className="font-mono tabular-nums text-[#171916]">
                {formatShortChineseDate(state.profile.startDate)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-[#666A63]">
            调整目标不会清空已经掌握的课程和验收成果。
          </p>
        </section>

        {/* Data & Backup */}
        <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6">
          <h2 className="font-serif text-xl font-semibold text-[#171916]">
            数据与备份
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#575B56]">
            本工具无需登录，学习进度与练习文本均保存在当前浏览器。更换设备或清理缓存前，建议先导出一份完整备份。
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0D5C4B] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#09473A]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>导出完整备份</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D8D9D1] bg-white px-4 py-2.5 text-xs font-medium text-[#171916] hover:bg-[#FAF9F6]"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>从备份恢复</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileChange}
              className="sr-only"
              aria-label="选择 JSON 备份文件"
            />
          </div>

          {importError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-[#B91C1C]/25 bg-[#B91C1C]/[0.05] p-3.5 text-xs text-[#7F1D1D]"
            >
              {importError}
            </div>
          )}

          {pendingRestore && (
            <div className="mt-4 rounded-xl border border-[#0D5C4B]/30 bg-[#0D5C4B]/[0.04] p-4">
              <div className="text-xs font-semibold text-[#0D5C4B]">
                备份校验通过 · {pendingRestore.filename}
              </div>
              <p className="mt-1.5 text-xs text-[#373B35]">
                包含目标「{pendingRestore.stats.goal.title}」，已掌握{' '}
                {pendingRestore.stats.passedLessonsCount} 节课、完成{' '}
                {pendingRestore.stats.completedTasksCount} 个成果、
                {pendingRestore.stats.draftsCount} 份草稿。
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onImportBackup(pendingRestore.state);
                    setPendingRestore(null);
                  }}
                  className="rounded-lg bg-[#0D5C4B] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#09473A]"
                >
                  确认覆盖恢复
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRestore(null)}
                  className="rounded-lg border border-[#D8D9D1] bg-white px-3.5 py-1.5 text-xs font-medium text-[#474B45]"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-[#ECECE6] pt-5">
            <h3 className="text-xs font-semibold text-[#666A63]">
              这个学习空间如何工作
            </h3>
            <dl className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-[#FAF9F6] p-3">
                <dt className="text-[#6B7068]">课程与任务包</dt>
                <dd className="mt-0.5 font-medium text-[#171916]">
                  15 节短课 · 6 个任务包
                </dd>
              </div>
              <div className="rounded-lg bg-[#FAF9F6] p-3">
                <dt className="text-[#6B7068]">进度规则</dt>
                <dd className="mt-0.5 font-medium text-[#171916]">
                  随堂测验 + 独立任务验收
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>

      {/* Reset Zone */}
      <section className="rounded-2xl border border-[#DFDFD8] bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-lg font-semibold text-[#171916]">
              重新开始学习
            </h2>
            <p className="mt-1 text-xs text-[#5C605A]">
              需要为新一轮学习腾出空间时，可以清空本机记录。建议先导出一份备份。
            </p>
          </div>

          {!confirmResetOpen ? (
            <button
              type="button"
              onClick={() => setConfirmResetOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DC2626]/30 bg-white px-4 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>清空本机学习记录</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-4 py-2.5">
              <AlertTriangle className="h-4 w-4 text-[#B91C1C]" />
              <span className="text-xs font-medium text-[#7F1D1D]">
                确认清空所有课程与成果记录吗？
              </span>
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmResetOpen(false);
                }}
                className="rounded-md bg-[#B91C1C] px-3 py-1 text-xs font-medium text-white hover:bg-[#991B1B]"
              >
                确认清空
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="rounded-md border border-[#D8D9D1] bg-white px-3 py-1 text-xs font-medium text-[#474B45]"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
