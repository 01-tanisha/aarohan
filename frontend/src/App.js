import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentResult from "./pages/StudentResult";
import Leaderboard from "./pages/Leaderboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherProfile from "./pages/TeacherProfile";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import AdminSupervise from "./pages/AdminSupervise";
import AdminActivity from "./pages/AdminActivity";
import PublishResult from "./pages/PublishResult";
import FAQ from "./pages/FAQ";
import StudentFeedback from "./pages/StudentFeedback";
import AdminFeedback from "./pages/AdminFeedback";
import Activitytable from "./pages/Activitytable";
import TeacherAttendance from "./pages/TeacherAttendance";
import TeacherGrade from "./pages/TeacherGrade";
import TeacherLeaderboard from "./pages/TeacherLeaderboard";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Chatbot from "./components/Chatbot";
import HeaderBanner from "./components/HeaderBanner";
import SiteFooter from "./components/SiteFooter";
import ProtectedRoute from "./components/ProtectedRoute";
import "./responsive.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:8000`;

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;

    fetch(`${API_BASE}/api/me/`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("user");
        setUser(null);
      });
  }, []);

  return (
    <>
      {!isHomePage && <HeaderBanner />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/activity" element={<Activitytable />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/grade" element={<TeacherGrade />} />
        <Route path="/teacher/leaderboard" element={<TeacherLeaderboard />} />

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/result"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <StudentResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/feedback"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <StudentFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/leaderboard"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute user={user} allowedRole="student">
              <StudentProfile />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute user={user} allowedRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/profile"
          element={
            <ProtectedRoute user={user} allowedRole="teacher">
              <TeacherProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/supervise"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminSupervise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/publish-result"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <PublishResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedbacks"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminFeedback />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/adminactivity"
          element={
            <ProtectedRoute user={user} allowedRole="admin">
              <AdminActivity />
            </ProtectedRoute>
          }
        />
      </Routes>

      <SiteFooter />
      <Chatbot />
    </>
  );
}

export default App;