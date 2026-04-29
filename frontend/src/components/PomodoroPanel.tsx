import { useEffect, useMemo, useState } from "react";

const FOCUS_SECONDS = 25 * 60;
const SHORT_BREAK_SECONDS = 5 * 60;
const LONG_BREAK_SECONDS = 15 * 60;
const SESSIONS_BEFORE_LONG_BREAK = 4;

type TimerMode = "focus" | "shortBreak" | "longBreak";

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);

  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (safeSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getModeSeconds(mode: TimerMode) {
  if (mode === "focus") return FOCUS_SECONDS;
  if (mode === "shortBreak") return SHORT_BREAK_SECONDS;
  return LONG_BREAK_SECONDS;
}

function getModeLabel(mode: TimerMode) {
  if (mode === "focus") return "Focus";
  if (mode === "shortBreak") return "Short Break";
  return "Long Break";
}

export default function PomodoroPanel() {
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0);

  useEffect(() => {
    if (!isRunning) return;

    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);

          if (mode === "focus") {
            const nextCompleted = focusSessionsCompleted + 1;
            setFocusSessionsCompleted(nextCompleted);

            const nextMode =
              nextCompleted % SESSIONS_BEFORE_LONG_BREAK === 0
                ? "longBreak"
                : "shortBreak";

            setMode(nextMode);
            return getModeSeconds(nextMode);
          }

          setMode("focus");
          return FOCUS_SECONDS;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRunning, mode, focusSessionsCompleted]);

  const minutesFocused = useMemo(() => {
    return focusSessionsCompleted * (FOCUS_SECONDS / 60);
  }, [focusSessionsCompleted]);

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeftSeconds(getModeSeconds(newMode));
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds(getModeSeconds(mode));
  };

  return (
    <aside className="h-full overflow-hidden border-l bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">Pomodoro</h2>

      <div className="rounded-xl bg-gray-50 p-3 text-center">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-700">
          {getModeLabel(mode)}
        </div>

        <div className="mb-3 text-3xl font-bold text-gray-800">
          {formatTime(timeLeftSeconds)}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-1">
          <button
            onClick={() => switchMode("focus")}
            className={`rounded-md border px-2 py-1 text-[10px] ${
              mode === "focus" ? "bg-indigo-700 text-white" : "text-gray-600"
            }`}
          >
            Focus
          </button>

          <button
            onClick={() => switchMode("shortBreak")}
            className={`rounded-md border px-2 py-1 text-[10px] ${
              mode === "shortBreak"
                ? "bg-indigo-700 text-white"
                : "text-gray-600"
            }`}
          >
            Break
          </button>

          <button
            onClick={() => switchMode("longBreak")}
            className={`rounded-md border px-2 py-1 text-[10px] ${
              mode === "longBreak"
                ? "bg-indigo-700 text-white"
                : "text-gray-600"
            }`}
          >
            Long
          </button>
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

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">
            {focusSessionsCompleted}
          </div>
          <div className="text-[10px] text-gray-500">Focus Rounds</div>
        </div>

        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">
            {minutesFocused}
          </div>
          <div className="text-[10px] text-gray-500">Minutes</div>
        </div>
      </div>
    </aside>
  );
}