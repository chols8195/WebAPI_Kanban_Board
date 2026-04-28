from fastapi import APIRouter, HTTPException, Depends
from db import supabase
from routers.auth import authenticate_user

router = APIRouter(prefix="/logs", tags=["logs"])

@router.get("/")
def get_logs(
    task_id: str = None,
    event_type: str = None,
    user: dict = Depends(authenticate_user)
):
    query = supabase.table("activity_log").select("*").eq("student_id", user["id"])
    
    if task_id:
        query = query.eq("task_id", task_id)
    if event_type:
        query = query.eq("event_type", event_type)
    
    response = query.order("logged_at", desc=True).execute()
    return response.data

@router.get("/{log_id}")
def get_log(log_id: str, user: dict = Depends(authenticate_user)):
    response = supabase.table("activity_log").select("*").eq(
        "id", log_id
    ).eq("student_id", user["id"]).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return response.data[0]