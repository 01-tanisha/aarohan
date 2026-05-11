import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeAction, setActiveAction] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleNavAction = (action, route) => {
    setActiveAction(action);
    if (route) {
      navigate(route);
    }
    setTimeout(() => setActiveAction(null), 1500);
  };

  const handleLogout = async () => {
    setActiveAction('logout');

    try {
      await fetch(`${API_BASE}/api/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (err) {
      console.error('Logout request failed', err);
    }

    localStorage.removeItem('user');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    navigate('/');
  };

  // ✅ FETCH DATA
  useEffect(() => {
    fetch("https://aarohan-git-main-01-tanishas-projects.vercel.app/api/dashboard/",{
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("DASHBOARD DATA:", data); 
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        setLoading(false);
      });
  }, []);

  // ✅ LOADING STATE
  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // ✅ SAFETY CHECK (prevents crash)
  if (!dashboardData || !dashboardData.categories || !dashboardData.activities) {
    return <div>No data available</div>;
  }

  // ✅ CALCULATIONS (same as your UI)
  const maxCategoryCount = Math.max(...dashboardData.categories.map((item) => item.count), 0);
  const totalCount = dashboardData.categories.reduce((sum, item) => sum + item.count, 0);
  const leastCategory = dashboardData.categories.reduce((min, item) => (item.count < min.count ? item : min), dashboardData.categories[0]);
  const topCategory = dashboardData.categories.reduce((max, item) => (item.count > max.count ? item : max), dashboardData.categories[0]);
  const topActivity = dashboardData.activities.length
    ? dashboardData.activities.reduce((max, item) => (item.count > max.count ? item : max), dashboardData.activities[0])
    : null;
  const leastActivity = dashboardData.activities.length
    ? dashboardData.activities.reduce((min, item) => (item.count < min.count ? item : min), dashboardData.activities[0])
    : null;
  const avgParticipation = dashboardData.categories.length > 0 ? (totalCount / dashboardData.categories.length).toFixed(1) : "0.0";

  return (
    <div className="dashboard-container">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="navbar-left">
          <h1 className="navbar-title">Admin Dashboard</h1>
        </div>
        <div className="navbar-right">
          <button 
            className={`nav-btn logout ${activeAction === 'logout' ? 'active' : ''}`}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-actions">
        <button 
          className={`action-btn ${activeAction === 'activity' ? 'active' : ''}`}
          onClick={() => handleNavAction('activity', '/admin/adminactivity')}
        >
          Create Activity
        </button>
        <button 
          className={`action-btn ${activeAction === 'supervise' ? 'active' : ''}`}
          onClick={() => handleNavAction('supervise', '/admin/supervise')}
        >
          Supervise
        </button>
        <button 
          className={`action-btn ${activeAction === 'publish' ? 'active' : ''}`}
          onClick={() => handleNavAction('publish', '/admin/publish-result')}
        >
          Publish Results
        </button>
        <button 
          className={`action-btn ${activeAction === 'feedback' ? 'active' : ''}`}
          onClick={() => handleNavAction('feedback', '/admin/feedbacks')}
        >
          View Feedback
        </button>
      </div>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">
        {/* ROW 1: ANALYTICS CARDS */}
        <section className="analytics-row">
          <div className="analytics-card">
            <p className="card-label">Total Students</p>
            <p className="card-value">{dashboardData.totalStudents}</p>
            <p className="card-subtext">Active participants</p>
          </div>
          
          <div className="analytics-card">
            <p className="card-label">Total Activities</p>
            <p className="card-value">{dashboardData.totalActivities}</p>
            <p className="card-subtext">Running programs</p>
          </div>
          
          <div className="analytics-card">
            <p className="card-label">Teachers Enrolled</p>
            <p className="card-value">{dashboardData.totalTeachersEnrolled ?? 0}</p>
            <p className="card-subtext">Teachers assigned to activities</p>
          </div>
        </section>

        {/* ROW 2: HISTOGRAM + SUMMARY */}
        <section className="chart-row">
          {/* HISTOGRAM */}
          <div className="histogram-container">
            <h2 className="section-title">Student Distribution by Category</h2>
            
            <div className="histogram-wrapper">
              <div className="chart-y-title">No. of Students</div>
              <div className="chart-y-axis">
                <div className="axis-label">{maxCategoryCount}</div>
                <div className="axis-label">{Math.round(maxCategoryCount * 0.75)}</div>
                <div className="axis-label">{Math.round(maxCategoryCount * 0.5)}</div>
                <div className="axis-label">{Math.round(maxCategoryCount * 0.25)}</div>
                <div className="axis-label">0</div>
              </div>

              <div className="chart-content">
                <div className="bars-container">
                  {dashboardData.categories.map((category, idx) => {
                    const percentage = maxCategoryCount > 0 ? (category.count / maxCategoryCount) * 100 : 0;
                    return (
                      <div key={idx} className="bar-wrapper">
                        <div 
                          className="bar"
                          style={{ height: `${percentage}%`, backgroundColor: '#1e3c72' }}
                          title={`${category.name}: ${category.count} students`}
                        >
                          <span className="bar-value">{category.count}</span>
                        </div>
                        <p className="bar-label">{category.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="chart-x-title">Categories</div>
          </div>

          {/* SUMMARY PANEL */}
          <div className="summary-panel">
            <h3 className="panel-title">Quick Summary</h3>
            
            <div className="summary-item">
              <p className="summary-label">Top Activity</p>
              <p className="summary-value">{topActivity?.name || "-"}</p>
            </div>

            <div className="summary-item">
              <p className="summary-label">Least Activity</p>
              <p className="summary-value">{leastActivity?.name || "-"}</p>
            </div>

            

            
          </div>
        </section>

        
      </main>
    </div>
  );
}