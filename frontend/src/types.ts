export type TaskStatus = "todo" | "prog" | "done";

export interface Task {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: TaskStatus;
  isStudyBlock: boolean;
}

export interface PomodoroState {
  activeTaskId: string | null;
  duration: number;
  remaining: number;
  running: boolean;
  round: number;
}

export interface Filters {
  selectedCourse: string | null;
  showStudyBlocksOnly: boolean;
  showOverdueOnly: boolean;
}