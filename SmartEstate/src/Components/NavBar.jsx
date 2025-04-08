
import react from 'react';

function NavBar(){
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">
            {/* Brand / Logo */}
            <a className="navbar-brand" href="#">
              MyBrand
            </a>
    
            {/* Toggler button (hamburger icon) for mobile view */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"     // <-- Bootstrap data attribute
              data-bs-target="#navbarNav"   // <-- Matches the id below
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
    
            {/* The collapsible menu items */}
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                {/* "ms-auto" pushes items to the right side */}
                <li className="nav-item">
                  <a className="nav-link active" aria-current="page" href="#">
                    Home
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    About
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#">
                    Contact
                  </a>
                </li>
                {/* You can add more nav items or dropdowns here */}
              </ul>
            </div>
          </div>
        </nav>
      );
    }
    
    export default NavBar;
