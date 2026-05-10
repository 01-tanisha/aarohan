import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentProfile.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function StudentProfile() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [activeMenu, setActiveMenu] = useState("Profile");
  useEffect(() => {
    fetch(`${API_BASE}/api/profile/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error);
          return;
        }
        setProfile(data);
      })
      .catch(() => setError("Unable to load profile."));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/logout/`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("user");
      setShowDropdown(false);
      navigate("/login");
    }
  };

  const profileName = profile?.name || "Student";

  return (
    <div className="student-dashboard-container student-profile-container">
      <aside className="sidebar">
        <ul className="sidebar-menu">
  <li
    className={activeMenu === "Dashboard" ? "active" : ""}
    onClick={() => {
      setActiveMenu("Dashboard");
      navigate("/student");
    }}
  >
    Dashboard
  </li>

  <li
    className={activeMenu === "Activities" ? "active" : ""}
    onClick={() => {
      setActiveMenu("Activities");
      navigate("/activity");
    }}
  >
    Activities
  </li>

  <li
    className={activeMenu === "Result" ? "active" : ""}
    onClick={() => {
      setActiveMenu("Result");
      navigate("/student/result");
    }}
  >
    Result
  </li>

  <li
    className={activeMenu === "Leaderboard" ? "active" : ""}
    onClick={() => {
      setActiveMenu("Leaderboard");
      navigate("/student/leaderboard");
    }}
  >
    Leaderboard
  </li>

  <li
    className={activeMenu === "Feedback" ? "active" : ""}
    onClick={() => {
      setActiveMenu("Feedback");
      navigate("/student/feedback");
    }}
  >
    Feedback
  </li>

  <li
    className={activeMenu === "FAQs" ? "active" : ""}
    onClick={() => {
      setActiveMenu("FAQs");
      navigate("/faq");
    }}
  >
    FAQs
  </li>
</ul>

        <div className="student-sidebar-bottom">
          <div className="student-user-menu" onClick={() => setShowDropdown((prev) => !prev)}>
            {profileName}
            <span className="student-user-arrow">{showDropdown ? "▲" : "▼"}</span>
            {showDropdown && (
              <div className="student-user-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="student-dropdown-btn" onClick={() => { setShowDropdown(false); navigate("/student/profile"); }}>Profile</button>
                <button className="student-dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content student-profile-main">
        <h1 className="page-title">Student Profile</h1>

        {error && <div className="profile-error">{error}</div>}

        {profile && (
          <div className="profile-card">
            <div className="profile-top">
              <div className="profile-header-text">
                <h2>{profile.name}</h2>
               
              </div>

              {profile.photo_url ? (
                <img className="profile-photo-circle" src={profile.photo_url} alt={`${profile.name} profile`} />
              ) : (
                <div className="profile-photo-circle profile-photo-placeholder">No Photo</div>
              )}
            </div>

            <div className="profile-grid">
              <div className="profile-item"><span>Roll No.</span><strong>{profile.roll_number}</strong></div>
              <div className="profile-item"><span>Class</span><strong>{profile.class_name}</strong></div>
              <div className="profile-item"><span>Semester</span><strong>{profile.semester}</strong></div>
              <div className="profile-item"><span>Email</span><strong>{profile.email}</strong></div>
              <div className="profile-item"><span>Phone No.</span><strong>{profile.phone_number}</strong></div>
              <div className="profile-item"><span>Date of Birth</span><strong>{profile.dob}</strong></div>
              <div className="profile-item"><span>Father's Name</span><strong>{profile.father_name}</strong></div>
              <div className="profile-item"><span>Mother's Name</span><strong>{profile.mother_name}</strong></div>
              <div className="profile-item"><span>Hostel</span><strong>{profile.hostel}</strong></div>
              <div className="profile-item"><span>Activity Enrolled</span><strong>{profile.activity}</strong></div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentProfile;
