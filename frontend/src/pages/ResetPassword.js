import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_BASE = (process.env.REACT_APP_API_BASE || "https://aarohan-git-main-01-tanishas-projects.vercel.app").trim().replace(/\/$/, "");

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value || "");
  } catch {
    return value || "";
  }
};

const getApiErrorMessage = (err) => {
  if (err.code === "ECONNABORTED") {
    return "Request timed out. Please check your connection and try again.";
  }

  if (!err.response) {
    return "Unable to reach server. Make sure backend is running and try again.";
  }

  const data = err.response.data;

  if (typeof data === "string" && data.trim()) {
    return `Server error (${err.response.status}). Please try again.`;
  }

  if (data?.error) return data.error;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;

  return `Unable to reset password (status ${err.response.status}).`;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { uid, token } = useParams();

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const safeUid = safeDecode(uid).replace(/\s+/g, "").trim();
    const safeToken = safeDecode(token).replace(/\s+/g, "").trim();

    if (!safeUid || !safeToken) {
      setError("Reset link is incomplete. Please request a new one.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_BASE}/api/reset-password/`,
        {
          uid: safeUid,
          token: safeToken,
          new_password: formData.newPassword,
        },
        {
          timeout: 20000,
        }
      );

      setInfo(response.data?.message || "Password reset successful.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <h2>Reset Password</h2>
        <div className="login-sub">Set a new password for your account</div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="password-box">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password reset-toggle-password"
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                title={showNewPassword ? "Hide new password" : "Show new password"}
              >
                <span className="reset-eye-icon" aria-hidden="true">
                  {showNewPassword ? "🙈" : "👁"}
                </span>
              </button>
            </div>
          </div>

          <div className="input-group">
            <div className="password-box">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-password reset-toggle-password"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                title={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                <span className="reset-eye-icon" aria-hidden="true">
                  {showConfirmPassword ? "🙈" : "👁"}
                </span>
              </button>
            </div>
          </div>

          {error && <div className="login-error">{error}</div>}
          {info && <div className="login-info">{info}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>

        <div className="login-footer">
          Back to <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
