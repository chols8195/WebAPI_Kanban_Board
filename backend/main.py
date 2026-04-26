# backend/main.py
from fastapi import FastAPI
from dotenv import load_dotenv
from routers import pomodoro, canvas, logs, auth, courses, tasks

load_dotenv()

app = FastAPI(title="Kanban Board")

app.include_router(pomodoro.router)
app.include_router(canvas.router)
app.include_router(logs.router)
app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(tasks.router)
