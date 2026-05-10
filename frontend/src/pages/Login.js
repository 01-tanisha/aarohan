import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_BASE = (
  process.env.REACT_APP_API_BASE ||
  `${window.location.protocol}//${window.location.hostname}:8000`
).trim();

const Login = () => {
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Validation functions
  const validateUsername = (username) => {
    if (!username.trim()) return "Username is required";
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 30) return "Username must be less than 30 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return "Username can only contain letters, numbers, and underscores";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6)
      return "Password must be at least 6 characters";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let errorMsg = "";

    if (name === "username") errorMsg = validateUsername(value);
    if (name === "password") errorMsg = validatePassword(value);

    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const handleForgotPassword = async () => {
    const identifier = window.prompt("Enter your registered email address or phone number:");
    if (!identifier || !identifier.trim()) return;

    setError("");
    setInfo("");

    try {
      const response = await axios.post(
        `${API_BASE}/api/forgot-password/`,
        { identifier: identifier.trim() }
      );
      setInfo(response.data?.message || "If the account exists, a reset link has been sent to Gmail.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Unable to send reset email right now."
      );
    }
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    if (usernameError || passwordError) {
      setFieldErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    setLoading(true);
    setError("");
    setInfo("");

    try {
      // Login
      await axios.post(
        `${API_BASE}/api/login/`,
        formData,
        { withCredentials: true }
      );

      //  Get user
      const { data: userData } = await axios.get(
        `${API_BASE}/api/me/`,
        { withCredentials: true }
      );

      // Store user
      localStorage.setItem("user", JSON.stringify(userData));

      // Role-based redirect
      const roleToPath = {
        student: "/student",
        teacher: "/teacher",
        admin: "/admin",
      };

      const role = userData.role?.toLowerCase();
      const targetRoute = roleToPath[role] || "/";

      //  force reload so ProtectedRoute gets updated user
      window.location.href = targetRoute;

    } catch (err) {
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 403) {
        setError("Authentication failed. Please try again.");
      } else {
        setError("Backend server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-hat">🎓</div>
        <h2>Welcome Back</h2>
        <div className="login-sub">
          Log In to access your dashboard
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={fieldErrors.username ? "input-error" : ""}
              required
            />
            {fieldErrors.username && (
              <span className="field-error">{fieldErrors.username}</span>
            )}
          </div>
          <div className="usertitle">
          The part before “@” in your email is your username.
        </div>
          <div className="input-group">
            <div className="password-box">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.password ? "input-error" : ""}
                required
              />
            </div>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="forgot-password-container">
            <button type="button" className="forgot-password" onClick={handleForgotPassword}>
              Forgot Password?
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}
          {info && <div className="login-info">{info}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div className="login-footer">
          Don&apos;t have an account?{" "}
          <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;