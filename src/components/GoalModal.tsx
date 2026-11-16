import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import type { LearningGoal, UserProfile } from '../types/academy';
import { ROLE_TRACKS, WEEKLY_MINUTE_OPTIONS } from '../utils/academyCore';

interface GoalModalProps {
  open: boolean;
  goals: LearningGoal[];
  profile: UserProfile;
  onClose: () => void;
  onSave: (patch: {
    goalId: string;
    roleTrack: string;
    weeklyMinutes: number;
  }) => void;
}

export function GoalModal({
  open,
  goals,
  profile,
  onClose,
  onSave,
}: GoalModalProps) {
  const [goalId, setGoalId] = useState(profile.goalId);
  const [roleTrack, setRoleTrack] = useState(profile.roleTrack);
  const [weeklyMinutes, setWeeklyMinutes] = useState(profile.weeklyMinutes);

  useEffect(() => {
    if (open) {
      setGoalId(profile.goalId);
      setRoleTrack(profile.roleTrack);
      setWeeklyMinutes(profile.weeklyMinutes);
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ goalId, roleTrack, weeklyMinutes });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171916]/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-modal-title"
    >
      <div className="w-full max-w-xl rounded-2xl border border-[#DFDFD8] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E9EAE4] px-6 py-5">
          <div>
            <h2
              id="goal-modal-title"
              className="font-serif text-xl font-semibold text-[#171916]"
            >
              调整学习目标与节奏
            </h2>
            <p className="mt-1 text-sm text-[#5C605A]">
              更换目标会保留你已经掌握的课程和完成的工作成果。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置窗口"
            className="rounded-lg p-2 text-[#5C605A] hover:bg-[#F2F2ED] hover:text-[#171916]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div>
            <label className="block text-sm font-semibold text-[#171916]">
              选择目标路线
            </label>
            <div className="mt-2.5 space-y-2.5">
              {goals.map((g) => {
                const selected = goalId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGoalId(g.id)}
                    className={`flex w-full items-start justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-[#0D5C4B] bg-[#0D5C4B]/[0.04]'
                        : 'border-[#E2E3DD] bg-white hover:border-[#C5C7BD]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#171916]">
                          {g.title}
                        </span>
                        <span className="text-xs tabular-nums text-[#666A63]">
                          · {g.targetLessons} 课 · {g.targetTasks} 个成果 · 建议{' '}
                          {g.weeks} 周
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#5C605A]">
                        {g.description}
                      </p>
                    </div>
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? 'border-[#0D5C4B] bg-[#0D5C4B] text-white'
                          : 'border-[#C9CBC2] bg-white'
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="goal-role-track"
                className="block text-sm font-semibold text-[#171916]"
              >
                岗位方向
              </label>
              <select
                id="goal-role-track"
                value={roleTrack}
                onChange={(e) => setRoleTrack(e.target.value)}
                className="mt-2 w-full rounded-lg border border-[#D8D9D1] bg-[#FAF9F6] px-3 py-2.5 text-sm text-[#171916] focus:border-[#0D5C4B] focus:bg-white focus:outline-none"
              >
                {ROLE_TRACKS.map((track) => (
                  <option key={track} value={track}>
                    {track}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-semibold text-[#171916]">
                每周投入时间
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {WEEKLY_MINUTE_OPTIONS.map((mins) => {
                  const active = weeklyMinutes === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setWeeklyMinutes(mins)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium tabular-nums transition-colors whitespace-nowrap ${
                        active
                          ? 'border-[#0D5C4B] bg-[#0D5C4B] text-white'
                          : 'border-[#D8D9D1] bg-white text-[#474B45] hover:bg-[#F5F5F0]'
                      }`}
                    >
                      {mins} 分钟
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#E9EAE4] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D8D9D1] bg-white px-4 py-2 text-sm font-medium text-[#474B45] hover:bg-[#F5F5F0]"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0D5C4B] px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#09473A]"
            >
              保存目标设置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
