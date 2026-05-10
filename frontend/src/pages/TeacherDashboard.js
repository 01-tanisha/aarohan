import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import TeacherCalendar from "./TeacherCalendar";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function TeacherDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [profile, setProfile] = useState(null);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const teacherLabel = profile?.name || storedUser?.username || "Teacher";

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Fetch announcements on component mount
  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/announcement/list/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setAnnouncements(data))
      .catch(err => console.error("Failed to fetch announcements", err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/profile/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.error) {
          setProfile(data);
        }
      })
      .catch((err) => console.error("Failed to fetch teacher profile", err));
  }, []);

  // Post new announcement
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title || !message) return alert("Title and message required");

  try {
    const res = await fetch(`${API_BASE}/api/teacher/announcement/create/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, message })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("POST failed:", data);
      setMessage(data.error || "❌ Something went wrong");
      return;
    }

    setAnnouncements(prev => [data, ...prev]);
    setTitle("");
    setMessage("");
  } catch (err) {
    console.error("Network error:", err);
    setMessage("❌ Network error or server is down");
  }
};

  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <ul className="sidebar-menu">
          <li
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Dashboard");
              navigate("/teacher");
            }}
          >
            Dashboard
          </li>

          <li
            className={activeMenu === "Attendance" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Attendance");
              navigate("/teacher/attendance");
            }}
          >
            Attendance
          </li>

          <li
            className={activeMenu === "Grade" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Grade");
              navigate("/teacher/grade");
            }}
          >
            Grade
          </li>

          <li
            className={activeMenu === "Leaderboard" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Leaderboard");
              navigate("/teacher/leaderboard");
            }}
          >
            Leaderboard
          </li>
        </ul>
        <div className="teacher-sidebar-bottom">
          <div className="teacher-user-menu" onClick={toggleDropdown}>
            {teacherLabel} <span>{showDropdown ? "▲" : "▼"}</span>
            {showDropdown && (
              <div className="teacher-user-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="teacher-dropdown-btn" onClick={() => { setShowDropdown(false); navigate("/teacher/profile"); }}>Profile</button>
                <button className="teacher-dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2 className="dashboard-title">Teacher Dashboard</h2>

        <div className="dashboard-content">
          <div className="card teacher-summary-card">
            <h3>My Specializations</h3>
            <p className="teacher-summary-text">
              {Array.isArray(profile?.specialization_list) && profile.specialization_list.length > 0
                ? profile.specialization_list.join(", ")
                : profile?.specialization || "No specialization available"}
            </p>
          </div>

          {/* Calendar */}
          <div className="card">
            <h3>Academic Calendar</h3>
            <TeacherCalendar />
          </div>

          {/* Announcement Section */}
          <div className="card">
            <h3>Announcements</h3>

            {/* Form to add new announcement */}
            <form onSubmit={handleSubmit} className="announcement-form">
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <button type="submit">Post Announcement</button>
            </form>

            {/* List of announcements */}
            <ul className="announcement-list">
              {announcements.length === 0 && <li>No announcements yet.</li>}
              {announcements.map(a => (
                <li key={a.id} className="announcement-item">
                  <b>{a.title}</b> by {a.teacher} <br />
                  {a.message} <br />
                  <small>{new Date(a.created_at).toLocaleString()}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherDashboard;