import React, { use, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const UserProfile = () => {
  const { user } = useAuth();

  const [favorites, setFavorites] = useState([
    { id: 1, title: "דירה בתל אביב, 3 חדרים", address: "תל אביב" },
    { id: 2, title: "דירה בירושלים, 4 חדרים", address: "ירושלים" },
    { id: 3, title: "דירה בחיפה, 2 חדרים", address: "חיפה" },
  ]);
  const [review, setReview] = useState("");

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    alert("תודה על המשוב שלך!");
    setReviews("");
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
    <div className="container mt-5">
      <div className="row">
        {/* Personal Info */}
        <div className="col-md-4 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Personal Information</h5>
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <Link
                to="/update-profile"
                className="btn btn-outline-primary me-2 w-100 mb-2"
              >
                Edit Details
              </Link>
              <Link
                to="/change-password"
                className="btn btn-outline-secondary w-100"
              >
                Change Password
              </Link>
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div className="col-md-8 mb-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">Saved Apartments</h5>
              {favorites.length > 0 ? (
                <ul className="list-group">
                  {favorites.map((item) => (
                    <li key={item.id} className="list-group-item">
                      <strong>{item.title}</strong> - {item.address}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No saved apartments yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Leave a Review</h5>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    placeholder="Write your opinion about the platform..."
                    rows="3"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
