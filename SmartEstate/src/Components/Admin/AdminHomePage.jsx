import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminHomePage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // You can validate the session here if needed
    setUser("Admin"); // Replace with actual data from server if needed
  }, []);

  const options = [
    {
      title: "Manage Users",
      description: "View, edit, or delete users",
      path: "/admin/users",
    },
    {
      title: "Manage Apartments",
      description: "Edit or delete apartment listings",
      path: "/admin/listings",
    },
    {
      title: "View Feedback",
      description: "See user reviews and feedback",
      path: "/admin/feedback",
    },
    {
      title: "Manage Reviews",
      description: "Manage user reviews and feedback",
      path: "/admin/feedback",
    },
    {
      title: "Analytics",
      description: "View usage statistics and reports",
      path: "/admin/analytics",
    },
    {
      title: "View the Site",
      description: "Go back to the main site homepage",
      path: "/",
    },
  ];

  return (
    <>
      <div className="container mt-4">
        <h2 className="mb-4">Admin Dashboard</h2>
        <div className="row">
          {options.map((option, index) => (
            <div key={index} className="col-md-4 mb-3">
              <div
                className="card h-100 shadow-sm"
                onClick={() => navigate(option.path)}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">{option.title}</h5>
                  <p className="card-text text-muted">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AdminHomePage;
