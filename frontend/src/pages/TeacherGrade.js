import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TeacherDashboard.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

function TeacherGrade() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Grade");
  const [students, setStudents] = useState([]);
  const [gradeEntries, setGradeEntries] = useState([]);
  const [gradeInputs, setGradeInputs] = useState({});
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [profileName, setProfileName] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const teacherLabel = profileName || storedUser?.username || "Teacher";

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowDropdown(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const loadTeacherData = async () => {
    try {
      const profileRes = await fetch(`${API_BASE}/api/teacher/profile/`, { credentials: "include" });
      const profileData = await profileRes.json();
      if (profileRes.ok && profileData?.name) {
        setProfileName(profileData.name);
      }

      const [studentsRes, gradeRes] = await Promise.all([
        fetch(`${API_BASE}/api/teacher/students/`, { credentials: "include" }),
        fetch(`${API_BASE}/api/teacher/grade-entries/`, { credentials: "include" }),
      ]);

      const studentsData = await studentsRes.json();
      const gradeData = await gradeRes.json();

      if (!studentsRes.ok) {
        setMessage(studentsData.error || "Teacher session expired. Please login again.");
        return;
      }

      if (Array.isArray(studentsData)) {
        setStudents(studentsData);
      }

      if (Array.isArray(gradeData)) {
        setGradeEntries(gradeData);
      }

      if (Array.isArray(studentsData) && Array.isArray(gradeData)) {
        const gradeMap = gradeData.reduce((acc, entry) => {
          acc[entry.student_id] = entry;
          return acc;
        }, {});

        const initialInputs = studentsData.reduce((acc, student) => {
          const existing = gradeMap[student.id];
          acc[student.id] = {
            grade: existing ? existing.grade : "",
            remarks: existing ? existing.remarks || "" : "",
          };
          return acc;
        }, {});

        setGradeInputs(initialInputs);
      }
    } catch (e) {
      console.error(e);
      setMessage("Unable to load teacher data. Please login as teacher.");
    }
  };

  useEffect(() => {
    loadTeacherData();
  }, []);

  const handleInputChange = (studentId, field, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const saveGradeForStudent = async (student) => {
    setMessage("");

    const gradeData = gradeInputs[student.id] || { grade: "", remarks: "" };

    if (gradeData.grade === "") {
      setMessage(`Select a grade for ${student.name}.`);
      return;
    }

    const res = await fetch(`${API_BASE}/api/teacher/submit-grade/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        student_id: student.id,
        grade: gradeData.grade,
        remarks: gradeData.remarks,
      }),
    });

    let responseBody = null;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = { error: `Invalid JSON response (status ${res.status})` };
    }

    if (!res.ok) {
      setMessage(responseBody?.error || `Failed to save grade for ${student.name}.`);
      return;
    }

    setMessage(`Grade saved for ${student.name}.`);
    loadTeacherData();
  };

  const filteredStudents = students.filter((student) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      student.name.toLowerCase().includes(q) ||
      (student.roll_number || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Menu */}
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

        {/* User menu at bottom */}
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
        <h2 className="dashboard-title">Grade Students</h2>
        <div className="dashboard-content">
          <div className="card">
            <h3>Enter Grades / Remarks</h3>
            <div style={{ marginBottom: "12px" }}>
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
                }}
              />
            </div>
            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => {
                      const values = gradeInputs[student.id] || { grade: "", remarks: "" };
                      return (
                        <tr key={student.id}>
                          <td>{student.name}</td>
                          <td>{student.roll_number}</td>
                          <td>
                            <select
                              value={values.grade}
                              onChange={(e) => handleInputChange(student.id, "grade", e.target.value)}
                              style={{ width: "90px" }}
                            >
                              <option value="">Select</option>
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="B+">B+</option>
                              <option value="B">B</option>
                              <option value="C+">C+</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                              <option value="E">E</option>
                              <option value="NC">NC</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              value={values.remarks}
                              onChange={(e) => handleInputChange(student.id, "remarks", e.target.value)}
                              style={{ width: "100%" }}
                            />
                          </td>
                          <td>
                            <button
                              className="save-btn"
                              onClick={() => saveGradeForStudent(student)}
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5">No students found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h3>Recent Grade Entries</h3>
            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeEntries.length > 0 ? (
                    gradeEntries.map((row) => (
                      <tr key={row.id}>
                        <td>{row.student || row.student_name || "-"}</td>
                        <td>{row.roll_number || "-"}</td>
                        <td>{row.grade}</td>
                        <td>{row.remarks || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4">No grade entries yet.</td>
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

export default TeacherGrade;


