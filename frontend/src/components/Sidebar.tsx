import type { Filters } from "../types";

interface SidebarProps {
  counts: {
    todo: number;
    prog: number;
    done: number;
  };
  filters: Filters;
  onSelectCourse: (course: string | null) => void;
  onToggleStudyBlocks: () => void;
  onToggleOverdue: () => void;
}

const courses = ["CS 3450", "MATH 2210", "ENG 3100", "HIST 1510"];

export default function Sidebar({
  counts,
  filters,
  onSelectCourse,
  onToggleStudyBlocks,
  onToggleOverdue,
}: SidebarProps) {
  const total = counts.todo + counts.prog + counts.done || 1;

  return (
    <aside className="h-full overflow-hidden border-r bg-white p-3">
      <h2 className="mb-6 text-sm font-semibold text-gray-800">Kanban Companion</h2>

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
              key={course}
              onClick={() => onSelectCourse(course)}
              className={`w-full rounded-lg px-3 py-2 text-left ${
                filters.selectedCourse === course
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700"
              }`}
            >
              {course}
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
    </aside>
  );
}