from fastapi import FastAPI, HTTPException, Depends, Request ,Query
from pydantic import BaseModel, EmailStr
from typing import List, Annotated
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from geopy.geocoders import Nominatim





app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "Welcome to SmartEstate API 👋"}

app.add_middleware(SessionMiddleware, secret_key = "your-super-secret-key", max_age = 1800)

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

geolocator = Nominatim(user_agent="smartestate-app")

class UserBase(BaseModel):
    email:EmailStr
    first_name: str
    last_name: str
    password: str
    is_admin: bool = False

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    

class changePasswordRequest(BaseModel):
    email: EmailStr
    current_password: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr

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
        email = user.email,
        is_admin = user.is_admin
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login/")
async def login(request: Request, login_data: LoginRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == login_data.email).first()
    if not user or user.password != login_data.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    request.session["user"] = {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }
    return {
    "user": {
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    },
    "message": f"Welcome {user.first_name}!"
}

    

@app.get("/dashboard/")
async def dashboard(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return {
        "user": {  
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
        },
        "message": f"Hello, {user['first_name']}!"
    }

@app.post("/logout/")
async def logout(request: Request):
    request.session.clear()
    return {"message": "Logged out successfully"}

@app.post("/change-password/")
def change_password(request: Request, change_password_data: changePasswordRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == change_password_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.password != change_password_data.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    user.password = change_password_data.new_password
    db.commit()
    db.refresh(user)
    return {"message": "Password changed successfully"}


@app.get("/reverse_geocode/")
async def reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """
    Receives latitude & longitude and returns a textual address (reverse geocoding).
    """
    location = geolocator.reverse((lat, lon), exactly_one=True, language="he")
    if not location:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"address": location.address}
@app.put("/update-profile/")
def update_profile(request: Request, update_profile_data: UpdateProfileRequest, db: db_dependency):
    user = db.query(models.Users).filter(models.Users.email == update_profile_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.first_name = update_profile_data.first_name
    user.last_name = update_profile_data.last_name
    db.commit()
    db.refresh(user)
    return {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
    }
