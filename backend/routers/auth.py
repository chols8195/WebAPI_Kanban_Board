from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from pwdlib import PasswordHash
from db import supabase
import jwt
import os

router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/signin")
password_hash = PasswordHash.recommended()

jwt_secret_key = os.getenv("JWT_SECRET_KEY")
access_token_expires = 60
jwt_algorithm = "HS256"


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class RegisterRequest(SignInRequest):
    name: str


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(data: dict) -> str:
    # Gather data used to create token
    to_encode = data.copy()

    # Set the expiration date for the token
    expiration = datetime.now(timezone.utc) + timedelta(minutes=access_token_expires)
    to_encode.update({"exp": expiration})

    return jwt.encode(to_encode, jwt_secret_key, algorithm=jwt_algorithm)


def authenticate_user(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode the JWT token from the payload and find the user
        payload = jwt.decode(token, jwt_secret_key, algorithms=[jwt_algorithm])
        user_id = payload.get("sub")

        # Invalid token if no user id
        if user_id is None:
            raise credentials_exception

    # If token is expired, raise 401 expired token
    except jwt.ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired token",
            headers={"WWW-Authenticate": "bearer"},
        ) from exc

    # If token is invalid, raise 401
    except jwt.InvalidTokenError as exc:
        raise credentials_exception from exc

    # JWT token is valid return user information
    result = (
        supabase.table("students")
        .select("id, email, display_name")
        .eq("id", user_id)
        .execute()
    )

    # If JWT is valid but no user associated with it raise exception
    if not result.data:
        raise credentials_exception

    # Return user information
    return result.data[0]


@router.post("/signin")
def signin(user: SignInRequest):

    # Find the user using request email
    existing_user = (
        supabase.table("students")
        .select("*")
        .eq("email", user.email)
        .single()
        .execute()
    )

    # If user DNE return 401 unauthorized
    if not existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password or username",
        )

    db_user = existing_user.data

    # Verify password hash
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password or username",
        )

    # Create a JWT access token for the user
    token = create_access_token({"sub": str(db_user["id"]), "email": db_user["email"]})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest):

    # Check if user exists using request email
    existing_user = (
        supabase.table("students").select("id").eq("email", user.email).execute()
    )

    # Return 409 if user exists already
    if existing_user.data:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Build row to be inserted
    row = {
        "email": user.email,
        "password_hash": hashed_password,
        "display_name": user.name,
    }

    # Insert row in db
    result = supabase.table("students").insert(row).execute()

    # If no result from insertion, return 500 internal server error
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed.",
        )

    return {"email": user.email, "display_name": user.name}


@router.get("/me")
def get_me(user: dict = Depends(authenticate_user)):
    # Protected route to return current user information
    return user
