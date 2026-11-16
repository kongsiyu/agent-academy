import { Menu, Target } from 'lucide-react';
import type { AcademyRoute, CurriculumContent } from '../types/academy';

interface TopBarProps {
  route: AcademyRoute;
  curriculum: CurriculumContent;
  onOpenMobileMenu: () => void;
  onOpenGoalModal: () => void;
}

export function TopBar({
  route,
  curriculum,
  onOpenMobileMenu,
  onOpenGoalModal,
}: TopBarProps) {
  let sectionLabel = '学习总览';
  let subLabel: string | null = null;

  switch (route.page) {
    case 'overview':
      sectionLabel = '学习总览';
      break;
    case 'route':
      sectionLabel = '学习路线';
      break;
    case 'lesson': {
      sectionLabel = '学习路线';
      const lesson = curriculum.lessons.find((l) => l.id === route.lessonId);
      subLabel = lesson ? lesson.title : '课程详情';
      break;
    }
    case 'tasks':
      sectionLabel = '任务实验室';
      break;
    case 'task': {
      sectionLabel = '任务实验室';
      const task = curriculum.tasks.find((t) => t.id === route.taskId);
      subLabel = task ? task.title : '任务工作台';
      break;
    }
    case 'artifacts':
      sectionLabel = '我的成果';
      break;
    case 'settings':
      sectionLabel = '学习设置';
      break;
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[#E2E3DD] bg-[#F6F6F3]/95 px-4 backdrop-blur-sm sm:px-6 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="打开导航菜单"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#E2E3DD] bg-white text-[#171916] hover:bg-[#EFEFEA] lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav
          aria-label="面包屑导航"
          className="flex min-w-0 items-center gap-2 text-sm text-[#666A63]"
        >
          <a
            href="#/overview"
            className="hidden hover:text-[#171916] sm:inline whitespace-nowrap shrink-0"
          >
            我的学习空间
          </a>
          <span className="hidden text-[#B4B7AE] sm:inline" aria-hidden="true">
            /
          </span>
          <span className="font-medium text-[#171916] whitespace-nowrap shrink-0">
            {sectionLabel}
          </span>
          {subLabel && (
            <>
              <span className="text-[#B4B7AE]" aria-hidden="true">
                /
              </span>
              <span className="truncate font-medium text-[#474B45]">
                {subLabel}
              </span>
            </>
          )}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenGoalModal}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D8D9D1] bg-white px-3.5 py-2 text-xs font-medium text-[#171916] transition-colors hover:border-[#B6B8AE] hover:bg-[#FAF9F6] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D5C4B]"
        >
          <Target className="h-3.5 w-3.5 text-[#0D5C4B]" aria-hidden="true" />
          <span>调整学习目标</span>
        </button>
      </div>
    </header>
  );
}
