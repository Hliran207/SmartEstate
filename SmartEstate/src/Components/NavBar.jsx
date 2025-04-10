import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8000/logout/', {}, { withCredentials: true });
      setUser(null); 
      navigate('/'); 
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link to="/" className="navbar-brand">MyApp</Link>
      <div className="collapse navbar-collapse justify-content-end">
        <ul className="navbar-nav">
          {!user ? (
            <>
              <li className="nav-item">
                <Link to="/register" className="nav-link">Register</Link>
              </li>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <span className="nav-link">Hi, {user}</span>
              </li>
              <li className="nav-item">
                <Link to="/personalPage" className="nav-link">Personal Page</Link>
              </li>
              <li className="nav-item">
                <button className="btn btn-link nav-link" onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
