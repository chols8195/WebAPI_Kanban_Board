import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

function getCourseStyles(course: string) {
  switch (course) {
    case "CS 3450":
      return "bg-blue-100 text-blue-700";
    case "MATH 2210":
      return "bg-yellow-100 text-yellow-700";
    case "ENG 3100":
      return "bg-green-100 text-green-700";
    case "HIST 1510":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-purple-100 text-purple-700";
  }
}

export default function TaskCard({ task, onMoveTask }: TaskCardProps) {
  const moveLeft = () => {
    if (task.status === "prog") onMoveTask(task.id, "todo");
    if (task.status === "done") onMoveTask(task.id, "prog");
  };

  const moveRight = () => {
    if (task.status === "todo") onMoveTask(task.id, "prog");
    if (task.status === "prog") onMoveTask(task.id, "done");
  };

  return (
    <div
      className={`rounded-lg border bg-gray-50 p-2 ${
        task.status === "done" ? "opacity-60" : ""
      }`}
    >
      <div
        className={`mb-1 inline-block rounded px-2 py-1 text-[10px] font-medium ${getCourseStyles(
          task.course
        )}`}
      >
        {task.course}
      </div>

      <div className="text-sm font-medium leading-tight text-gray-800">
        {task.title}
      </div>

      <div className="mb-2 text-[10px] text-gray-400">
        {task.dueDate || "No due date"}
        {task.isStudyBlock && (
          <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-purple-700">
            study
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {task.status !== "todo" && (
          <button
            onClick={moveLeft}
            className="rounded border px-2 py-1 text-[10px] text-gray-600"
          >
            ←
          </button>
        )}

        {task.status !== "done" && (
          <button
            onClick={moveRight}
            className="rounded border px-2 py-1 text-[10px] text-gray-600"
          >
            →
          </button>
        )}
      </div>
    </div>
  );
}