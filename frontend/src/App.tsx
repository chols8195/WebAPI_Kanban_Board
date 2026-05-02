import { useState, useEffect } from "react";
// import { sampleTasks } from "./data/sampleTasks";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board";
import PomodoroPanel from "./components/PomodoroPanel";
import AddTaskForm from "./components/AddTaskForm";
import AuthScreen from './components/AuthScreen';
import type { Task, TaskStatus, Filters, Course } from "./types";
import { getTasks, getCourses, updateTask, createTask, syncCanvas, isAuthenticated, signout } from "./services/api";

function isOverdue(dueDate: string) {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const taskDate = new Date(dueDate);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate < today;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filters, setFilters] = useState<Filters>({
    selectedCourse: null,
    showStudyBlocksOnly: false,
    showOverdueOnly: false,
  });

  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) {
      setLoading(false);
      return;
    }
    loadData();
  }, [loggedIn])

async function loadData() {
  setLoading(true);

  try {
    const [tasksData, coursesData] = await Promise.all([
      getTasks(),
      getCourses(),
    ]);

    const tasksWithCourseNames = tasksData.map((task: Task) => {
      const matchingCourse = coursesData.find(
        (course: Course) => course.id === task.course_id
      );

      return {
        ...task,
        course_name: matchingCourse?.course_name,
      };
    });

    setTasks(tasksWithCourseNames);
    setCourses(coursesData);
  } catch (err) {
    console.error("Failed to load data", err);
  } finally {
    setLoading(false);
  }
}

const handleAddTask = async (newTask: {
  title: string;
  course_id?: string;
  due_date?: string;
  card_type: string;
  estimated_minutes?: number;
}) => {
  const created = await createTask({
    title: newTask.title,
    course_id: newTask.course_id,
    card_type: newTask.card_type,
    board_column: "todo",
    due_date: newTask.due_date,
    estimated_minutes: newTask.estimated_minutes,
  });

  const matchingCourse = courses.find(
    (course) => course.id === newTask.course_id
  );

  setTasks((prev) => [
    {
      ...created,
      course_name: matchingCourse?.course_name,
    },
    ...prev,
  ]);
};

  const handleDeleteTask = async (taskId: string) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (!taskToDelete) return;

    const canDelete =
      taskToDelete.card_type !== "canvas_synced" ||
      taskToDelete.board_column === "done";

    if (!canDelete) {
      return;
    }

    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error("Failed to delete task", err);
      await loadData();
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, board_column: newStatus } : task
      )
    );
    await updateTask(taskId, { board_column: newStatus });
  };

  const handleSync = async () => {
    console.log("Syncing canvas...");
    const result = await syncCanvas();
    console.log("Sync result:", result);
    await loadData();
  };

  const counts = {
    todo: tasks.filter((t) => t.board_column === "todo").length,
    prog: tasks.filter((t) => t.board_column === "doing").length,
    done: tasks.filter((t) => t.board_column === "done").length,
  };

  const filteredTasks = tasks.filter((task) => {
    if (filters.selectedCourse && task.course_id !== filters.selectedCourse) {
      return false;
    }

    if (filters.showStudyBlocksOnly && task.card_type !== 'study_block') {
      return false;
    }

    if (filters.showOverdueOnly && !isOverdue(task.due_date || "")) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  if (!loggedIn) {
    return <AuthScreen onAuth={() => setLoggedIn(true)} />;
  }

  const handleLogout = () => {
    signout();
    setLoggedIn(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-100">
      <div className="grid h-full w-full grid-cols-[190px_1fr_190px] bg-white">
        <Sidebar
          counts={counts}
          courses={courses}
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
          onSync={handleSync}
          onLogout={handleLogout}
        />

        <main className="flex h-full flex-col overflow-hidden p-3">
          <AddTaskForm onAddTask={handleAddTask} courses={courses}/>
          <div className="mt-3 min-h-0 flex-1 overflow-hidden">
            <Board
              tasks={filteredTasks}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </main>

        <PomodoroPanel/>
      </div>
    </div>
  );
}