import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/prenova_ai_logo.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await forgotPassword(email);
      setSuccessMsg("Recovery code successfully sent! Redirecting to password reset...");
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to request password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <img src={logo} alt="PrepNova AI" className="forgot-logo" />
          <h2>Recover Password</h2>
          <p>
            Enter your registered email below, and we will send you a 6-digit verification code to reset your password.
          </p>
        </div>

        {errorMsg && <div className="alert-message error">{errorMsg}</div>}
        {successMsg && <div className="alert-message info">{successMsg}</div>}

        <form onSubmit={handleForgotPasswordSubmit} className="forgot-password-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. candidate@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="forgot-btn-main" disabled={isLoading}>
            {isLoading ? "Sending Code..." : "Send Verification Code"}
          </button>

          <p className="back-login-text">
            Remember your password?
            <a href="/login"> Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
