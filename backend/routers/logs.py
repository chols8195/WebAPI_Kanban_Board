# backend/routers/logs.py
from fastapi import APIRouter, HTTPException
from db import supabase

router = APIRouter(prefix="/logs", tags=["logs"])

# GET all logs for a student 
def get_logs(student_id: str = None, task_id: str = None, event_type: str = None):
    query = supabase.table("activity_log").select("*")
    
    if student_id:
        query = query.eq("student_id", student_id)
    if task_id:
        query = query.eq("task_id", task_id)
    if event_type:
        query = query.eq("event_type", event_type)
        
    response = query.order("logged_id", desc=True).execute()
    return response.data

# GET a single log entry 
@router.get("/{log_id}")
def get_log(log_id: str):
    response = supabase.table("activity_log").select("*").eq("id", log_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    
    return response.data[0]