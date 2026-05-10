import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css"; 

function FAQ() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("FAQs");
  const [studentName, setStudentName] = useState("Student");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const studentLabel = studentName || storedUser?.username || "Student";

  useEffect(() => {
    fetch(`${window.location.protocol}//${window.location.hostname}:8000/api/profile-summary/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) {
          setStudentName(data.name);
        }
      })
      .catch(() => {
        setStudentName(storedUser?.username || "Student");
      });
  }, []);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleProfileClick = () => {
    navigate("/student/profile"); 
  };

  const handleLogout = () => {
    navigate("/"); 
  };

  return (
    <div className="student-dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
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

        <div className="sidebar-bottom">
          <div className="user-menu" onClick={toggleDropdown}>
            {studentLabel} <span className="arrow">{showDropdown ? "▲" : "▼"}</span>
            {showDropdown && (
              <div className="dropdown">
                <button onClick={handleProfileClick}>Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h2>Frequently Asked Questions</h2>

        <div className="dashboard-content">
          <p><b>1. How is attendance of a student calculated?</b></p>
          <p>It is based on total classes attended.</p>

          <p><b>2. What is the minimum percentage of attendance required to appear for the exams?</b></p>
          <p>As per Vidyapith's rules and regulations, a minimum of 50 percent is required in the five fold activity to appear for the exams.Studentswho fail to meet this criteria may not be allowed to qualify or may be required to repeat the activities as per university rules.</p>

          <p><b>3. Is participation in Five-Fold activities compulsory?</b></p>
          <p>Yes, participation in Five-Fold activities is mandatory for all students as it is a core part of Banasthali’s educational system.</p>

          <p><b>4. Who should I contact for errors regarding my attendance?</b></p>
          <p>Please contact your class teacher or admin for any errors or discrepancies.</p>

          <p><b>5. Are Five-Fold activities graded?</b></p>
          <p>Yes, the five fold activities are graded. Some activities are evaluated for participation, discipline, and performance as part of the overall assessment.</p>

          <p><b>6. Can I change my allotted activity??</b></p>
          <p>Yes, in certain cases, students may request a change, but it depends on availability and approval from the administration.</p>
          

          <p><b>7. Do Five-Fold activities impact final results?</b></p>
          <p>Yes, grades of five fold activities do affect the overall cgpa of the student. Performance and attendance in these activities contribute to overall assessment and eligibility.</p>
        </div>
      </div>
    </div>
  );
}

export default FAQ;
