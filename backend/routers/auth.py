from fastapi import APIRouter
from pydantic import BaseModel, EmailStr


router = APIRouter(prefix="/auth", tags=["auth"])


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(SignInRequest):
    name: str


@router.post("/signin")
def signin(user: SignInRequest):
    return {"message": f"Successful signin, {user.email}"}


@router.post("/register")
def register(user: RegisterRequest):
    return {"message": f"Registration successful, {user.email}"}
