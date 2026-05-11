import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentResult.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

function gradeLabel(marks) {
  if (marks === null || marks === undefined || marks === "") return "N/A";
  const score = Number(marks);
  if (Number.isNaN(score)) return "N/A";
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

function StudentResult() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Result");
  const [studentResult, setStudentResult] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/result/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setMessage(data.error);
          return;
        }
        setStudentResult(data);
      })
      .catch(() => setMessage("Unable to load result details."));
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

  const studentName = studentResult?.name || "Student";
  const marks = studentResult?.marks;
  const grade = studentResult?.grade || gradeLabel(marks);
  const handlePrint = () => window.print();

  return (
    <div className="student-dashboard-container student-result-container">
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
            {studentName}
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

      <main className="main-content result-main-content">
        <div className="result-page-header no-print">
          <div>
            <h1 className="page-title">Student Result</h1>
            
          </div>
          <button type="button" className="print-btn" onClick={handlePrint}>
            Print Result
          </button>
        </div>

        {message ? (
          <div className="result-empty-state">{message}</div>
        ) : studentResult ? (
          <div className="result-card marksheet-card">
            <div className="marksheet-top">
              <div className="marksheet-heading">
                <div className="marksheet-label">AAROHAN</div>
                <h2>Student Result Marksheet</h2>
                <p>Banasthali Vidyapith</p>
              </div>

              {studentResult?.photo_url ? (
                <img
                  className="result-photo"
                  src={studentResult.photo_url}
                  alt={`${studentName} passport`}
                />
              ) : (
                <div className="result-photo result-photo-placeholder">No Photo</div>
              )}
            </div>

            <div className="result-grid">
              <div className="result-field"><span>Student Name</span><strong>{studentResult.name}</strong></div>
              <div className="result-field"><span>Class</span><strong>{studentResult.class_name}</strong></div>
              <div className="result-field"><span>Roll No.</span><strong>{studentResult.roll_number}</strong></div>
              <div className="result-field"><span>Email</span><strong>{studentResult.email}</strong></div>
              <div className="result-field"><span>Father's Name</span><strong>{studentResult.father_name}</strong></div>
              <div className="result-field"><span>Mother's Name</span><strong>{studentResult.mother_name}</strong></div>
              <div className="result-field"><span>Activity Enrolled In</span><strong>{studentResult.activity}</strong></div>
              <div className="result-field"><span>Instructor</span><strong>{studentResult.teacher}</strong></div>
            </div>

            <div className="result-score-panel">
              <div className="score-box grade-box">
                <span>Grade</span>
                <strong>{grade}</strong>
              </div>
              <div className="remarks-box">
                <span>Remarks</span>
                <p>{studentResult.remarks || "-"}</p>
              </div>
            </div>

            <div className="result-footer">
              <div className="signature-block">
                <div className="signature-line" />
                <span>Instructor</span>
              </div>
              <div className="signature-block">
                <div className="signature-line" />
                <span>HOD</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default StudentResult;

