from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import jwt
import re
from datetime import datetime, timedelta

router = APIRouter()

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"

WEAK_PASSWORDS = {
    '123456', '12345678', '123456789', 'password', 'password1',
    '0000', '00000000', '111111', 'qwerty', 'abc123',
    'letmein', 'welcome', 'monkey', 'master', 'dragon',
    'login', 'princess', 'admin', 'iloveyou'
}

class AuthRequest(BaseModel):
    identifier: str  # Email or Phone Number
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str

# Mock user DB
users_db = {}


def validate_password(password: str) -> str | None:
    """Returns error message if invalid, None if valid."""
    if password.lower() in WEAK_PASSWORDS:
        return "This password is too common. Choose something stronger."
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if len(password) > 64:
        return "Password must not exceed 64 characters."
    if not re.search(r'[A-Z]', password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r'[a-z]', password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r'[0-9]', password):
        return "Password must contain at least one number."
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>/?]', password):
        return "Password must contain at least one special character."
    return None


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/signup", response_model=AuthResponse)
async def signup(request: AuthRequest):
    if request.identifier in users_db:
        raise HTTPException(status_code=400, detail="User already exists")

    pw_error = validate_password(request.password)
    if pw_error:
        raise HTTPException(status_code=422, detail=pw_error)

    users_db[request.identifier] = {"password": request.password}
    token = create_access_token(data={"sub": request.identifier})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=AuthResponse)
async def login(request: AuthRequest):
    if request.identifier not in users_db or users_db[request.identifier]["password"] != request.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(data={"sub": request.identifier})
    return {"access_token": token, "token_type": "bearer"}
