export interface CourseModule {
  id: string;
  week: number;
  title: string;
  subtitle: string;
  optional: boolean;
  lessonIds: string[];
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  targetTasks: number;
  targetLessons: number;
  weeks: number;
}

export interface LessonBlock {
  title: string;
  text: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  minutes: number;
  skill: string;
  summary: string;
  blocks: LessonBlock[];
  quiz: LessonQuiz;
}

export interface TaskCriterion {
  id: string;
  label: string;
}

export interface TaskPitfall {
  problem: string;
  solution: string;
}

export interface TaskCheckpoint {
  id: string;
  title: string;
  description: string;
  tip: string;
}

export interface TaskChallenge {
  id: string;
  title: string;
  description: string;
}

export interface LabTask {
  id: string;
  title: string;
  category: string;
  minutes: number;
  summary: string;
  level: string;
  skills: string[];
  lessonIds: string[];
  sampleInput: string;
  prompt: string;
  sampleOutput: string;
  criteria: TaskCriterion[];
  pitfalls: TaskPitfall[];
  checkpoints: TaskCheckpoint[];
  challenges: TaskChallenge[];
}

export interface CurriculumContent {
  modules: CourseModule[];
  goals: LearningGoal[];
  lessons: Lesson[];
  tasks: LabTask[];
}

export type TaskMode = 'walkthrough' | 'practice';

export interface UserProfile {
  goalId: string;
  roleTrack: string;
  weeklyMinutes: number;
  startDate: string;
}

export interface LessonProgress {
  passed: boolean;
  selectedIndex: number | null;
  passedAt: string | null;
}

export interface TaskProgress {
  mode: TaskMode;
  stepIndex: number;
  walkthroughCompleted: boolean;
  input: string;
  output: string;
  reflection: string;
  checks: Record<string, boolean>;
  completedAt: string | null;
  updatedAt: string | null;
}

export interface ActivityRecord {
  type: 'lesson' | 'task';
  id: string;
  date: string;
  at: string;
}

export interface LearningState {
  version: number;
  profile: UserProfile;
  lessons: Record<string, LessonProgress>;
  tasks: Record<string, TaskProgress>;
  activities: ActivityRecord[];
}

export interface ModuleSkillProgress {
  moduleId: string;
  week: number;
  title: string;
  subtitle: string;
  optional: boolean;
  passedCount: number;
  totalCount: number;
  ratio: number;
}

export interface AcademyStats {
  goal: LearningGoal;
  passedLessonsCount: number;
  totalLessonsCount: number;
  completedTaskIds: string[];
  completedTasksCount: number;
  draftTaskIds: string[];
  draftsCount: number;
  learningDaysCount: number;
  learnedMinutes: number;
  overallProgressPercent: number;
  lessonProgressPercent: number;
  taskProgressPercent: number;
  nextLesson: Lesson | null;
  moduleProgress: ModuleSkillProgress[];
}

export type AcademyRoute =
  | { page: 'overview' }
  | { page: 'route' }
  | { page: 'lesson'; lessonId: string }
  | { page: 'tasks' }
  | { page: 'task'; taskId: string }
  | { page: 'artifacts' }
  | { page: 'settings' };
