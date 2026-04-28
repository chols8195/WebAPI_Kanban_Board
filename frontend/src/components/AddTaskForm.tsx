import { useState } from "react";
import type { Course } from "../types";

interface AddTaskFormProps {
  courses: Course[];
  onAddTask: (task: {
    title: string;
    course_id?: string;
    due_date?: string;
    card_type: string;
    estimated_minutes?: number;
  }) => void;
}

export default function AddTaskForm({ onAddTask, courses }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isStudyBlock, setIsStudyBlock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onAddTask({
      title,
      course_id: courseId || undefined,
      due_date: dueDate || undefined,
      card_type: isStudyBlock ? 'study_block' : 'canvas_synced',
    });

    setTitle("");
    setCourseId("");
    setDueDate("");
    setIsStudyBlock(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-xl border bg-white p-3 shadow-sm"
    >
      <h2 className="mb-3 text-center text-lg font-semibold text-gray-800">
        Add Task
      </h2>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 min-w-[180px] flex-1 rounded-lg border px-3 text-sm outline-none focus:border-indigo-500"
        />

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 min-w-[140px] rounded-lg border px-3 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">No Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.course_code || course.course_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="h-10 min-w-[145px] rounded-lg border px-3 text-sm outline-none focus:border-indigo-500"
        />

        <label className="flex h-10 items-center gap-2 rounded-lg border px-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isStudyBlock}
            onChange={(e) => setIsStudyBlock(e.target.checked)}
            className="h-4 w-4"
          />
          Study
        </label>

        <button
          type="submit"
          className="h-10 rounded-lg bg-indigo-700 px-4 text-sm font-medium text-white transition hover:bg-indigo-800"
        >
          Add
        </button>
      </div>
    </form>
  );
}