from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from uuid import UUID
from routers.auth import authenticate_user
from db import supabase


router = APIRouter(prefix="/courses", tags=["courses"])


class AddCourse(BaseModel):
    # Required fields
    course_name: str
    is_visible_on_board: bool


class UpdateCourse(BaseModel):
    # Optional update fields
    course_name: str | None = None
    is_visible_on_board: bool | None = None
    canvas_course_id: str | None = None
    course_code: str | None = None
    instructor_name: str | None = None
    color_tag: str | None = None


@router.get("")
def get_courses(user: dict = Depends(authenticate_user)):

    # Find all courses for a specific user
    result = (
        supabase.table("courses").select("*").eq("student_id", user["id"]).execute()
    )

    # Handle error when finding rows
    if result.data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch courses",
        )

    return result.data


@router.post("", status_code=status.HTTP_201_CREATED)
def add_course(course: AddCourse, user: dict = Depends(authenticate_user)):

    # Build row to be inserted in db
    row = course.model_dump(exclude_none=True)

    row["student_id"] = user["id"]

    # Insert row into db
    result = supabase.table("courses").insert(row).execute()

    # Handle error inserting row into db
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Course creation failed",
        )

    return result.data[0]


@router.put("/{course_id}")
def update_course(
    course_id: UUID, course: UpdateCourse, user: dict = Depends(authenticate_user)
):
    # Build row to be updated in db
    updates = course.model_dump(exclude_none=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update fields provided."
        )

    # Save row in db
    result = (
        supabase.table("courses")
        .update(updates)
        .eq("id", course_id)
        .eq("student_id", user["id"])
        .execute()
    )

    # Handle error if no row existed in db
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found."
        )

    return result.data[0]


@router.delete("/{course_id}")
def delete_course(course_id: UUID, user: dict = Depends(authenticate_user)):

    # Find result to be deleted
    result = (
        supabase.table("courses")
        .delete()
        .eq("id", course_id)
        .eq("student_id", user["id"])
        .execute()
    )

    # If nothing was deleted, return 404 no resource found
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found."
        )

    return {"message": "Course deleted"}
