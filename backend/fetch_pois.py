import requests
import json
from database import SessionLocal
from models import POI
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

# הגדרת סוגי המקומות שאנחנו רוצים למשוך
POI_TYPES = {
    'school': {
        'tags': ['["amenity"="school"]'],
        'name': 'בית ספר'
    },
    'kindergarten': {
        'tags': ['["amenity"="kindergarten"]'],
        'name': 'גן ילדים'
    },
    'university': {
        'tags': ['["amenity"="university"]', '["amenity"="college"]'],
        'name': 'מכללה/אוניברסיטה'
    },
    'shelter': {
        'tags': ['["amenity"="shelter"]', '["shelter_type"="public_bomb_shelter"]'],
        'name': 'מקלט'
    },
    'hospital': {
        'tags': ['["amenity"="hospital"]', '["amenity"="clinic"]'],
        'name': 'בית חולים/מרפאה'
    },
    'pharmacy': {
        'tags': ['["amenity"="pharmacy"]'],
        'name': 'בית מרקחת'
    },
    'park': {
        'tags': ['["leisure"="park"]'],
        'name': 'פארק'
    },
    'playground': {
        'tags': ['["leisure"="playground"]'],
        'name': 'גן שעשועים'
    },
    'library': {
        'tags': ['["amenity"="library"]'],
        'name': 'ספריה'
    },
    'place_of_worship': {
        'tags': ['["amenity"="place_of_worship"]["religion"="jewish"]'],
        'name': 'בית כנסת'
    }
}

def fetch_pois_from_osm():
    db = SessionLocal()
    try:
        # מחיקת כל הנתונים הקיימים
        db.query(POI).delete()
        db.commit()
        print("Cleared existing POIs from database")
        
        overpass_url = "https://overpass-api.de/api/interpreter"
        total_added = 0
        
        # הגדרת תיבת הגבולות של באר שבע
        # הקואורדינטות נלקחו מ-OpenStreetMap של באר שבע
        bbox = "31.2,34.7,31.3,34.9"  # min_lat,min_lon,max_lat,max_lon
        
        for poi_type, config in POI_TYPES.items():
            print(f"\nFetching {poi_type}...")
            for tag in config['tags']:
                # בניית שאילתת Overpass
                query = f"""
                [out:json][timeout:25];
                (
                    node{tag}({bbox});
                    way{tag}({bbox});
                    relation{tag}({bbox});
                );
                out body center qt;
                """
                
                try:
                    print(f"  Sending request for {tag}...")
                    response = requests.post(overpass_url, data={"data": query})
                    response.raise_for_status()
                    data = response.json()
                    elements_count = len(data.get('elements', []))
                    print(f"  Received {elements_count} elements")
                    
                    added_count = 0
                    for element in data.get('elements', []):
                        if element['type'] == 'node':
                            lat = element['lat']
                            lon = element['lon']
                        else:  # way or relation
                            lat = element.get('center', {}).get('lat')
                            lon = element.get('center', {}).get('lon')
                        
                        if lat and lon:
                            name = (element.get('tags', {}).get('name:he') or 
                                  element.get('tags', {}).get('name') or 
                                  f"{config['name']} ללא שם")
                            
                            # יצירת רשומה חדשה
                            poi = POI(
                                name=name,
                                type=poi_type,
                                latitude=lat,
                                longitude=lon,
                                address=element.get('tags', {}).get('addr:street'),
                                tags=json.dumps(element.get('tags', {}), ensure_ascii=False)
                            )
                            db.add(poi)
                            added_count += 1
                    
                    db.commit()
                    print(f"  Added {added_count} POIs to database")
                    total_added += added_count
                
                except Exception as e:
                    print(f"  Error fetching {poi_type} with tag {tag}: {str(e)}")
                    print(f"  Query was: {query}")
    
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()
        print(f"\nTotal POIs added to database: {total_added}")

if __name__ == "__main__":
    print("Starting POI fetch from OpenStreetMap...")
    fetch_pois_from_osm()
    print("Finished fetching POIs!") 