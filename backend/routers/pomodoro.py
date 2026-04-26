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

# GET one session 
@router.get("/{session_id}")
def get_session(session_id: str):
    response = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return response.data[0]

# POST start a session 
@router.post("/")
def start_session(body: StartSession):
    # Check beforehand if a student already has an active session 
    active = supabase.table("pomodoro_sessions").select("*").eq(
        "student_id", body.student_id
    ).eq("status", "active").execute()
    
    if active.data:
        raise HTTPException(status_code=400, detail="You already have an active session")
    
    # Update task doing_started_at if not already set 
    task = supabase.table("tasks").select("*").eq("id", body.task_id).execute()
    if task.data and not task.data[0].get("doing_started_at"):
        supabase.table("tasks").update({
            "doing_started_at": "now()",
            "board_column": "doing"
        }).eq("id", body.task_id).execute()
        
    
    response = supabase.table("pomodoro_sessions").insert({
        "student_id": body.student_id,
        "task_id": body.task_id,
        "planned_seconds": body.planned_seconds,
        "status": "active"
    }).execute()
    
    session = response.data[0]
    
    log_event(
        student_id=body.student_id,
        task_id=body.task_id,
        pomodoro_session_id=session["id"],
        event_type="pomodoro_started",
        new_value=str(body.planned_seconds)
    )
    
    return session

# PATCH completing a session 
@router.patch("/{session_id}/complete")
def complete_session(session_id: str, body: UpdateSession):
    session = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).execute()
    
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    response = supabase.table("pomodoro_sessions").update({
        "status": "completed",
        "actual_seconds": body.actual_seconds,
        "end_reason": "completed",
        "ended_at": "now()"
    }).eq("id", session_id).execute()
    
    # Update total focus seconds on task
    current = session.data[0]
    supabase.table("tasks").update({
        "total_focus_seconds": supabase.rpc("increment_focus", {
            "task_id": current["task_id"],
            "seconds": body.actual_seconds
        })
    })
    
    log_event(
        student_id=current["student_id"],
        task_id=current["task_id"],
        pomodoro_session_id=session_id,
        event_type="pomodoro_completed",
        new_value=str(body.actual_seconds)
    )
    
    return response.data[0]

# PATCH abandon a session
@router.patch("/{session_id}/abandon")
def abandon_session(session_id: str, body: UpdateSession):
    session = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).execute()
    
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    response = supabase.table("pomodoro_sessions").update({
        "status": "abandoned",
        "actual_seconds": body.actual_seconds,
        "end_reason": body.end_reason or "abandoned",
        "ended_at": "now()"
    }).eq("id", session_id).execute()
    
    current = session.data[0]
    
    log_event(
        student_id=current["student_id"],
        task_id=current["task_id"],
        pomodoro_session_id=session_id,
        event_type="pomodoro_abandoned",
        previous_value=str(current["planned_seconds"]),
        new_value=str(body.actual_seconds)
    )
    
    return response.data[0]

