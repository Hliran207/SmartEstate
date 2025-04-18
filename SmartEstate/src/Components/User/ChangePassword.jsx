import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { useAuth } from "./AuthContext";

const ChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isValidPassword = (password) => {
    const minLength = /.{8,}/;
    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
    return (
      minLength.test(password) &&
      hasNumber.test(password) &&
      hasSpecialChar.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.email) {
      setError("User not authenticated");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!isValidPassword(newPassword)) {
      setError(
        "Password must be at least 8 characters, include a number and a special character."
      );
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/change-password/",
        {
          email: user.email,
          current_password: currentPassword,
          new_password: newPassword,
        },
        { withCredentials: true }
      );
      setMessage(response.data.message);
      setError("");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Change password failed");
    }
  };
  if (!user) {
    return (
      <div className="container mt-5">
        <h2>Please log in to view your profile.</h2>
        <Link to="/login" className="btn btn-primary">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }} dir="rtl">
      <h3 className="mb-4 text-center">שינוי סיסמה</h3>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">סיסמה נוכחית</label>
          <input
            type="password"
            className="form-control"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">סיסמה חדשה</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">אישור סיסמה חדשה</label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          שמור סיסמה חדשה
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
