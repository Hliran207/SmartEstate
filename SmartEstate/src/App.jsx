import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "./Components/NavBar";

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
          <h1>Welcome to my React + Bootstrap App</h1>
        )}
        <p>Here’s some content below the navbar.</p>
      </div>
    </div>
  );
}

export default App;
