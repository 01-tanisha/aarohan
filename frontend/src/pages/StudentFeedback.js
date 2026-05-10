import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";
import "./StudentFeedback.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function StarRating({ value, onChange, disabled }) {
  return (
    <div className="feedback-stars" role="radiogroup" aria-label="Feedback rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= value ? "selected" : ""}`}
          onClick={() => !disabled && onChange(star)}
          disabled={disabled}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function StudentFeedback() {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Feedback");
  const [studentName, setStudentName] = useState("Student");
  const [activityName, setActivityName] = useState("No activity selected");
  const [instructorName, setInstructorName] = useState("Not assigned");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/profile-summary/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.name) {
          setStudentName(data.name);
        }
        if (data?.activity?.title) {
          setActivityName(data.activity.title);
        }
        if (data?.activity?.instructor) {
          setInstructorName(data.activity.instructor);
        }
      })
      .catch(() => {});

    // Check if feedback already submitted
    fetch(`${API_BASE}/api/feedback/status/`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.submitted) {
          setFeedbackSubmitted(true);
          setMessage("Feedback already submitted for this activity.");
        }
      })
      .catch(() => {});
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!rating) {
      setMessage("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/submit/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating, comments }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data.error || "Unable to submit feedback.");
        return;
      }

      setMessage("Feedback submitted successfully.");
      setRating(0);
      setComments("");
    } catch (err) {
      setMessage("Unable to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-dashboard-container feedback-page-container">
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
            onClick={() => setActiveMenu("Feedback")}
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
                <button className="student-dropdown-btn" onClick={() => { setShowDropdown(false); navigate("/student/profile"); }}>
                  Profile
                </button>
                <button className="student-dropdown-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content feedback-main-content">
        <h1 className="page-title">Student Feedback</h1>

        <section className="feedback-card">
          <div className="feedback-summary">
            <div>
              <p className="feedback-label">Current Activity</p>
              <h2>{activityName}</h2>
            </div>
            <div>
              <p className="feedback-label">Instructor</p>
              <h2>{instructorName}</h2>
            </div>
          </div>

          <form className="feedback-form" onSubmit={handleSubmit}>
            <div className="feedback-field">
              <label>Rate your experience</label>
              <StarRating value={rating} onChange={setRating} disabled={feedbackSubmitted} />
            </div>

            <div className="feedback-field">
              <label htmlFor="feedback-comments">Your feedback</label>
              <textarea
                id="feedback-comments"
                rows="5"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Write your feedback here..."
                disabled={feedbackSubmitted}
              />
            </div>

            {message && <div className="feedback-message">{message}</div>}

            <button type="submit" className="feedback-submit-btn" disabled={submitting || feedbackSubmitted}>
              {submitting ? "Submitting..." : feedbackSubmitted ? "Feedback Already Submitted" : "Submit Feedback"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
