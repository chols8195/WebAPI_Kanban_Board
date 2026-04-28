import { useEffect, useMemo, useState } from "react";
import { startPomodoro, completePomodoro, abandonPomodoro, getPomodoros } from "../services/api";
import type { Task, PomodoroSession } from "../types";

const POMODORO_SECONDS = 25 * 60;

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
  const seconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

interface PomodoroPanelProps {
  tasks: Task[];
}

export default function PomodoroPanel({ tasks }: PomodoroPanelProps) {
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(POMODORO_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [activeSession, setActiveSession] = useState<PomodoroSession | null>(null);
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    getPomodoros().then((data) => {
      if (Array.isArray(data)) {
        const completed = data.filter((s: PomodoroSession) => s.status === "completed");
        setCompletedSessions(completed);
        const active = data.find((s: PomodoroSession) => s.status === "active");
        if (active) setActiveSession(active);
      }
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsRunning(false);
          handleComplete();
          return POMODORO_SECONDS;
        }
        return prev - 1;
      });
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);

  const handleStart = async () => {
    if (!selectedTaskId) return;
    const session = await startPomodoro(selectedTaskId, POMODORO_SECONDS);
    if (session.id) {
      setActiveSession(session);
      setIsRunning(true);
      setElapsedSeconds(0);
    }
  };

  const handleComplete = async () => {
    if (!activeSession) return;
    await completePomodoro(activeSession.id, elapsedSeconds);
    setCompletedSessions((prev) => [...prev, activeSession]);
    setActiveSession(null);
    setTimeLeftSeconds(POMODORO_SECONDS);
    setElapsedSeconds(0);
  };

  const handleAbandon = async () => {
    if (!activeSession) return;
    await abandonPomodoro(activeSession.id, elapsedSeconds);
    setActiveSession(null);
    setIsRunning(false);
    setTimeLeftSeconds(POMODORO_SECONDS);
    setElapsedSeconds(0);
  };

  const doingTasks = tasks.filter((t) => t.board_column === "doing");
  const sessionsCompleted = completedSessions.length;
  const minutesStudied = useMemo(() => sessionsCompleted * (POMODORO_SECONDS / 60), [sessionsCompleted]);

  return (
    <aside className="h-full overflow-hidden border-l bg-white p-3">
      <h2 className="mb-3 text-sm font-semibold text-gray-800">Pomodoro</h2>

      <div className="mb-3">
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
          disabled={!!activeSession}
        >
          <option value="">Select a task...</option>
          {doingTasks.map((task) => (
            <option key={task.id} value={task.id}>{task.title}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl bg-gray-50 p-3 text-center">
        <div className="mb-3 text-2xl font-bold text-gray-800">{formatTime(timeLeftSeconds)}</div>
        <div className="flex justify-center gap-2">
          {!activeSession ? (
            <button
              onClick={handleStart}
              disabled={!selectedTaskId}
              className="rounded-md bg-indigo-700 px-3 py-1.5 text-xs text-white hover:bg-indigo-800 disabled:opacity-50"
            >
              Start
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsRunning((p) => !p)}
                className="rounded-md bg-indigo-700 px-3 py-1.5 text-xs text-white hover:bg-indigo-800"
              >
                {isRunning ? "Pause" : "Resume"}
              </button>
              <button
                onClick={handleAbandon}
                className="rounded-md border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              >
                Abandon
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-medium text-gray-700">Recent Sessions</h3>
        <div className="space-y-2 text-xs text-gray-600">
          {completedSessions.slice(0, 3).map((session) => {
            const task = tasks.find((t) => t.id === session.task_id);
            return (
              <div key={session.id} className="rounded-md bg-gray-50 p-2">
                {task?.title || "Unknown task"} · {Math.round((session.actual_seconds || 0) / 60)}m
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">{sessionsCompleted}</div>
          <div className="text-[10px] text-gray-500">Rounds</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <div className="text-base font-semibold text-gray-800">{minutesStudied}</div>
          <div className="text-[10px] text-gray-500">Minutes</div>
        </div>
      </div>
    </aside>
  );
}