import type { Task, TaskStatus } from "../types";
import Column from "./Column";

interface BoardProps {
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function Board({ tasks, onMoveTask, onDeleteTask }: BoardProps) {
  const todoTasks = tasks.filter((task) => task.board_column === "todo");
  const doingTasks = tasks.filter((task) => task.board_column === "doing");
  const doneTasks = tasks.filter((task) => task.board_column === "done");

  return (
    <div className="grid h-full grid-cols-3 gap-3 overflow-hidden">
      <Column
        title="To Do"
        tasks={todoTasks}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
      />

      <Column
        title="In Progress"
        tasks={doingTasks}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
      />

      <Column
        title="Done"
        tasks={doneTasks}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}