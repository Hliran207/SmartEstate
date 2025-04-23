import subprocess
import os
import json

# Configuration
OSM_PBF_FILE = "israel-latest.osm.pbf"  # You'll need to download this file
MAPPING_FILE = "mapping.json"
DB_CONNECTION = "postgresql://postgres:postgres@localhost:5432/smartestate"  # Update with your credentials

# Create mapping file
mapping = {
    "tables": {
        "osm_data": {
            "fields": [
                {"name": "osm_id", "type": "id"},
                {"name": "name", "type": "string"},
                {"name": "amenity", "type": "string"},
                {"name": "latitude", "type": "float"},
                {"name": "longitude", "type": "float"},
                {"name": "tags", "type": "jsonb"}
            ],
            "type": "point",
            "mapping": {
                "amenity": [
                    "school",
                    "kindergarten",
                    "college",
                    "shelter",
                    "hospital",
                    "pharmacy",
                    "park",
                    "playground"
                ]
            }
        }
    }
}

def create_mapping_file():
    with open(MAPPING_FILE, 'w') as f:
        json.dump(mapping, f, indent=2)

def import_osm_data():
    # Create mapping file
    create_mapping_file()
    
    # Run imposm import
    cmd = [
        "imposm", "import",
        "-connection", DB_CONNECTION,
        "-mapping", MAPPING_FILE,
        "-read", OSM_PBF_FILE,
        "-write"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print("OSM data import completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"Error during OSM data import: {e}")
    except FileNotFoundError:
        print("imposm command not found. Please install imposm3 first.")

if __name__ == "__main__":
    import_osm_data() 