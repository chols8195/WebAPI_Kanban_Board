import type { Task, TaskStatus } from "../types";
import TaskCard from "./TaskCard";

interface ColumnProps {
  title: string;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export default function Column({ title, tasks, onMoveTask }: ColumnProps) {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col rounded-xl border bg-white p-3">
      <h2 className="mb-3 text-center text-lg font-semibold">{title}</h2>

      <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onMoveTask={onMoveTask} />
        ))}
      </div>
    </div>
  );
}