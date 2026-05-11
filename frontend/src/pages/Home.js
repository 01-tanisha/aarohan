import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import horseRidingImg from "../images/horseriding.jpg";
import campusImg from "../images/campus.jpg";
import { Link } from "react-router-dom";
import HeaderBanner from "../components/HeaderBanner";


const API_BASE = "https://aarohan-git-main-01-tanishas-projects.vercel.app";
const API_URL = API_BASE;


export default function Home() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setCurrentUser(JSON.parse(saved));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setCurrentUser(null);
    navigate("/");
  };


  return (
    <div className="home min-h-screen">
      <nav className="navbar">
  <div className="navbar-container">
  <div className="navbar-left">
    <span className="logo-text">AAROHAN</span>
  </div>

  <div className="navbar-menu">
    <a href="#about">About</a>
    <a href="#activities">Activities</a>
    <a href="#roles">User Roles</a>
    <a href="#college">University</a>
  </div>

  <div className="navbar-actions">
    {currentUser ? (
      <>
        <span className="user-chip">Hi, {currentUser.username}</span>
        <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
      </>
    ) : (
      <>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/login")}
        >
          Log in
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </>
    )}
  </div>

  <button
    className="mobile-menu-btn"
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
    aria-label="Toggle menu"
  >
    ☰
  </button>
</div>

</nav>

<HeaderBanner />

      <main>
        <section className="hero" id="hero">
  <div className="hero-container">
    <h1 className="hero-title">
      AAROHAN
      <span className="hero-subtitle-text">
        Empowering Women with Five Fold Activities
      </span>
    </h1>

    <p className="hero-description">
      A comprehensive platform designed to track, manage, and celebrate the
      holistic development of students through five-fold activities.
    </p>

    
  </div>
</section>

        <section className="about" id="about">
  <div className="about-container">
    <div className="about-content">
      <span className="section-badge">About AAROHAN</span>
      <h2 className="section-title">
        Nurturing Holistic Student Development
      </h2>

      <p className="about-text">
        AAROHAN is a comprehensive five-fold activity management system designed
        to promote the all-round development of students by tracking academic,
        cultural, sports, social service, and innovation-based activities.
      </p>

      <p className="about-text">
        The platform creates a transparent and collaborative ecosystem for
        students, teachers, and administrators to manage and evaluate
        co-curricular growth effectively.
      </p>

      <div className="about-features">
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span>Comprehensive Activity Tracking</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span>Real-time Progress Monitoring</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span>Automated Report Generation</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">✓</span>
          <span>Multi-level Verification System</span>
        </div>
      </div>
    </div>

    <img
  src={horseRidingImg}
  alt="Horse Riding Activity"
  className="about-image-img"
/>
  </div>
</section>

        <section className="activities" id="activities">
  <div className="activities-container">
    <div className="section-header">
      <span className="section-badge">Five Fold Activities</span>
      <h2 className="section-title">
        Comprehensive Development Domains
      </h2>
      <p className="section-description">
        Our platform tracks activities across five essential domains that
        contribute to the holistic development of every student.
      </p>
    </div>

    <div className="activities-grid">
      <div className="activity-card">
        <div className="activity-icon"></div>
        <h3 className="activity-title">Intellectual Education</h3>
        <p className="activity-description">
          Natural and social sciences with languages and Maths are being taught with sciences from the beginning.
        </p>
      </div>

      <div className="activity-card">
        <div className="activity-icon"></div>
        <h3 className="activity-title">Physical Education</h3>
        <p className="activity-description">
          Various activities like parade , shooting, riding, flying, swimming, yoga and various modern and traditional sports like kabbadi, kho-kho, basket ball, badminton, long jump, high jump etc. are included.
        </p>
      </div>

      <div className="activity-card">
        <div className="activity-icon"></div>
        <h3 className="activity-title">Aesthetic Education</h3>
        <p className="activity-description">
          They can choose either music (vocal or instrumental) or painting. Dance education is being provided to  the students  of all levels.
        </p>
      </div>

      <div className="activity-card">
        <div className="activity-icon"></div>
        <h3 className="activity-title">Moral Education</h3>
        <p className="activity-description">
          It is achieved by the means of weekly prayers, talks, Veda, Geeta & Ramayana path etc. The common evening prayer and Udbodhen program is unique.
        </p>
      </div>

      <div className="activity-card">
        <div className="activity-icon"></div>
        <h3 className="activity-title">Practical Education</h3>
        <p className="activity-description">
          Sanganary printing & dying, batique, bandhej, tailoring, embroidery, craft, papermache etc. are included. Under domestic education, students are supposed to perform cleaning and washing and collective Shramadan.
        </p>
      </div>
    </div>
  </div>
</section>

        <section className="roles" id="roles">
  <div className="roles-container">
    <div className="section-header">
      <span className="section-badge">User Roles</span>
      <h2 className="section-title">
        Tailored Experience for Everyone
      </h2>
      <p className="section-description">
        AAROHAN provides role-specific dashboards and tools to ensure efficient
        workflows and seamless collaboration.
      </p>
    </div>

    <div className="roles-grid">
      <div className="role-card">
        <div className="role-icon">🎓</div>
        <h3 className="role-title">Students</h3>
        <p className="role-description">
          Track five-fold activities, submit records, view progress, and build a
          comprehensive development portfolio.
        </p>
        <Link to="/login?role=student" className="btn btn-outline btn-small">
  Student Portal
</Link>
      </div>

      <div className="role-card">
        <div className="role-icon">👨‍🏫</div>
        <h3 className="role-title">Teachers</h3>
        <p className="role-description">
          Review submissions, verify activities, provide feedback, and monitor
          student progress efficiently.
        </p>
        <Link to="/login?role=teacher" className="btn btn-outline btn-small">
  Faculty Portal
</Link>
      </div>

      <div className="role-card">
        <div className="role-icon">⚙️</div>
        <h3 className="role-title">Administrators</h3>
        <p className="role-description">
          Manage users, configure system settings, generate reports, and oversee
          institutional activity data.
        </p>
        <Link to="/login?role=admin" className="btn btn-outline btn-small">
  Admin Portal
</Link>
      </div>
    </div>
  </div>
</section>

        <section className="college" id="college">
  <div className="college-container">
    <div className="college-content">
      <span className="section-badge">Our Institution</span>
      <h2 className="section-title">
        Committed to Excellence in Education
      </h2>

      <p className="college-text">
        Our institution has been at the forefront of holistic education,
        nurturing students to become well-rounded individuals ready to face
        global challenges.
      </p>

      <p className="college-text">
        With dedicated faculty, modern infrastructure, and a student-centric
        approach, we ensure academic excellence along with co-curricular
        growth.
      </p>

      <div className="college-stats">
        <div className="college-stat">
          <span className="college-stat-number">25+</span>
          <span className="college-stat-label">Years of Excellence</span>
        </div>
        <div className="college-stat">
          <span className="college-stat-number">50+</span>
          <span className="college-stat-label">Activities Offered</span>
        </div>
        <div className="college-stat">
          <span className="college-stat-number">100+</span>
          <span className="college-stat-label">Students Enrolled</span>
        </div>
      </div>
    </div>

  <img
  src={campusImg}
  alt="College Campus"
  className="college-image-img"
/>
  </div>
</section>

      </main>

      

{showLogin && (
  <div className="modal-overlay">
    <div className="modal-content">
      {!selectedRole ? (
        <>
          <h3>Select Role</h3>

          <button onClick={() => setSelectedRole("student")}>
            Student
          </button>

          <button onClick={() => setSelectedRole("teacher")}>
            Teacher
          </button>

          <button
            className="cancel-btn"
            onClick={() => {
              setShowLogin(false);
              setSelectedRole("");
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <h3>{selectedRole.toUpperCase()} Login</h3>

          {error && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
  onClick={async () => {
    if (!username || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      
      setShowLogin(false);

      
      window.location.href = "/";
    } catch (err) {
      setError("Server error. Try again.");
    }
  }}
>
  Login
</button>
          <button
            className="cancel-btn"
            onClick={() => {
              setShowLogin(false);
              setSelectedRole("");
              setUsername("");
              setPassword("");
              setError("");
            }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  </div>
)}
  
    </div>
  );
}
