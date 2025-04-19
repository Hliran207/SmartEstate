import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import App from "./App.jsx";
import Register from "./Components/User/Register.jsx";
import Login from "./Components/User/LogIn.jsx";
import UserProfile from "./Components/User/UserProfile.jsx";
import AdminHomePage from "./Components/Admin/AdminHomePage.jsx";
import PersonalQuestionnaire from "./Components/User/PersonalQuestionnaire.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/adminHomePage" element={<AdminHomePage />} />
        <Route path="/questionnaire" element={<PersonalQuestionnaire />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
