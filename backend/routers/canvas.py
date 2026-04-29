from fastapi import APIRouter, HTTPException, Depends
import httpx
import os
from db import supabase
from routers.auth import authenticate_user

router = APIRouter(prefix="/canvas", tags=["canvas"])

@router.get("/")
async def sync_canvas(user: dict = Depends(authenticate_user)):
    CANVAS_BASE_URL = os.getenv("CANVAS_BASE_URL")
    
    if not CANVAS_BASE_URL:
        raise HTTPException(status_code=500, detail="Canvas base URL not configured")
    
    student = supabase.table("students").select("canvas_access_token").eq(
        "id", user["id"]
    ).execute()
    
    canvas_token = student.data[0].get("canvas_access_token")
    if not canvas_token:
        raise HTTPException(status_code=400, detail="No Canvas token found")
    
    headers = {"Authorization": f"Bearer {canvas_token}"}
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        courses_res = await client.get(f"{CANVAS_BASE_URL}/courses", headers=headers)
        if courses_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Courses error: {courses_res.text}")
        
        courses = courses_res.json()

        for course in courses:
            supabase.table("courses").upsert({
            "student_id": user["id"],
            "canvas_course_id": str(course["id"]),
            "course_name": course.get("name"),
            "course_code": course.get("course_code"),
            "is_visible_on_board": True
        }, on_conflict="canvas_course_id").execute()

        all_assignments = []
        for course in courses:
            assignments_res = await client.get(
                f"{CANVAS_BASE_URL}/courses/{course['id']}/assignments",
                headers=headers
            )
            if assignments_res.status_code == 200:
                assignments = assignments_res.json()
                for a in assignments:
                    a["course_id"] = course["id"]
                all_assignments.extend(assignments)

    for assignment in all_assignments:
        course = supabase.table("courses").select("id").eq(
            "canvas_course_id", str(assignment.get("course_id"))
        ).execute()
        
        course_id = course.data[0]["id"] if course.data else None

        supabase.table("tasks").upsert({
        "student_id": user["id"],
        "canvas_assignment_id": str(assignment["id"]),
        "title": assignment.get("name"),
        "description": assignment.get("description"),
        "course_id": course_id,
        "card_type": "canvas_synced",
        "board_column": "todo",
        "due_date": assignment.get("due_at")
    }, on_conflict="canvas_assignment_id").execute()

    return {"message": "Canvas sync complete", "courses": len(courses), "assignments": len(all_assignments)}