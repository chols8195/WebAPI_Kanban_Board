from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from db import supabase
from utils.logger import log_event
from routers.auth import authenticate_user

router = APIRouter(prefix="/pomodoro", tags=["pomodoro"])

class StartSession(BaseModel):
    task_id: str
    planned_seconds: int = 1500

class UpdateSession(BaseModel):
    actual_seconds: int
    end_reason: str = None

@router.get("/")
def get_sessions(user: dict = Depends(authenticate_user)):
    response = supabase.table("pomodoro_sessions").select("*").eq(
        "student_id", user["id"]
    ).order("started_at", desc=True).execute()
    return response.data

@router.get("/preferences")
def get_preferences(user: dict = Depends(authenticate_user)):
    response = supabase.table("pomodoro_preferences").select("*").eq(
        "student_id", user["id"]
    ).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return response.data[0]

@router.patch("/preferences")
def update_preferences(
    work_minutes: int = 25,
    short_break_minutes: int = 5,
    long_break_minutes: int = 15,
    sessions_before_long_break: int = 4,
    user: dict = Depends(authenticate_user)
):
    response = supabase.table("pomodoro_preferences").upsert({
        "student_id": user["id"],
        "work_minutes": work_minutes,
        "short_break_minutes": short_break_minutes,
        "long_break_minutes": long_break_minutes,
        "sessions_before_long_break": sessions_before_long_break
    }).execute()
    return response.data[0]

@router.get("/{session_id}")
def get_session(session_id: str, user: dict = Depends(authenticate_user)):
    response = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).eq("student_id", user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Session not found")
    return response.data[0]

@router.post("/")
def start_session(body: StartSession, user: dict = Depends(authenticate_user)):
    # check for already active session
    active = supabase.table("pomodoro_sessions").select("*").eq(
        "student_id", user["id"]
    ).eq("status", "active").execute()
    
    if active.data:
        raise HTTPException(status_code=400, detail="You already have an active session running")

    # set task to doing if not already
    task = supabase.table("tasks").select("*").eq("id", body.task_id).execute()
    if task.data and not task.data[0].get("doing_started_at"):
        supabase.table("tasks").update({
            "doing_started_at": "now()",
            "board_column": "doing"
        }).eq("id", body.task_id).execute()

    response = supabase.table("pomodoro_sessions").insert({
        "student_id": user["id"],
        "task_id": body.task_id,
        "planned_seconds": body.planned_seconds,
        "status": "active"
    }).execute()

    session = response.data[0]

    log_event(
        student_id=user["id"],
        task_id=body.task_id,
        pomodoro_session_id=session["id"],
        event_type="pomodoro_started",
        new_value=str(body.planned_seconds)
    )

    return session

@router.patch("/{session_id}/complete")
def complete_session(session_id: str, body: UpdateSession, user: dict = Depends(authenticate_user)):
    session = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).eq("student_id", user["id"]).execute()
    if not session.data:
        raise HTTPException(status_code=404, detail="Session not found")

    response = supabase.table("pomodoro_sessions").update({
        "status": "completed",
        "actual_seconds": body.actual_seconds,
        "end_reason": "completed",
        "ended_at": "now()"
    }).eq("id", session_id).execute()

    current = session.data[0]

    # increment total focus seconds on task
    supabase.rpc("increment_focus", {
        "task_id": current["task_id"],
        "seconds": body.actual_seconds
    }).execute()

    log_event(
        student_id=user["id"],
        task_id=current["task_id"],
        pomodoro_session_id=session_id,
        event_type="pomodoro_completed",
        new_value=str(body.actual_seconds)
    )

    return response.data[0]

@router.patch("/{session_id}/abandon")
def abandon_session(session_id: str, body: UpdateSession, user: dict = Depends(authenticate_user)):
    session = supabase.table("pomodoro_sessions").select("*").eq(
        "id", session_id
    ).eq("student_id", user["id"]).execute()
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
        student_id=user["id"],
        task_id=current["task_id"],
        pomodoro_session_id=session_id,
        event_type="pomodoro_abandoned",
        previous_value=str(current["planned_seconds"]),
        new_value=str(body.actual_seconds)
    )

    return response.data[0]

@router.delete("/{session_id}")
def delete_session(session_id: str, user: dict = Depends(authenticate_user)):
    supabase.table("pomodoro_sessions").delete().eq(
        "id", session_id
    ).eq("student_id", user["id"]).execute()
    return {"message": "Session deleted"}