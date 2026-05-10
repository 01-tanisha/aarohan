import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./TeacherLeaderboard.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function TeacherLeaderboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("Leaderboard");
  const [showDropdown, setShowDropdown] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [teacherName, setTeacherName] = useState("Teacher");

  useEffect(() => {
    fetch(`${API_BASE}/api/teacher/teacher/leaderboard/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mappedData = data.map((s) => ({
            name: s.name || "Unknown",
            roll_number: s.roll_number || "",
            attendance: s.attendance ?? 0,
            present_days: s.present_days ?? 0,
            total_days: s.total_days ?? 0,
            rank: s.rank,
          }));

          mappedData.sort((a, b) => b.attendance - a.attendance);

          // Use backend rank when available; otherwise compute dense rank locally.
          if (!mappedData.every((student) => Number.isInteger(student.rank))) {
            let rank = 0;
            let lastAttendance = null;
            mappedData.forEach((student) => {
              if (lastAttendance !== student.attendance) {
                rank += 1;
                lastAttendance = student.attendance;
              }
              student.rank = rank;
            });
          }

          setLeaderboardData(mappedData);
        }
      })
      .catch((err) => console.error("Error fetching leaderboard:", err));

    fetch(`${API_BASE}/api/teacher/profile/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) setTeacherName(data.name);
      })
      .catch(() => {});
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login");
  };
  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/teacher/profile");
  };

  // Group attendance bins 100% → 50% & below
  const attendanceGroups = {
    "100%": 0,
    "91-99%": 0,
    "81-90%": 0,
    "71-80%": 0,
    "61-70%": 0,
    "51-60%": 0,
    "50% & below": 0,
  };

  leaderboardData.forEach((student) => {
    const att = Math.round(student.attendance);
    if (att === 100) attendanceGroups["100%"]++;
    else if (att >= 91) attendanceGroups["91-99%"]++;
    else if (att >= 81) attendanceGroups["81-90%"]++;
    else if (att >= 71) attendanceGroups["71-80%"]++;
    else if (att >= 61) attendanceGroups["61-70%"]++;
    else if (att >= 51) attendanceGroups["51-60%"]++;
    else attendanceGroups["50% & below"]++;
  });

  // chartData in order for X-axis: 100% → 50% & below
  const chartData = Object.keys(attendanceGroups).map((key) => ({
    attendance: key,
    students: attendanceGroups[key],
  }));

  return (
    <div className="teacher-dashboard-container">
      <aside className="sidebar">
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
            onClick={() => setActiveMenu("Leaderboard")}
          >
            Leaderboard
          </li>
        </ul>

        <div className="teacher-sidebar-bottom">
          <div className="teacher-user-menu" onClick={toggleDropdown}>
            {teacherName} <span>{showDropdown ? "▲" : "▼"}</span>
            {showDropdown && (
              <div className="teacher-user-dropdown" onClick={(e) => e.stopPropagation()}>
                <button className="teacher-dropdown-btn" onClick={handleProfileClick}>
                  Profile
                </button>
                <button className="teacher-dropdown-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <h2 className="dashboard-title">Leaderboard</h2>

        {/* Attendance Histogram */}
        <div style={{ width: "100%", height: 400, marginBottom: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <XAxis
                dataKey="attendance"
                label={{ value: "Attendance", position: "insideBottom", offset: -5 }}
              />
              <YAxis
                label={{ value: "Number of Students", angle: -90, position: "insideLeft" }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(val) => `${val} student(s)`}
                labelFormatter={(label) => `Attendance: ${label}`}
              />
              <Bar dataKey="students" fill="#1e3c72" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard Table */}
        <div className="leaderboard-card">
          <table className="teacher-leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Attendance %</th>
                <th>Present / Total</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.length > 0 ? (
                leaderboardData
                  .map((student, index) => (
                    <tr key={index}>
                      <td>{student.rank}</td>
                      <td>{student.name}</td>
                      <td>{student.roll_number}</td>
                      <td>{student.attendance}%</td>
                      <td>
                        {student.present_days} / {student.total_days}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    No leaderboard data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default TeacherLeaderboard;