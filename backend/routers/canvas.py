# backend/routers/canvas.py
from fastapi import APIRouter, HTTPException
import httpx
import os
from db import supabase 

router = APIRouter(prefix="/canvas", tags=["canvas"])

CANVAS_BASE_URL = os.getenv("CANVAS_BASE_URL")

@ router.get("/")
async def sync_canvas(q: str):
    headers = {"Authorization": f"Bearer {q}"}
    
    async with httpx.AsyncClient() as client:
        # Fetch courses
        courses_res = await client.get(f"{CANVAS_BASE_URL}/courses")
        if courses_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Canvas token or could not fetch courses")
        
        courses = courses_res.json()
        
        # Fetch upcoming assignments 
        assignments_res = await client.get(f"{CANVAS_BASE_URL}/users/self/upcoming_assignments", headers=headers)
        if assignments_res.status_code != 200:
            raise HTTPException(status_code=400, detail="Could not fetch assignments")
        
        assignments = assignments_res.json()
        
    # Update and insert courses into db 
    for course in courses:
        supabase.table("courses").upsert({
            "canvas_course_id": str(course["id"]),
            "course_name": course.get("name"),
            "course_code": course.get("course_code"),
            "is_visible_on_board": True
        }).execute()
        
    # Update and insert assignments into db 
    for assignment in assignments:
        course = supabase.table("courses").select("id").eq(
            "canvas_course_id", str(assignment.get("course_id"))
        ).execute()
        
        course_id = course.data[0]["id"] if course.data else None 
        
        supabase.table("tasks").upsert({
            "canvas_assignment_id": str(assignment["id"]),
            "title": assignment.get("name"),
            "description": assignment.get("description"),
            "course_id": course_id,
            "card_type": "canvas_synced",
            "board_column": "todo",
            "due_date": assignment.get("due_at")
        }).execute()
        
    return {"message": "Canvas sync complete", "courses": len(courses), "assignments": len(assignments)}