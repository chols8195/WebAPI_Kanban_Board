export default function PomodoroPanel() {
  return (
    <aside className="h-full overflow-hidden border-l bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">Pomodoro</h2>

      <div className="rounded-xl bg-gray-50 p-3 text-center">
        <div className="mb-3 text-2xl font-bold text-gray-800">25:00</div>

        <div className="flex justify-center gap-2">
          <button className="rounded-md bg-indigo-700 px-3 py-1.5 text-xs text-white">
            Start
          </button>
          <button className="rounded-md border px-3 py-1.5 text-xs text-gray-700">
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-medium text-gray-700">Today</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="rounded-md bg-gray-50 p-2">Lab 7 — BST · 2</div>
          <div className="rounded-md bg-gray-50 p-2">Draft outline · 2</div>
          <div className="rounded-md bg-gray-50 p-2">Project 3 · 3</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">7</div>
          <div className="text-[10px] text-gray-500">Rounds</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">175</div>
          <div className="text-[10px] text-gray-500">Minutes</div>
        </div>
      </div>
    </aside>
  );
}