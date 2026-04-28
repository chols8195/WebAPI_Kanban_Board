export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  student_id: string;
  course_id: string | null;
  card_type: "canvas_synced" | "study_block";
  title: string;
  description: string | null;
  canvas_assignment_id: string | null;
  board_column: TaskStatus;
  due_date: string | null;
  scheduled_for: string | null;
  estimated_minutes: number | null;
  total_focus_seconds: number;
  doing_started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  course_name?: string;
}

export interface Course {
  id: string;
  student_id: string;
  canvas_course_id: string | null;
  course_name: string;
  course_code: string | null;
  color_tag: string | null;
  is_visible_on_board: boolean;
}

export interface Filters {
  selectedCourse: string | null;
  showStudyBlocksOnly: boolean;
  showOverdueOnly: boolean;
}

export interface PomodoroSession {
  id: string;
  student_id: string;
  task_id: string;
  planned_seconds: number;
  actual_seconds: number | null;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  ended_at: string | null;
}