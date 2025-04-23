import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const UserAnalytics = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    userActivity: [],
    userTypes: [],
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/admin/analytics/users",
          {
            withCredentials: true,
          }
        );
        setUserStats(response.data);
      } catch (error) {
        console.error("Error fetching user analytics:", error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <>
      <div className="container mt-4" dir="rtl">
        <h2 className="mb-4">דוח משתמשים</h2>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">סה"כ משתמשים</h5>
                <h2 className="card-text">{userStats.totalUsers}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">משתמשים פעילים</h5>
                <h2 className="card-text">{userStats.activeUsers}</h2>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">משתמשים חדשים</h5>
                <h2 className="card-text">{userStats.newUsers}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">פעילות משתמשים</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={userStats.userActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="activeUsers"
                    name="משתמשים פעילים"
                    fill="#8884d8"
                  />
                  <Bar dataKey="newUsers" name="משתמשים חדשים" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Types Distribution */}
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">חלוקת סוגי משתמשים</h5>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={userStats.userTypes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="כמות" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserAnalytics;
