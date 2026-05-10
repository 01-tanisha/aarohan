import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Leaderboard.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function Leaderboard() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [studentName, setStudentName] = useState("Student");
  const [activeMenu, setActiveMenu] = useState("Leaderboard");
  const [isCompactView, setIsCompactView] = useState(() => window.innerWidth <= 768);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const handleProfileClick = () => navigate("/student/profile");
  const handleLogout = () => navigate("/");
  const handleActivitiesClick = () => navigate("/activity");
  const handleResultClick = () => navigate("/student/result");
  const handleFeedbackClick = () => navigate("/student/feedback");
  const handleFaqsClick = () => navigate("/faq");
  const handleDashboardClick = () => navigate("/student");
  const handleLeaderboardClick = () => setActiveMenu("Leaderboard");

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard/`, {
        credentials: "include",
      });
      const rawData = await res.json();
      if (Array.isArray(rawData)) {
        const mappedData = rawData.map((student) => ({
          name: student.name || student.student?.name || "Unknown",
          roll_number: student.roll_number || student.student?.roll_number || "",
          grade: student.grade || "",
          attendance_percentage: student.attendance ?? 0,
          rank: student.rank,
        }));

        // Sort by attendance descending
        mappedData.sort((a, b) => b.attendance_percentage - a.attendance_percentage);

        // Assign dense ranks locally only if backend rank is missing.
        if (!mappedData.every((student) => Number.isInteger(student.rank))) {
          let rank = 0;
          let lastAttendance = null;
          mappedData.forEach((student) => {
            if (lastAttendance !== student.attendance_percentage) {
              rank += 1;
              lastAttendance = student.attendance_percentage;
            }
            student.rank = rank;
          });
        }

        setLeaderboardData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/profile-summary/`, {
        credentials: "include",
      });
      const profile = await res.json();
      if (profile?.name) setStudentName(profile.name);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchLeaderboard();

    const interval = setInterval(fetchLeaderboard, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsCompactView(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Group attendance bins (100% → 50% & below)
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
    const att = Math.round(student.attendance_percentage);
    if (att === 100) attendanceGroups["100%"]++;
    else if (att >= 91) attendanceGroups["91-99%"]++;
    else if (att >= 81) attendanceGroups["81-90%"]++;
    else if (att >= 71) attendanceGroups["71-80%"]++;
    else if (att >= 61) attendanceGroups["61-70%"]++;
    else if (att >= 51) attendanceGroups["51-60%"]++;
    else attendanceGroups["50% & below"]++;
  });

  const chartData = Object.keys(attendanceGroups).map((key) => ({
    attendance: key,
    students: attendanceGroups[key],
  }));

  const compactChartData = chartData.map((item) => ({
    ...item,
    compactAttendance: item.attendance === "50% & below" ? "<=50%" : item.attendance,
  }));

  const chartMargin = isCompactView
    ? { top: 12, right: 8, left: 0, bottom: 52 }
    : { top: 20, right: 30, left: 20, bottom: 50 };

  return (
    <div className="student-dashboard-container">
      <aside className="sidebar">
        <ul className="sidebar-menu">
          <li className={activeMenu === "Dashboard" ? "active" : ""} onClick={handleDashboardClick}>Dashboard</li>
          <li className={activeMenu === "Activities" ? "active" : ""} onClick={() => { setActiveMenu("Activities"); handleActivitiesClick(); }}>Activities</li>
          <li className={activeMenu === "Result" ? "active" : ""} onClick={() => { setActiveMenu("Result"); handleResultClick(); }}>Result</li>
          <li className={activeMenu === "Leaderboard" ? "active" : ""} onClick={() => { setActiveMenu("Leaderboard"); handleLeaderboardClick(); }}>Leaderboard</li>
          <li className={activeMenu === "Feedback" ? "active" : ""} onClick={() => { setActiveMenu("Feedback"); handleFeedbackClick(); }}>Feedback</li>
          <li className={activeMenu === "FAQs" ? "active" : ""} onClick={() => { setActiveMenu("FAQs"); handleFaqsClick(); }}>FAQs</li>
        </ul>

        <div className="user-menu" onClick={toggleDropdown}>
          {studentName} <span className="arrow">{showDropdown ? "▲" : "▼"}</span>
          {showDropdown && (
            <div className="dropdown">
              <button onClick={handleProfileClick}>Profile</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content leaderboard-main-content">
        <h1 className="page-title">Leaderboard</h1>

        {/* Attendance Histogram */}
        <div className="leaderboard-chart-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compactChartData} margin={chartMargin}>
              <XAxis
                dataKey={isCompactView ? "compactAttendance" : "attendance"}
                interval={0}
                tick={{ fontSize: isCompactView ? 11 : 14 }}
                angle={isCompactView ? -18 : 0}
                textAnchor={isCompactView ? "end" : "middle"}
                height={isCompactView ? 60 : 40}
                label={{ value: "Attendance", position: "insideBottom", offset: -6 }}
              />
              <YAxis
                width={isCompactView ? 28 : 42}
                label={
                  isCompactView
                    ? undefined
                    : { value: "Number of Students", angle: -90, position: "insideLeft" }
                }
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
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Roll Number</th>
                <th>Grade</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((student, index) => (
                <tr key={index}>
                  <td>{student.rank}</td>
                  <td>{student.name}</td>
                  <td>{student.roll_number}</td>
                  <td>{student.grade}</td>
                  <td>{student.attendance_percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Leaderboard;