import { useState } from "react";
import { sampleTasks } from "./data/sampleTasks";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import PomodoroPanel from "./components/PomodoroPanel";
import AddTaskForm from "./components/AddTaskForm";
import type { Task, TaskStatus, Filters } from "./types";

function isOverdue(dueDate: string) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(dueDate);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate < today;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [filters, setFilters] = useState<Filters>({
    selectedCourse: null,
    showStudyBlocksOnly: false,
    showOverdueOnly: false,
  });

  const counts = {
    todo: tasks.filter((task) => task.status === "todo").length,
    prog: tasks.filter((task) => task.status === "prog").length,
    done: tasks.filter((task) => task.status === "done").length,
  };

  const handleAddTask = (newTask: Omit<Task, "id" | "status">) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      status: "todo",
    };

    setTasks((prev) => [...prev, task]);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const filteredTasks = tasks.filter((task) => {
    if (filters.selectedCourse && task.course !== filters.selectedCourse) {
      return false;
    }

    if (filters.showStudyBlocksOnly && !task.isStudyBlock) {
      return false;
    }

    if (filters.showOverdueOnly && !isOverdue(task.dueDate)) {
      return false;
    }

    return true;
  });

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <div className="grid h-full w-full grid-cols-[190px_1fr_190px] bg-white">
        <Sidebar
          counts={counts}
          filters={filters}
          onSelectCourse={(course) =>
            setFilters((prev) => ({ ...prev, selectedCourse: course }))
          }
          onToggleStudyBlocks={() =>
            setFilters((prev) => ({
              ...prev,
              showStudyBlocksOnly: !prev.showStudyBlocksOnly,
            }))
          }
          onToggleOverdue={() =>
            setFilters((prev) => ({
              ...prev,
              showOverdueOnly: !prev.showOverdueOnly,
            }))
          }
        />

        <main className="flex h-full flex-col overflow-hidden p-3">
          <AddTaskForm onAddTask={handleAddTask} />
          <div className="mt-3 min-h-0 flex-1 overflow-hidden">
            <Board tasks={filteredTasks} onMoveTask={handleMoveTask} />
          </div>
        </main>

        <PomodoroPanel />
      </div>
    </div>
  );
}