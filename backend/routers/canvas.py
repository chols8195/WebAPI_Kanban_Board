from fastapi import APIRouter, HTTPException, Request
import httpx
import os
from db import supabase

router = APIRouter(prefix="/canvas", tags=["canvas"])

CANVAS_BASE_URL = os.getenv("CANVAS_BASE_URL")
STUDENT_ID = os.getenv("TEST_STUDENT_ID")

@router.get("/")
async def sync_canvas(request: Request):
    q = request.query_params.get("q")
    headers = {"Authorization": f"Bearer {q}"}
    
    async with httpx.AsyncClient() as client:
        
        # fetch courses
        courses_res = await client.get(f"{CANVAS_BASE_URL}/courses", headers=headers)
        if courses_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Courses error: {courses_res.text}")
        
        courses = courses_res.json()

        # upsert courses first
        for course in courses:
            supabase.table("courses").upsert({
                "student_id": STUDENT_ID,
                "canvas_course_id": str(course["id"]),
                "course_name": course.get("name"),
                "course_code": course.get("course_code"),
                "is_visible_on_board": True
            }).execute()

        # fetch assignments per course
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

    # upsert assignments
    for assignment in all_assignments:
        course = supabase.table("courses").select("id").eq(
            "canvas_course_id", str(assignment.get("course_id"))
        ).execute()
        
        course_id = course.data[0]["id"] if course.data else None

        supabase.table("tasks").upsert({
            "student_id": STUDENT_ID,
            "canvas_assignment_id": str(assignment["id"]),
            "title": assignment.get("name"),
            "description": assignment.get("description"),
            "course_id": course_id,
            "card_type": "canvas_synced",
            "board_column": "todo",
            "due_date": assignment.get("due_at")
        }).execute()

    return {"message": "Canvas sync complete", "courses": len(courses), "assignments": len(all_assignments)}