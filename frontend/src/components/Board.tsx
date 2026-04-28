import type { Task, TaskStatus } from "../types";
import Column from "./Column";

interface BoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export default function Board({ tasks, onMoveTask }: BoardProps) {
  const todoTasks = tasks.filter((t) => t.board_column === "todo");
  const progTasks = tasks.filter((t) => t.board_column === "doing");
  const doneTasks = tasks.filter((t) => t.board_column === "done");

  return (
    <div className="grid h-full grid-cols-3 gap-3 overflow-hidden">
      <Column title="To Do" tasks={todoTasks} onMoveTask={onMoveTask} />
      <Column title="In Progress" tasks={progTasks} onMoveTask={onMoveTask} />
      <Column title="Done" tasks={doneTasks} onMoveTask={onMoveTask} />
    </div>
  );
}