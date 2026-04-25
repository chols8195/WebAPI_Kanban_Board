# backend/utils/logger.py
from db import supabase

def log_event(student_id: str, event_type: str, task_id: str = None, pomodoro_session_id: str = None, previous_value: str = None, new_value: str = None):
    supabase.table("activity_log").insert({
        "student_id": student_id,
        "task_id": task_id,
        "pomodoro_session_id": pomodoro_session_id,
        "event_type": event_type,
        "previous_value": previous_value,
        "new_value": new_value
    }).execute()
    
    