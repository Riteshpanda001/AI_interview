import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/prenova_ai_logo.png";
import "./ResetPassword.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      setErrorMsg("Invalid access link. Missing email parameter.");
    }
  }, [searchParams]);

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Missing email address context.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New password and confirmation password do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await resetPassword(email, otp, newPassword);
      setSuccessMsg("Password successfully reset! Redirecting to login page...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Please verify the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <img src={logo} alt="PrepNova AI" className="reset-logo" />
          <h2>Reset Password</h2>
          <p>
            Configure your new credentials for account <strong style={{ color: "#c084fc" }}>{email}</strong> below.
          </p>
        </div>

        {errorMsg && <div className="alert-message error">{errorMsg}</div>}
        {successMsg && <div className="alert-message info">{successMsg}</div>}

        <form onSubmit={handleResetPasswordSubmit} className="reset-password-form">
          
          {/* OTP Code */}
          <div className="input-group">
            <label htmlFor="otp">Verification Code (6-digit)</label>
            <input
              id="otp"
              type="text"
              maxLength="6"
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
            <span className="input-tip">Check your email console log output for the code.</span>
          </div>

          {/* New Password */}
          <div className="input-group">
            <label htmlFor="new-password">New Password</label>
            <div className="password-box-reset">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label htmlFor="confirm-password">Confirm New Password</label>
            <div className="password-box-reset">
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="reset-btn-main" disabled={isLoading || !email}>
            {isLoading ? "Resetting Password..." : "Update Password"}
          </button>

          <p className="back-login-text">
            Cancel process?
            <a href="/login"> Back to Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
