import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import "./AdminFeedback.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

function StarDisplay({ rating }) {
  return <span className="admin-feedback-stars">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>;
}

export default function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/feedbacks/`, { credentials: "include" })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || "Unable to load feedback submissions.");
          return;
        }
        setFeedbacks(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Unable to load feedback submissions."));
  }, []);

  return (
    <div className="admin-feedback-page">
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Student Feedback</h1>
        </div>
        <div className="navbar-right">
          <button className="nav-btn" onClick={() => navigate("/admin")}>Back</button>
        </div>
      </nav>

      <main className="admin-feedback-content">
        {error && <div className="admin-feedback-error">{error}</div>}

        <div className="admin-feedback-card">
          <table className="admin-feedback-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Activity</th>
                <th>Rating</th>
                <th>Comments</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.length === 0 ? (
                <tr>
                  <td colSpan="6">No feedback submissions yet.</td>
                </tr>
              ) : (
                feedbacks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.student_name}</td>
                    <td>{item.roll_number}</td>
                    <td>{item.activity}</td>
                    <td><StarDisplay rating={item.rating || 0} /></td>
                    <td>{item.comments}</td>
                    <td>{item.created_at ? new Date(item.created_at).toLocaleString() : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

