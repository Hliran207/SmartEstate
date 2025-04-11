import React, { useEffect, useState } from "react";
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import NavBar from "./Components/NavBar";
import MapBeerSheva from "./Components/MapBeerSheva";
import "bootstrap/dist/css/bootstrap.css";

function App() {
  const [user, setUser] = useState(null); // shared user state

  useEffect(() => {
    axios
      .get("http://localhost:8000/dashboard/", { withCredentials: true })
      .then((res) => {
        setUser(res.data.first_name);
      })
      .catch(() => {
        setUser(null); // not logged in or session expired
      });
  }, []);

  return (
    <div>
      <NavBar user={user} setUser={setUser} />
      <div className="container mt-4">
        {user ? (
          <h1>Hello, {user} 👋</h1>
        ) : (
          <h1>ברוכים הבאים לאתר הנדל״ן הטוב בארץ עם דירוג השכונות</h1>
        )}
        <p>מפת באר שבע</p>
        <MapBeerSheva />
      </div>
    </div>
  );
}

export default App;
