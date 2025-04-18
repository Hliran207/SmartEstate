import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import { useAuth } from "./AuthContext";

const UpdateProfile = () => {
  const { user, setUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  console.log("User from context:", user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        "http://localhost:8000/update-profile/",
        {
          email: user.email,
          first_name: firstName,
          last_name: lastName,
        },
        { withCredentials: true }
      );
      setUser(response.data);
      setMessage("Profile updated successfully!");
      setError("");
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.detail || "Update failed");
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
    <div className="container mt-5" dir="rtl" style={{ maxWidth: "500px" }}>
      <h3 className="mb-4">Edit Personal Data</h3>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default UpdateProfile;
