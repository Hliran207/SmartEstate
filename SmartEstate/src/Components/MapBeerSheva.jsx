import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';
import axios from 'axios';

function ClickHandler({ setClicked }) {
  useMapEvent('click', async (e) => {
    const { lat, lng } = e.latlng;

    // קריאה ל‑FastAPI
    try {
      const res = await axios.get('http://localhost:8000/reverse_geocode/', {
        params: { lat, lon: lng },
      });
      setClicked({ lat, lng, address: res.data.address });
    } catch {
      setClicked({ lat, lng, address: 'לא נמצאה כתובת' });
    }
  });

  return null; // רכיב “וירטואלי” – לא מציג כלום
}

export default function MapBeerSheva() {
  const center = [31.252973, 34.791462];
  const [clicked, setClicked] = useState(null);

  return (
    <MapContainer center={center} zoom={13} style={{ height: '75vh', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* מאזין ללחיצות */}
      <ClickHandler setClicked={setClicked} />

      {/* מציג Marker ו‑Popup רק אם נלחץ */}
      {clicked && (
        <Marker position={[clicked.lat, clicked.lng]}>
          <Popup>
            <strong>{clicked.address}</strong>
            <br />
            (lat: {clicked.lat.toFixed(5)}, lon: {clicked.lng.toFixed(5)})
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
