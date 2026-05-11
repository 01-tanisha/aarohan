import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";
import "./TeacherProfile.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

function TeacherProfile() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const teacherLabel = profile?.name || storedUser?.username || "Teacher";

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/profile/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error);
          return;
        }
        setProfile(data);
      })
      .catch(() => setError("Unable to load teacher profile."));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login");
  };

  const rows = profile
    ? [
        { label: "Name", value: profile.name },
        { label: "Email", value: profile.email },
        { label: "Phone No.", value: profile.phone_number },
        { label: "Date of Birth", value: profile.dob },
        {
          label: "Specialization (Activity)",
          value:
            Array.isArray(profile.specialization_list) && profile.specialization_list.length > 0
              ? profile.specialization_list.join(", ")
              : profile.specialization,
        },
      ]
    : [];

  return (
    <div className="teacher-dashboard-container teacher-profile-container">
      <div className="sidebar">
        <ul className="sidebar-menu">
          <li onClick={() => navigate("/teacher")}>Dashboard</li>
          <li onClick={() => navigate("/teacher/attendance")}>Attendance</li>
          <li onClick={() => navigate("/teacher/grade")}>Grade</li>
          <li onClick={() => navigate("/teacher/leaderboard")}>Leaderboard</li>
        </ul>

        <div className="teacher-sidebar-bottom">
          <div className="teacher-user-menu" onClick={() => setShowDropdown((prev) => !prev)}>
            {teacherLabel} <span className="teacher-user-arrow">{showDropdown ? "▲" : "▼"}</span>
            {showDropdown && (
              <div className="teacher-user-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="teacher-dropdown-btn" onClick={() => { setShowDropdown(false); navigate("/teacher/profile"); }}>Profile</button>
                <button className="teacher-dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content teacher-profile-main">
        <h2 className="dashboard-title">Teacher Profile</h2>

        {error && <div className="teacher-profile-error">{error}</div>}

        {profile && (
          <div className="teacher-profile-card">
            <div className="teacher-profile-sheet">
              <div className="teacher-profile-sheet-title">Profile Details</div>
              <div className="teacher-profile-rows">
                {rows.map((row) => (
                  <div key={row.label} className="teacher-profile-row">
                    <div className="row-label">{row.label}</div>
                    <div className="row-value">{row.value || "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherProfile;

