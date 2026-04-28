import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskCard({ task, onMoveTask }: TaskCardProps) {
  const moveLeft = () => {
    if (task.board_column === "doing") onMoveTask(task.id, "todo");
    if (task.board_column === "done") onMoveTask(task.id, "doing");
  };

  const moveRight = () => {
    if (task.board_column === "todo") onMoveTask(task.id, "doing");
    if (task.board_column === "doing") onMoveTask(task.id, "done");
  };

  return (
    <div
      className={`rounded-lg border bg-gray-50 p-2 ${
        task.board_column === "done" ? "opacity-60" : ""
      }`}
    >
      {task.course_name && (
        <div className="mb-1 inline-block rounded bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700">
          {task.course_name}
        </div>
      )}

      <div className="text-sm font-medium leading-tight text-gray-800">
        {task.title}
      </div>

      <div className="mb-2 text-[10px] text-gray-400">
        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No due date"}
        {task.card_type === 'study_block' && (
          <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-purple-700">
            study
          </span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {task.board_column !== "todo" && (
          <button
            onClick={moveLeft}
            className="rounded border px-2 py-1 text-[10px] text-gray-600"
          >
            ←
          </button>
        )}

        {task.board_column !== "done" && (
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