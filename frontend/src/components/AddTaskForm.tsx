import { useState } from "react";
import type { Task } from "../types";

interface AddTaskFormProps {
  onAddTask: (task: Omit<Task, "id" | "status">) => void;
}

export default function AddTaskForm({ onAddTask }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("CS 3450");
  const [dueDate, setDueDate] = useState("");
  const [isStudyBlock, setIsStudyBlock] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    onAddTask({
      title,
      course,
      dueDate,
      isStudyBlock,
    });

    setTitle("");
    setCourse("CS 3450");
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
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="h-10 min-w-[140px] rounded-lg border px-3 text-sm outline-none focus:border-indigo-500"
        >
          <option value="CS 3450">CS 3450</option>
          <option value="MATH 2210">MATH 2210</option>
          <option value="ENG 3100">ENG 3100</option>
          <option value="HIST 1510">HIST 1510</option>
          <option value="Personal">Personal</option>
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