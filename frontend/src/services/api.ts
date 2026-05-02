const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
console.log("BASE_URL:", BASE_URL);

const TOKEN_STORAGE_KEY = "kanban_access_token";

function readStoredToken(): string | null {
    if (typeof globalThis === "undefined" || !("localStorage" in globalThis)) {
        return null;
    }
    try {
        return globalThis.localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
        return null;
    }
}

let memoryToken: string | null = readStoredToken();

export function setToken(token: string) {
    memoryToken = token;
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
        try {
            globalThis.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        } catch {
            /* storage unavailable (e.g. private mode) */
        }
    }
}

export function clearToken() {
    memoryToken = null;
    if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
        try {
            globalThis.localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
            /* ignore */
        }
    }
}

export function isAuthenticated(): boolean {
    return !!memoryToken;
}

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${memoryToken}`,
    };
}

// Auth
export async function register(email: string, password: string, name: string, canvas_token: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, canvas_token }),
    });
    return res.json();
}

export async function signin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }

  return data;
}

export async function getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: authHeaders(),
    });
    return res.json();
}

// Canvas
export async function syncCanvas() {
    const res = await fetch(`${BASE_URL}/canvas/`, {
        headers: authHeaders(),
    });
    return res.json();
}

// Courses
export async function getCourses() {
    const res = await fetch(`${BASE_URL}/courses`, {
        headers: authHeaders(),
    });
    return res.json();
}

// Tasks
export async function getTasks() {
    const res = await fetch(`${BASE_URL}/tasks`, {
        headers: authHeaders(),
    });
    return res.json();
}

export async function createTask(task: {
  title: string;
  course_id?: string;
  card_type: string;
  board_column: string;
  description?: string;
  due_date?: string;
  estimated_minutes?: number;
}) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(task),
  });

  return res.json();
}

export async function updateTask(taskId: string, updates: { board_column?: string; title?: string; description?: string; due_date?: string; estimated_minutes?: number; }) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updates),
    });
    return res.json();
}

export async function deleteTask(taskId: string) {
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    return res.json();
}

// Pomodoro
export async function startPomodoro(taskId: string, plannedSeconds: number = 1500) {
    const res = await fetch(`${BASE_URL}/pomodoro/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ task_id: taskId, planned_seconds: plannedSeconds }),
    });
    return res.json();
}

export async function completePomodoro(sessionId: string, actualSeconds: number) {
    const res = await fetch(`${BASE_URL}/pomodoro/${sessionId}/complete`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ actual_seconds: actualSeconds }),
    });
    return res.json();
}

export async function abandonPomodoro(sessionId: string, actualSeconds: number) {
    const res = await fetch(`${BASE_URL}/pomodoro/${sessionId}/abandon`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ actual_seconds: actualSeconds, end_reason: "abandoned" }),
    });
    return res.json();
}

export async function getPomodoros() {
    const res = await fetch(`${BASE_URL}/pomodoro/`, {
        headers: authHeaders(),
    });
    return res.json();
}