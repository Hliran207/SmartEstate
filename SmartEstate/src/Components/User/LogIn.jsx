import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/login/",
        formData,
        {
          withCredentials: true,
        }
      );

      const isAdmin = response.data.is_admin;

      if (isAdmin) {
        navigate("/adminHomePage");
      } else {
        setUser(response.data.user);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Login Failed :(");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 shadow rounded bg-white"
      style={{ maxWidth: "400px", margin: "50px auto" }}
    >
      <h2 className="text-center mb-4">Login</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Email address
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="form-control"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter password"
          className="form-control"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Login
      </button>
    </form>
  );
};

export default Login;
