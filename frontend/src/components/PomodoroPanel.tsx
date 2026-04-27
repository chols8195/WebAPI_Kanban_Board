import { useEffect, useMemo, useState } from "react";

const POMODORO_SECONDS = 25 * 60;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function PomodoroPanel() {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(7);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          setSessionsCompleted((current) => current + 1);
          return POMODORO_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning]);

  const minutesStudied = useMemo(
    () => sessionsCompleted * (POMODORO_SECONDS / 60),
    [sessionsCompleted]
  );

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds(POMODORO_SECONDS);
  };

  return (
    <aside className="h-full overflow-hidden border-l bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">Pomodoro</h2>

      <div className="rounded-xl bg-gray-50 p-3 text-center">
        <div className="mb-3 text-2xl font-bold text-gray-800">
          {formatTime(timeLeftSeconds)}
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={toggleTimer}
            className="rounded-md bg-indigo-700 px-3 py-1.5 text-xs text-white transition hover:bg-indigo-800"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={resetTimer}
            className="rounded-md border px-3 py-1.5 text-xs text-gray-700 transition hover:bg-gray-100"
          >
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
          <div className="text-base font-semibold text-gray-800">
            {sessionsCompleted}
          </div>
          <div className="text-[10px] text-gray-500">Rounds</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">
            {minutesStudied}
          </div>
          <div className="text-[10px] text-gray-500">Minutes</div>
        </div>
      </div>
    </aside>
  );
}