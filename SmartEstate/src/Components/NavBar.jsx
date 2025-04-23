import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./User/AuthContext";
import "./NavBar.css";

const NavBar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/logout/",
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-gradient px-4 py-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <span className="logo-text">SMARTESTATE</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/register" className="nav-link">
                    הרשמה
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link">
                    התחברות
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <span className="nav-link welcome-text">
                    שלום, {user.first_name}
                  </span>
                </li>
                <li className="nav-item">
                  <Link
                    to={user.is_admin ? "/adminHomePage" : "/profile"}
                    className="nav-link"
                  >
                    {user.is_admin ? "אזור ניהול" : "דף אישי"}
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light nav-link"
                    onClick={handleLogout}
                  >
                    התנתק
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
