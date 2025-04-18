import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App.jsx";
import Register from "./Components/User/Register.jsx";
import Login from "./Components/User/LogIn.jsx";
import UserProfile from "./Components/User/UserProfile.jsx";
import ChangePassword from "./Components/User/ChangePassword.jsx";
import { AuthProvider } from "./Components/User/AuthContext.jsx";
import NavBar from "./Components/NavBar.jsx";
import UpdateProfile from "./Components/User/UpdateProfile.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/navbar" element={<NavBar />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          {/* Add more routes as needed */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
