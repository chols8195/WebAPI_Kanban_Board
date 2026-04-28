from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone
from pydantic import BaseModel
from uuid import UUID
from utils.logger import log_event
from routers.auth import authenticate_user
from db import supabase


router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTask(BaseModel):
    # Required fields
    total_focus_seconds: int = 0
    board_column: str
    card_type: str
    title: str

    # Optional fields
    estimated_minutes: int | None = None
    description: str | None = None
    due_date: str | None = None


class UpdateTask(BaseModel):
    # Optional fields to be updated. Does not include canvas fields.
    board_column: str | None = None
    title: str | None = None
    card_type: str | None = None
    description: str | None = None
    total_focus_seconds: int | None = None
    estimated_minutes: int | None = None
    due_date: str | None = None


@router.get("")
def get_tasks(user: dict = Depends(authenticate_user)):

    # Find all tasks for a specific user
    result = supabase.table("tasks").select("*").eq("student_id", user["id"]).execute()

    # Handle error when finding rows
    if result.data is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch tasks",
        )

    return result.data


@router.post("", status_code=status.HTTP_201_CREATED)
def create_task(task: CreateTask, user: dict = Depends(authenticate_user)):

    # Build row to be inserted in db
    row = task.model_dump(exclude_none=True)

    row["student_id"] = user["id"]

    # Insert row into db
    result = supabase.table("tasks").insert(row).execute()

    # Handle error inserting row into db
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Task creation failed",
        )
        
    log_event(
        student_id=user["id"],
        task_id=result.data[0]["id"],
        event_type="task_created",
        new_value=task.board_column
    )

    return result.data[0]


@router.put("/{task_id}")
def update_task(
    task_id: UUID, task: UpdateTask, user: dict = Depends(authenticate_user)
):
    # Build row to be updated in db
    updates = task.model_dump(exclude_none=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No update fields provided"
        )
        
    current = supabase.table("tasks").select("*").eq("id", str(task_id)).eq("student_id", user["id"]).execute()
    if not current.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    # Logic to set task as "completed" in db
    if "board_column" in updates:
        if updates["board_column"] == "completed":
            updates["completed_at"] = datetime.now(timezone.utc)
        else:
            updates["completed_at"] = None

    # Save row in db
    result = (
        supabase.table("tasks")
        .update(updates)
        .eq("id", task_id)
        .eq("student_id", user["id"])
        .execute()
    )

    # Handle error if no row existed in db
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found."
        )

    if "board_column" in updates:
        log_event(
            student_id=user["id"],
            task_id=str(task_id),
            event_type="column_move",
            previous_value=current.data[0]["board_column"],
            new_value=updates["board_column"]
        )

    return result.data[0]


@router.delete("/{task_id}")
def delete_task(task_id: UUID, user: dict = Depends(authenticate_user)):

    # Find result to be deleted
    result = (
        supabase.table("tasks")
        .delete()
        .eq("id", task_id)
        .eq("student_id", user["id"])
        .execute()
    )

    # If nothing was deleted, return 404 no resource found
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found."
        )

    return {"message": "Task deleted"}
