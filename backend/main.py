from fastapi import FastAPI, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware



app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Welcome to SmartEstate API 👋"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#session for saveing details
app.add_middleware(SessionMiddleware, secret_key = "your-super-secret-key", max_age = 1800)
models.Base.metadata.create_all(bind = engine)


class UserBase(BaseModel):
    email:EmailStr
    first_name: str
    last_name: str
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
db_dependency = Annotated[Session, Depends(get_db)]


@app.post("/users/")
async def create_user(user: UserBase, db: db_dependency):
    existing_user = db.query(models.Users).filter(models.Users.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already used!")

    db_user = models.Users(
        first_name = user.first_name,
        last_name = user.last_name,
        password = user.password,  # need to be hashed
        email = user.email
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login/")
async def login(request: Request, login_data: LoginRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail = "Invalid email or password")

    request.session["user"] ={
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    return {"message": f"Welcome {user.first_name}!"}
    

@app.get("/dashboard/")
async def dashboard(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "message": f"Hello, {user['first_name']}!",
        "first_name": user["first_name"],
        "email": user["email"],
    }

@app.post("/logout/")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}



