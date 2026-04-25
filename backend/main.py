# backend/main.py
from fastapi import FastAPI 
from dotenv import load_dotenv
from routers import pomodoro, canvas, logs

load_dotenv()

app = FastAPI(title="Kanban Board")

app.include_router(pomodoro.router)
app.include_router(canvas.router)
app.include_router(logs.router)