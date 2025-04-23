from fastapi import FastAPI, HTTPException, Depends, Request ,Query
from pydantic import BaseModel, EmailStr
from typing import List, Annotated, Optional
import models
from database import engine, SessionLocal
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from geopy.geocoders import Nominatim
import json
import requests





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

class UserPreferencesRequest(BaseModel):
    propertyType: str
    budget: int
    location: str
    rooms: str
    size: int
    parking: bool = False
    elevator: bool = False
    balcony: bool = False
    garden: bool = False
    petsAllowed: bool = False
    accessibility: bool = False
    additionalNotes: str = None

class MapLayerRequest(BaseModel):
    layers: List[str]  # List of amenity types to show (e.g., ['school', 'kindergarten'])
    bbox: Optional[str] = None  # Optional bounding box for filtering

class POIResponse(BaseModel):
    id: int
    name: str
    type: str
    latitude: float
    longitude: float
    description: Optional[str]
    address: Optional[str]
    tags: Optional[str]

    class Config:
        from_attributes = True

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
        "is_admin": user.is_admin
    }
    return {
        "user": {
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_admin
        },
        "is_admin": user.is_admin,
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

@app.post("/user-preferences/")
async def save_user_preferences(request: Request, preferences: UserPreferencesRequest, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if preferences already exist for this user
    existing_preferences = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == db_user.ID
    ).first()

    if existing_preferences:
        # Update existing preferences
        existing_preferences.property_type = preferences.propertyType
        existing_preferences.budget = preferences.budget
        existing_preferences.location = preferences.location
        existing_preferences.rooms = preferences.rooms
        existing_preferences.size = preferences.size
        existing_preferences.parking = preferences.parking
        existing_preferences.elevator = preferences.elevator
        existing_preferences.balcony = preferences.balcony
        existing_preferences.garden = preferences.garden
        existing_preferences.pets_allowed = preferences.petsAllowed
        existing_preferences.accessibility = preferences.accessibility
        existing_preferences.additional_notes = preferences.additionalNotes
    else:
        # Create new preferences
        new_preferences = models.UserPreferences(
            user_id=db_user.ID,
            property_type=preferences.propertyType,
            budget=preferences.budget,
            location=preferences.location,
            rooms=preferences.rooms,
            size=preferences.size,
            parking=preferences.parking,
            elevator=preferences.elevator,
            balcony=preferences.balcony,
            garden=preferences.garden,
            pets_allowed=preferences.petsAllowed,
            accessibility=preferences.accessibility,
            additional_notes=preferences.additionalNotes
        )
        db.add(new_preferences)

    db.commit()
    return {"message": "Preferences saved successfully"}

@app.get("/user-preferences/")
async def get_user_preferences(request: Request, db: db_dependency):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db_user = db.query(models.Users).filter(models.Users.email == user["email"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    preferences = db.query(models.UserPreferences).filter(
        models.UserPreferences.user_id == db_user.ID
    ).first()

    if not preferences:
        raise HTTPException(status_code=404, detail="Preferences not found")

    return {
        "propertyType": preferences.property_type,
        "budget": preferences.budget,
        "location": preferences.location,
        "rooms": preferences.rooms,
        "size": preferences.size,
        "parking": preferences.parking,
        "elevator": preferences.elevator,
        "balcony": preferences.balcony,
        "garden": preferences.garden,
        "petsAllowed": preferences.pets_allowed,
        "accessibility": preferences.accessibility,
        "additionalNotes": preferences.additional_notes
    }

@app.get("/admin/analytics/users")
async def get_user_analytics(request: Request, db: db_dependency):
    user = request.session.get("user")
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get total users count
    total_users = db.query(models.Users).count()
    
    # Get active users (users who logged in in the last 30 days)
    # For now, we'll return all users as active since we don't track last login
    active_users = total_users
    
    # Get new users (registered in the last 30 days)
    # For now, we'll return all users as new since we don't track registration date
    new_users = total_users

    # Get user activity data (mock data for now)
    user_activity = [
        {"date": "2024-01", "activeUsers": total_users, "newUsers": new_users},
        {"date": "2024-02", "activeUsers": total_users, "newUsers": new_users},
        {"date": "2024-03", "activeUsers": total_users, "newUsers": new_users}
    ]

    # Get user types distribution
    admin_count = db.query(models.Users).filter(models.Users.is_admin == True).count()
    regular_count = total_users - admin_count
    user_types = [
        {"type": "מנהלים", "count": admin_count},
        {"type": "משתמשים רגילים", "count": regular_count}
    ]

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "newUsers": new_users,
        "userActivity": user_activity,
        "userTypes": user_types
    }

@app.get("/map/layers")
async def get_map_layers(request: Request, db: db_dependency):
    """Get available map layers"""
    return {
        "layers": [
            {"id": "school", "name": "בתי ספר"},
            {"id": "kindergarten", "name": "גני ילדים"},
            {"id": "college", "name": "מכללות"},
            {"id": "shelter", "name": "מקלטים"},
            {"id": "hospital", "name": "בתי חולים"},
            {"id": "pharmacy", "name": "בתי מרקחת"},
            {"id": "park", "name": "פארקים"},
            {"id": "playground", "name": "גני שעשועים"}
        ]
    }

@app.post("/map/pois")
async def get_points_of_interest(request: Request, layer_request: MapLayerRequest, db: db_dependency):
    """Get points of interest for selected layers"""
    if not layer_request.layers:
        return {"features": []}

    # Query POIs from database based on requested layers
    query = db.query(models.POI)
    if layer_request.layers:
        query = query.filter(models.POI.type.in_(layer_request.layers))
    
    pois = query.all()
    
    # Convert to GeoJSON
    features = []
    for poi in pois:
        feature = {
            "type": "Feature",
            "properties": {
                "id": str(poi.id),
                "name": poi.name,
                "amenity": poi.type,  # Using the POI type as amenity for frontend compatibility
                "tags": json.loads(poi.tags) if poi.tags else {}
            },
            "geometry": {
                "type": "Point",
                "coordinates": [poi.longitude, poi.latitude]
            }
        }
        features.append(feature)
    
    return {
        "type": "FeatureCollection",
        "features": features
    }

@app.get("/pois", response_model=List[POIResponse])
def get_pois(db: db_dependency, type: Optional[str] = None):
    """Get all POIs, optionally filtered by type"""
    query = db.query(models.POI)
    if type:
        query = query.filter(models.POI.type == type)
    return query.all()

@app.get("/poi_types")
def get_poi_types(db: db_dependency):
    """Get all unique POI types in the database"""
    types = db.query(models.POI.type).distinct().all()
    return [t[0] for t in types if t[0]]  # Filter out None values and extract from tuples

@app.get("/poi/{poi_id}", response_model=POIResponse)
def get_poi(poi_id: int, db: db_dependency):
    """Get a specific POI by ID"""
    poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")
    return poi

@app.post("/poi", response_model=POIResponse)
def create_poi(poi: POIResponse, db: db_dependency):
    """Create a new POI"""
    db_poi = models.POI(**poi.dict())
    db.add(db_poi)
    db.commit()
    db.refresh(db_poi)
    return db_poi

@app.put("/poi/{poi_id}", response_model=POIResponse)
def update_poi(poi_id: int, poi: POIResponse, db: db_dependency):
    """Update an existing POI"""
    db_poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not db_poi:
        raise HTTPException(status_code=404, detail="POI not found")
    
    for key, value in poi.dict(exclude_unset=True).items():
        setattr(db_poi, key, value)
    
    db.commit()
    db.refresh(db_poi)
    return db_poi

@app.delete("/poi/{poi_id}")
def delete_poi(poi_id: int, db: db_dependency):
    """Delete a POI"""
    db_poi = db.query(models.POI).filter(models.POI.id == poi_id).first()
    if not db_poi:
        raise HTTPException(status_code=404, detail="POI not found")
    
    db.delete(db_poi)
    db.commit()
    return {"message": "POI deleted successfully"}

@app.get("/search")
async def search_pois(q: str, db: db_dependency):
    """Search POIs and addresses"""
    results = []
    
    # חיפוש ב-POIs
    query = db.query(models.POI).filter(
        models.POI.name.ilike(f"%{q}%")
    )
    poi_results = query.all()
    
    # המרת תוצאות ה-POIs לפורמט אחיד
    results.extend([{
        "name": poi.name,
        "type": poi.type,
        "latitude": poi.latitude,
        "longitude": poi.longitude,
        "address": poi.address,
        "source": "poi"
    } for poi in poi_results])
    
    # חיפוש כתובת באמצעות geocoding
    try:
        # הוספת "באר שבע" לחיפוש אם לא צוין
        search_query = q if "באר שבע" in q.lower() else f"{q}, באר שבע"
        locations = geolocator.geocode(
            search_query,
            exactly_one=False,
            language="he",
            country_codes=["il"],
            limit=5
        )
        
        if locations:
            for location in locations:
                # בדיקה שהמיקום אכן בבאר שבע
                if "באר שבע" in location.address:
                    results.append({
                        "name": location.address,
                        "type": "address",
                        "latitude": location.latitude,
                        "longitude": location.longitude,
                        "address": location.address,
                        "source": "geocoding"
                    })
    except Exception as e:
        print(f"Geocoding error: {e}")
    
    return results
