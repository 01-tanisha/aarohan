import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");


/* ---------- Attendance Ring Component ---------- */
function AttendanceChart({ present, absent }) {
  const total = present + absent;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="attendance-ring">
      <svg width="160" height="160">
        <circle
          className="ring-bg"
          cx="80"
          cy="80"
          r="70"
          strokeWidth="12"
        />
        <circle
          className="ring-progress"
          cx="80"
          cy="80"
          r="70"
          strokeWidth="12"
          strokeDasharray="440"
          strokeDashoffset={440 - (440 * percentage) / 100}
        />
      </svg>
      <div className="ring-text">{percentage}%</div>
    </div>
  );
}

function StudentCalendar() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();


  return (
    <div className="calendar-card">
      <h3>
        {today.toLocaleString("default", { month: "long" })} {year}
      </h3>

      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="calendar-day header">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty" />
        ))}

        {Array.from({ length: totalDays }).map((_, i) => {
          const date = i + 1;
          const isToday = date === today.getDate();

          return (
            <div
              key={date}
              className={`calendar-day ${isToday ? "today" : ""}`}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}



function StudentDashboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [announcements, setAnnouncements] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  useEffect(() => {
    fetch(`${API_BASE}/api/announcements/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => setAnnouncements([]));
  }, []);

  const [attendance, setAttendance] = useState({
  present: 0,
  absent: 0,
});

  const [currentActivity, setCurrentActivity] = useState({
    title: "No activity selected",
    instructor: "Not assigned",
    schedule: "Schedule not set",
    status: "Not Started",
  });


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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Sidebar menu (clickable placeholders)
  const handleActivitiesClick = () => {
    navigate("/activity");
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
    setActiveMenu("Dashboard");
  };

  const handleLeaderboardClick = () => {
    navigate("/student/leaderboard");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/student/profile");
  };
  useEffect(() => {
    fetch(`${API_BASE}/api/attendance/`, {
      credentials: "include", // IMPORTANT for session auth
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("ATTENDANCE API RESPONSE:", data);

        if (data?.present !== undefined && data?.absent !== undefined) {
          setAttendance({ present: data.present, absent: data.absent });
        } else if (data?.present_days !== undefined && data?.total_days !== undefined) {
          const present = data.present_days;
          const absent = Math.max(0, data.total_days - present);
          setAttendance({ present, absent });
        } else {
          setAttendance({ present: 0, absent: 0 });
        }
      })
      .catch((err) => {
        console.error("Attendance fetch error:", err);
      });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/profile-summary/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.activity) {
          setCurrentActivity(data.activity);
        }
        if (data?.name) {
          setStudentName(data.name);
        }
      })
      .catch((err) => {
        console.error("Student profile fetch error:", err);
      });
  }, []);

  return (
    <div className="student-dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li
            className={activeMenu === "Dashboard" ? "active" : ""}
            onClick={handleDashboardClick}
          >
            Dashboard
          </li>

          <li
            className={activeMenu === "Activities" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Activities");
              handleActivitiesClick();
            }}
          >
            Activities
          </li>

          <li
            className={activeMenu === "Result" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Result");
              handleResultClick();
            }}
          >
            Result
          </li>

          <li
            className={activeMenu === "Leaderboard" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Leaderboard");
              handleLeaderboardClick();
            }}
          >
            Leaderboard
          </li>

          <li
            className={activeMenu === "Feedback" ? "active" : ""}
            onClick={() => {
              setActiveMenu("Feedback");
              handleFeedbackClick();
            }}
          >
            Feedback
          </li>

          

          <li
            className={activeMenu === "FAQs" ? "active" : ""}
            onClick={() => {
              setActiveMenu("FAQs");
              handleFaqsClick();
            }}
          >
            FAQs
          </li>
        </ul>

        <div className="student-sidebar-bottom">
          <div className="student-user-menu" onClick={toggleDropdown}>
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

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-title">Student Dashboard</h1>

        <section className="attendance-section">
          <h2>My Attendance</h2>

          <div className="attendance-wrapper">
  <AttendanceChart present={attendance.present} absent={attendance.absent} />

  <div className="attendance-percentage">
  {attendance.present + attendance.absent > 0
    ? (
        (attendance.present /
          (attendance.present + attendance.absent)) *
        100
      ).toFixed(1)
    : 0}
  %
</div>


  {/* Current Activity */}
  <div className="current-activity">
    <h3>Current Activity</h3>
    <p className="activity-title">{currentActivity.title}</p>
    <p><strong>Instructor:</strong> {currentActivity.instructor}</p>
    <p><strong>Schedule:</strong> {currentActivity.schedule}</p>
    
  </div>
</div>

        </section>

        <section className="calendar-section">
          <StudentCalendar />
        </section>
        <section className="announcement-section">
  <div className="announcement-section-header">
    <div>
      <h2>Announcements</h2>
    </div>
  </div>

      
     
  {announcements.length === 0 ? (
    <p className="no-announcement">No announcements available</p>
  ) : (
    <div className="announcement-list">
      {announcements.map((item) => (
        <div key={item.id} className="announcement-card">
          <div className="announcement-header">
            <h4>{item.title}</h4>
            <span>{item.created_at ? new Date(item.created_at).toLocaleString() : item.date}</span>
          </div>
          <small className="announcement-teacher">By {item.teacher}</small>
          <p>{item.message}</p>
        </div>
      ))}
    </div>
  )}
</section>

      </main>
    </div>
  );
}

export default StudentDashboard;

