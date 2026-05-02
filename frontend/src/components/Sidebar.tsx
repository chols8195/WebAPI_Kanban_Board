import type { Filters, Course } from "../types";

interface SidebarProps {
  counts: {
    todo: number;
    prog: number;
    done: number;
  };
  courses: Course[];
  filters: Filters;
  onSelectCourse: (course: string | null) => void;
  onToggleStudyBlocks: () => void;
  onToggleOverdue: () => void;
  onSync: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  counts,
  courses,
  filters,
  onSelectCourse,
  onToggleStudyBlocks,
  onToggleOverdue,
  onSync,
  onLogout
}: SidebarProps) {
  const total = counts.todo + counts.prog + counts.done || 1;

  return (
    <aside className="h-full overflow-y-auto border-r bg-white p-3">
      <h2 className="mb-6 text-sm font-semibold text-gray-800">Kanban Companion</h2>

      <button 
        onClick={onSync}
        className="mb-4 w-full rounded-lg bg-indigo-700 py-2 text-xs font-medium text-white hover:bg-indigo-800"
      >
        Sync Canvas
      </button>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Task Tracker
        </h3>

        <div className="space-y-4 rounded-xl bg-gray-50 p-3">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>To Do</span>
              <span>{counts.todo}</span>
            </div>
            <div className="h-2 rounded bg-gray-200">
              <div
                className="h-2 rounded bg-gray-500"
                style={{ width: `${(counts.todo / total) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>In Progress</span>
              <span>{counts.prog}</span>
            </div>
            <div className="h-2 rounded bg-gray-200">
              <div
                className="h-2 rounded bg-blue-500"
                style={{ width: `${(counts.prog / total) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Done</span>
              <span>{counts.done}</span>
            </div>
            <div className="h-2 rounded bg-gray-200">
              <div
                className="h-2 rounded bg-green-500"
                style={{ width: `${(counts.done / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Courses
        </h3>

        <div className="space-y-2 text-sm">
          <button
            onClick={() => onSelectCourse(null)}
            className={`w-full rounded-lg px-3 py-2 text-left ${
              filters.selectedCourse === null
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-700"
            }`}
          >
            All Courses
          </button>

          {courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                filters.selectedCourse === course.id
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700"
              }`}
            >
              {course.course_code || course.course_name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Filter
        </h3>

        <div className="space-y-2 text-sm">
          <button
            onClick={onToggleStudyBlocks}
            className={`w-full rounded-lg border px-3 py-2 text-left ${
              filters.showStudyBlocksOnly ? "bg-indigo-50 text-indigo-700" : ""
            }`}
          >
            Study Blocks
          </button>

          <button
            onClick={onToggleOverdue}
            className={`w-full rounded-lg border px-3 py-2 text-left ${
              filters.showOverdueOnly ? "bg-indigo-50 text-indigo-700" : ""
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="mt-4 w-full rounded-lg border px-3 py-2 text-xs text-gray-600 hover:bg-gray-50"
      >
        Sign Out
      </button>
    </aside>
  );
}