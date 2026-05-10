import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Activitytable.css";

function Activitytable() {
  const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;
  const API = `${API_BASE}/api`;
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showView, setShowView] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolledActivityName, setEnrolledActivityName] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Activities");
  const [showDropdown, setShowDropdown] = useState(false);
  const [studentName, setStudentName] = useState("Student");


const handleActivitiesClick = () => {
    setActiveMenu("Activity");
  };

  const handleResultClick = () => {
    navigate("/student/result");
  };

  const handleFeedbackClick = () => {
    navigate("/student/feedback");
  };

  const handleFaqsClick = () => {
    navigate("/faq");
  };

  const handleDashboardClick = () => {
     navigate("/student");
  };

  const handleLeaderboardClick = () => {
    navigate("/student/leaderboard");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/student/profile");
  };

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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      setShowDropdown(false);
      navigate("/login");
    }
  };
  // Get CSRF token from cookies
  const getCsrfToken = () => {
    const name = "csrftoken";
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  // Check if user is authenticated
  const checkAuthentication = async () => {
    try {
      const res = await fetch(`${API}/me/`, {
        method: "GET",
        credentials: "include",
        headers: { "Accept": "application/json" }
      });
      
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setStudentName(data.username || data.user || "Student");
        console.log("User authenticated:", data.username || data.user);
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.warn("Authentication check failed:", err);
      setIsAuthenticated(false);
    }
  };

  // Load student's current enrollment
  const loadStudentEnrollment = async () => {
    try {
      const res = await fetch(`${API}/profile-summary/`, {
        method: "GET",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: "include"
      });

    
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Profile summary returned non-JSON. User may not be authenticated.");
        return;
      }

      if (!res.ok) {
        console.warn(`Profile summary status: ${res.status}`);
        return;
      }

      const data = await res.json();
      if (data?.name) {
        setStudentName(data.name);
      }
      if (data.activity && data.activity.title && data.activity.title !== "No activity selected") {
        setEnrolledActivityName(data.activity.title);
      }
    } catch (err) {
      console.warn("Could not load enrollment status:", err.message);
    }
  };

  // Load activities
  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/activities/`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      setActivities(data);
      setFilteredActivities(data);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }

    // Check authentication and load enrollment status
    await checkAuthentication();
    await loadStudentEnrollment();
  };

  useEffect(() => {
    loadActivities();
  }, []);

  // Enroll function
  const enrollActivity = async (id) => {
    if (!isAuthenticated) {
      alert("You must be logged in to enroll in activities. Please login first.");
      window.location.href = "/login";
      return;
    }

    try {
      const csrfToken = getCsrfToken();
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      };
      
      if (csrfToken) {
        headers["X-CSRFToken"] = csrfToken;
      }

      const res = await fetch(`${API}/pick-activity/`, {
        method: "POST",
        headers: headers,
        credentials: "include",
        body: JSON.stringify({ activity_id: id })
      });

      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await res.text();
        console.error("Non-JSON response:", responseText.substring(0, 500));
        throw new Error("Server returned non-JSON response. Please try logging out and back in.");
      }

      const data = await res.json();
      console.log("Response:", { status: res.status, data });
      
      if (res.ok || res.status === 201) {
        alert(data.message || "Successfully enrolled!");
        await loadStudentEnrollment();
      } else {
        const errorMsg = data.error || data.message || "Failed to enroll";
        const details = data.details ? `\n\nDetails: ${data.details}` : "";
        alert(`Error: ${errorMsg}${details}`);
      }
    } catch (err) {
      console.error("Error enrolling:", err);
      alert(`Error: ${err.message || "Failed to connect to server"}`);
    }
  };

  const handleEnrollClick = (activity) => {
    const confirmed = window.confirm(`Do you want to enroll in ${activity.name}?`);
    if (!confirmed) return;

    enrollActivity(activity.id);
  };

  

  // Search filter: works by name or category
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    if (!term) {
      setFilteredActivities(activities);
      return;
    }

    const filtered = activities.filter((activity) => {
      const name = activity.name ? activity.name.toString().toLowerCase() : "";
      const category = (activity.category_name || activity.category || "").toString().toLowerCase();
      return name.includes(term) || category.includes(term);
    });

    setFilteredActivities(filtered);
  };

  return (
    <div className="student-dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeMenu === "Dashboard" ? "active" : ""} onClick={handleDashboardClick}>Dashboard</li>
          <li className={activeMenu === "Activities" ? "active" : ""} onClick={() => { setActiveMenu("Activities"); handleActivitiesClick(); }}>Activities</li>
          <li className={activeMenu === "Result" ? "active" : ""} onClick={() => { setActiveMenu("Result"); handleResultClick(); }}>Result</li>
          <li className={activeMenu === "Leaderboard" ? "active" : ""} onClick={() => { setActiveMenu("Leaderboard"); handleLeaderboardClick(); }}>Leaderboard</li>
          <li className={activeMenu === "Feedback" ? "active" : ""} onClick={() => { setActiveMenu("Feedback"); handleFeedbackClick(); }}>Feedback</li>
          <li className={activeMenu === "FAQs" ? "active" : ""} onClick={() => { setActiveMenu("FAQs"); handleFaqsClick(); }}>FAQs</li>
        </ul>

        <div className="student-sidebar-bottom">
          <div className="student-user-menu" onClick={() => setShowDropdown((prev) => !prev)}>
            {studentName}
            <span className="student-user-arrow">{showDropdown ? "▲" : "▼"}</span>

            {showDropdown && (
              <div
                className="student-user-dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="student-dropdown-btn" onClick={handleProfileClick}>Profile</button>
                <button className="student-dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>
    <div className="activity-page">
      <h2>Activities</h2>
      
      {/* AUTHENTICATION WARNING */}
      {!loading && !isAuthenticated && (
        <div style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "12px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1px solid #ffeeba"
        }}>
          <strong>Please log in</strong> to enroll in activities. You can view activities without logging in.
        </div>
        
      )}

      {/* CURRENT ENROLLMENT STATUS */}
      

      {/* ERROR MESSAGE */}
      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>
          Error: {error}
        </div>
      )}

      {/* LOADING */}
      {loading && <p>Loading activities...</p>}

      {/* SEARCH BAR */}
      {!loading && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      )}
    <div className="activity-table-shell">
  
      <table className="activity-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <tr key={activity.id}>
                <td>{filteredActivities.indexOf(activity) + 1}</td>
                <td>{activity.name}</td>
                <td>{activity.category_name || activity.category}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => {
                        setViewData(activity);
                        setShowView(true);
                      }}
                    >
                      View
                    </button>
                    <button
                      className="enroll-btn"
                      onClick={() => handleEnrollClick(activity)}
                      disabled={!isAuthenticated || (enrolledActivityName !== null && activity.name !== enrolledActivityName)}
                      style={{
                        opacity: (!isAuthenticated || (enrolledActivityName && activity.name !== enrolledActivityName)) ? 0.5 : 1,
                        cursor: (!isAuthenticated || (enrolledActivityName && activity.name !== enrolledActivityName)) ? "not-allowed" : "pointer"
                      }}
                      title={!isAuthenticated ? "Please login to enroll" : ""}
                    >
                      {!isAuthenticated ? "Login to Enroll" : activity.name === enrolledActivityName ? "Enrolled ✓" : "Enroll"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : !loading ? (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                No results found
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      {/* VIEW POPUP */}
      {showView && viewData && (
        <div className="modal">
          <div className="modal-content">
            <h3>Activity Details</h3>
            <p><b>Description:</b> {viewData.description}</p>
            <p><b>Requirements:</b> {viewData.requirements}</p>
          
            <div className="modal-buttons">
              <button onClick={() => setShowView(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
);
}  
  

export default Activitytable;