# backend/routers/pomodoro.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import supabase
from utils.logger import log_event

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])

class StartSession(BaseModel):
    student_id: str
    task_id: str
    planned_seconds: int = 1500 # default 25 mins 
    
class UpdateSession(BaseModel):
    actual_seconds: int 
    end_reason: str = None 
    
# GET all sessions for a student 
@router.get("/")
def get_sessions(student_id: str):
    response = supabase.table("pomodoro_sessions").select("*").eq(
        "student_id", student_id
    ).order("started_at", desc=True).execute()
    return response.data

