from fastapi import APIRouter

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/")
def get_tasks():
    return


@router.post("/")
def create_task():
    return


@router.put("/{task_id}")
def update_task(task_id: int):
    return


@router.delete("/{task_id}")
def delete_task(task_id: int):
    return
