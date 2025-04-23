import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';

// תיקון לבעיית האייקונים של Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// הגדרת האייקונים עבור סוגי המקומות השונים
const ICONS = {
  school: createCustomIcon('🏫'),
  kindergarten: createCustomIcon('👶'),
  university: createCustomIcon('🎓'),
  shelter: createCustomIcon('🏢'),
  hospital: createCustomIcon('🏥'),
  pharmacy: createCustomIcon('💊'),
  park: createCustomIcon('🌳'),
  playground: createCustomIcon('🎪'),
  library: createCustomIcon('📚'),
  place_of_worship: createCustomIcon('🕍'),
  default: DefaultIcon
};

// פונקציה ליצירת אייקון מותאם אישית
function createCustomIcon(emoji) {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div class="custom-marker"><span>${emoji}</span></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
}

// רשימת השכבות הזמינות
const AVAILABLE_LAYERS = [
  { id: 'school', name: 'בתי ספר', icon: '🏫' },
  { id: 'kindergarten', name: 'גני ילדים', icon: '👶' },
  { id: 'university', name: 'מכללות ואוניברסיטאות', icon: '🎓' },
  { id: 'shelter', name: 'מקלטים', icon: '🏢' },
  { id: 'hospital', name: 'בתי חולים', icon: '🏥' },
  { id: 'pharmacy', name: 'בתי מרקחת', icon: '💊' },
  { id: 'park', name: 'פארקים', icon: '🌳' },
  { id: 'playground', name: 'גני שעשועים', icon: '🎪' },
  { id: 'library', name: 'ספריות', icon: '📚' },
  { id: 'place_of_worship', name: 'בתי כנסת', icon: '🕍' }
];

// קומפוננטת החיפוש
function SearchControl({ onSearch }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/search?q=${encodeURIComponent(query)}`);
      setResults(response.data);
      if (response.data.length > 0) {
        // לא נעבור אוטומטית לתוצאה הראשונה, נחכה שהמשתמש יבחר
        setResults(response.data);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'address':
        return '📍';
      case 'school':
        return '🏫';
      case 'kindergarten':
        return '👶';
      case 'university':
        return '🎓';
      case 'shelter':
        return '🏢';
      case 'hospital':
        return '🏥';
      case 'pharmacy':
        return '💊';
      case 'park':
        return '🌳';
      case 'playground':
        return '🎪';
      default:
        return '📌';
    }
  };

  return (
    <div className="search-control">
      <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="הזן כתובת או שם מקום..."
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? '...' : '🔍'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          {results.map((result, index) => (
            <div
              key={index}
              className="search-result-item"
              onClick={() => {
                onSearch(result);
                setResults([]); // נסתיר את תוצאות החיפוש אחרי בחירה
                setQuery(''); // ננקה את שדה החיפוש
              }}
            >
              <span className="result-icon">{getResultIcon(result.type)}</span>
              <div className="result-details">
                <div className="result-name">{result.name}</div>
                {result.address && result.address !== result.name && (
                  <div className="result-address">{result.address}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// קומפוננטה להזזת המפה למיקום
function MapMover({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [center, map]);
  return null;
}

// קומפוננטה ללחיצות על המפה
function ClickHandler({ setClicked }) {
  useMapEvent('click', async (e) => {
    try {
      const response = await axios.get(`http://localhost:8000/reverse_geocode/?lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
      setClicked({
        ...e.latlng,
        address: response.data.address
      });
    } catch (error) {
      console.error('Error getting address:', error);
      setClicked({
        ...e.latlng,
        address: 'כתובת לא נמצאה'
      });
    }
  });
  return null;
}

// קומפוננטת בקרת השכבות
function LayerControl({ activeLayers, onToggleLayer }) {
  return (
    <div className="layer-control" style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
      <h3>שכבות</h3>
      {AVAILABLE_LAYERS.map(layer => (
        <div key={layer.id}>
          <label>
            <input
              type="checkbox"
              checked={activeLayers.includes(layer.id)}
              onChange={() => onToggleLayer(layer.id)}
            />
            {layer.icon} {layer.name}
          </label>
        </div>
      ))}
    </div>
  );
}

// פונקציה לחישוב מרחק בין שתי נקודות (בקילומטרים)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// פונקציה למציאת המקומות הקרובים ביותר מכל סוג
function findNearestPOIs(lat, lon, pois, activeLayers) {
  const nearestPOIs = {};
  
  activeLayers.forEach(layer => {
    const poisOfType = pois.filter(poi => poi.properties.amenity === layer);
    if (poisOfType.length > 0) {
      const distances = poisOfType.map(poi => ({
        ...poi,
        distance: calculateDistance(
          lat, 
          lon, 
          poi.geometry.coordinates[1], 
          poi.geometry.coordinates[0]
        )
      }));
      
      // מיון לפי מרחק ולקיחת הקרוב ביותר
      distances.sort((a, b) => a.distance - b.distance);
      nearestPOIs[layer] = distances[0];
    }
  });
  
  return nearestPOIs;
}

export default function MapBeerSheva() {
  const center = [31.252973, 34.791462];
  const [clicked, setClicked] = useState(null);
  const [activeLayers, setActiveLayers] = useState([]);
  const [pois, setPois] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [nearestPOIs, setNearestPOIs] = useState(null);

  useEffect(() => {
    const fetchPOIs = async () => {
      if (activeLayers.length === 0) {
        setPois([]);
        setNearestPOIs(null);
        return;
      }

      try {
        const response = await axios.post('http://localhost:8000/map/pois', {
          layers: activeLayers
        });
        setPois(response.data.features);
        
        // אם יש נקודה מסומנת, נחשב מחדש את המרחקים
        if (clicked) {
          const nearest = findNearestPOIs(
            clicked.lat,
            clicked.lng,
            response.data.features,
            activeLayers
          );
          setNearestPOIs(nearest);
        }
      } catch (error) {
        console.error('Error fetching POIs:', error);
      }
    };

    fetchPOIs();
  }, [activeLayers, clicked]);

  const handleToggleLayer = (layerId) => {
    setActiveLayers(prev =>
      prev.includes(layerId)
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleSearchResult = (result) => {
    const newLocation = {
      lat: result.latitude,
      lng: result.longitude,
      address: result.address || result.name
    };
    
    setSearchResult([result.latitude, result.longitude]);
    setClicked(newLocation);
    
    // חישוב מרחקים למקומות הקרובים
    if (pois.length > 0) {
      const nearest = findNearestPOIs(
        result.latitude,
        result.longitude,
        pois,
        activeLayers
      );
      setNearestPOIs(nearest);
    }
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} מטר`;
    }
    return `${distance.toFixed(1)} ק"מ`;
  };

  return (
    <div>
      <div className="search-section">
        <h2>חיפוש מיקום</h2>
        <SearchControl onSearch={handleSearchResult} />
      </div>

      <div style={{ position: 'relative', marginTop: '20px' }}>
        <MapContainer center={center} zoom={13} style={{ height: '75vh', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {searchResult && <MapMover center={searchResult} />}
          <ClickHandler setClicked={(location) => {
            setClicked(location);
            if (pois.length > 0) {
              const nearest = findNearestPOIs(
                location.lat,
                location.lng,
                pois,
                activeLayers
              );
              setNearestPOIs(nearest);
            }
          }} />

          {pois.map((poi, index) => (
            <Marker 
              key={`${poi.properties.id}-${index}`}
              position={[
                poi.geometry.coordinates[1],
                poi.geometry.coordinates[0]
              ]}
              icon={ICONS[poi.properties.amenity] || ICONS.default}
            >
              <Popup>
                <div style={{ direction: 'rtl', textAlign: 'right' }}>
                  <strong>{poi.properties.name || 'ללא שם'}</strong>
                  <br />
                  {AVAILABLE_LAYERS.find(l => l.id === poi.properties.amenity)?.name}
                </div>
              </Popup>
            </Marker>
          ))}

          {clicked && (
            <Marker 
              position={[clicked.lat, clicked.lng]}
              icon={DefaultIcon}
            >
              <Popup>
                <div style={{ direction: 'rtl', textAlign: 'right' }}>
                  <strong>{clicked.address}</strong>
                  <br />
                  נ.צ.: {clicked.lat.toFixed(5)}, {clicked.lng.toFixed(5)}
                  {nearestPOIs && Object.keys(nearestPOIs).length > 0 && (
                    <>
                      <hr />
                      <strong>מרחקים למקומות קרובים:</strong>
                      <ul style={{ margin: '5px 0', paddingRight: '20px' }}>
                        {Object.entries(nearestPOIs).map(([type, poi]) => (
                          <li key={type}>
                            {AVAILABLE_LAYERS.find(l => l.id === type)?.name}: {formatDistance(poi.distance)}
                            <br />
                            <small>({poi.properties.name || 'ללא שם'})</small>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        <LayerControl 
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      </div>
    </div>
  );
} 