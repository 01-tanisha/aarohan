import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

function TeacherAttendance() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Attendance");
  const [students, setStudents] = useState([]);
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [isMarkedToday, setIsMarkedToday] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [studentAttendance, setStudentAttendance] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [profileName, setProfileName] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const teacherLabel = profileName || storedUser?.username || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/api/teacher/profile/`, { credentials: "include" });
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData?.name) {
          setProfileName(profileData.name);
        }

        // Fetch students
        const studentsRes = await fetch(`${API_BASE}/api/teacher/students/`, { credentials: "include" });
        const studentsData = await studentsRes.json();

        if (!studentsRes.ok) {
          setMessage(studentsData.error || "Teacher session expired. Please login again.");
          setStudents([]);
          return;
        }

        if (Array.isArray(studentsData)) {
          setStudents(studentsData);

          // Initialize attendance state
          const initialAttendance = studentsData.reduce((acc, student) => {
            acc[student.id] = false;
            return acc;
          }, {});
          setStudentAttendance(initialAttendance);
        }

        // Fetch attendance entries
        const attendanceRes = await fetch(`${API_BASE}/api/teacher/attendance-entries/`, { credentials: "include" });
        const attendanceData = await attendanceRes.json();

        if (Array.isArray(attendanceData)) {
          setAttendanceEntries(attendanceData);

          const today = new Date().toISOString().slice(0, 10);
          const attendanceToday = {};
          attendanceData.forEach(entry => {
            if (entry.date?.startsWith(today)) {
              attendanceToday[entry.student_id] = entry.status;
            }
          });
          setTodayAttendance(attendanceToday);

          const updatedAttendance = {};
          studentsData.forEach(s => {
            updatedAttendance[s.id] = attendanceToday[s.id] === "present";
          });
          setStudentAttendance(updatedAttendance);

          const allMarked = studentsData.length > 0 && studentsData.every(s => attendanceToday[s.id] !== undefined);
          setIsMarkedToday(allMarked);
        }

      } catch (error) {
        console.error("Error loading teacher data:", error);
        setMessage("Unable to load teacher data. Please login as teacher.");
      }
    };

    loadTeacherData();
  }, []);

  const submitAttendance = async (e) => {
    e.preventDefault();
    setMessage("");

    if (students.length === 0) {
      setMessage("No students available to mark attendance.");
      return;
    }

    const records = students
      .filter(student => todayAttendance[student.id] === undefined)
      .map((student) => ({
        student_id: student.id,
        status: studentAttendance[student.id] ? "present" : "absent",
      }));

    if (records.length === 0) {
      setMessage("All students already have attendance marked for today.");
      return;
    }

    const res = await fetch(`${API_BASE}/api/teacher/bulk-attendance/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ records }),
    });

    let data;
    try {
      const text = await res.text();
      data = JSON.parse(text);
    } catch {
      setMessage("❌ Server did not return valid JSON");
      return;
    }

    if (!res.ok) {
      setMessage(data.error || "❌ Request failed");
      return;
    }

    setMessage(data.message || "✅ Success");

    const updatedTodayAttendance = { ...todayAttendance };
    students.forEach(student => {
      if (todayAttendance[student.id] === undefined) {
        updatedTodayAttendance[student.id] = studentAttendance[student.id] ? "present" : "absent";
      }
    });
    setTodayAttendance(updatedTodayAttendance);

    const allMarked = students.length > 0 && students.every(student => updatedTodayAttendance[student.id] !== undefined);
    setIsMarkedToday(allMarked);

    const reset = {};
    students.forEach(s => reset[s.id] = updatedTodayAttendance[s.id] === "present");
    setStudentAttendance(reset);
  };

  const filteredStudents = students.filter(student => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    return student.name.toLowerCase().includes(query) || (student.roll_number || "").toLowerCase().includes(query);
  });

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

      {/* Main Content */}
      <div className="main-content">
        <h2 className="dashboard-title">Mark Attendance</h2>
        <div className="dashboard-content">
          <div className="card">
            <h3>Mark Attendance</h3>
            <p>Check the dots for present; unchecked means absent. Click Save when finished.</p>

            <input
              type="text"
              placeholder="Search students by name or roll..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #c9d1de",
                boxSizing: "border-box",
                marginBottom: "12px"
              }}
            />

            {isMarkedToday && <p style={{ color: "green", fontWeight: 600 }}>✅ All students have attendance marked for today</p>}
            {!isMarkedToday && Object.keys(todayAttendance).length > 0 && (
              <p style={{ color: "orange", fontWeight: 600 }}>⚠️ Some students already have attendance marked today. Only remaining students can be submitted.</p>
            )}

            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Present</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.roll_number}</td>
                      <td className="checkbox-cell">
                        <label className="dot-checkbox">
                          <input
                            type="checkbox"
                            checked={!!studentAttendance[student.id]}
                            disabled={todayAttendance[student.id] !== undefined}
                            onChange={(e) => setStudentAttendance(prev => ({ ...prev, [student.id]: e.target.checked }))}
                          />
                          <span className="dot" />
                        </label>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center", padding: "12px" }}>
                        {searchTerm ? "Student not found" : "No students available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              className="save-btn"
              onClick={submitAttendance}
              disabled={isMarkedToday}
              style={{
                margin: "14px",
                backgroundColor: "#1E90FF",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "25px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background 0.3s"
              }}
            >
              {isMarkedToday ? "Attendance already marked" : "Save Attendance"}
            </button>
          </div>

          <div className="card">
            <h3>Recent Attendance Entries</h3>
            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceEntries.length > 0 ? attendanceEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.student || entry.student_name || "-"}</td>
                      <td>{entry.roll_number || "-"}</td>
                      <td>{entry.status}</td>
                      <td>{entry.date}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4">No attendance entries yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {message && <p className="teacher-message">{message}</p>}
        </div>
      </div>
    </div>
  );
}

export default TeacherAttendance;
