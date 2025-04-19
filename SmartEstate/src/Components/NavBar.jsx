import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faHome, faUserPlus, faSignInAlt } from '@fortawesome/free-solid-svg-icons';

const NavBar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

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
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4 py-3 shadow-sm">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <FontAwesomeIcon icon={faHome} className="me-2" />
          <span className="fw-bold">SmartEstate</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto align-items-center">
            {!user ? (
              <>
                <li className="nav-item">
                  <Link to="/register" className="nav-link d-flex align-items-center">
                    <FontAwesomeIcon icon={faUserPlus} className="me-2" />
                    Register
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/login" className="nav-link d-flex align-items-center">
                    <FontAwesomeIcon icon={faSignInAlt} className="me-2" />
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <li className="nav-item dropdown">
                <button 
                  className="btn btn-link nav-link dropdown-toggle d-flex align-items-center"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  <span className="text-white">{user}</span>
                </button>
                <div className={`dropdown-menu dropdown-menu-end ${isOpen ? 'show' : ''}`}>
                  <Link to="/personalPage" className="dropdown-item d-flex align-items-center">
                    <FontAwesomeIcon icon={faUser} className="me-2" />
                    Personal Page
                  </Link>
                  <button 
                    className="dropdown-item d-flex align-items-center text-danger"
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
                    Logout
                  </button>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
