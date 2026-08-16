import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/prenova_ai_logo.png";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword, verifyPasswordResetOtp, resetPassword, resendOtp } = useAuth();

  // Multi-step Wizard State: 1: Email, 2: OTP, 3: New Password, 4: Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Step 1: Send Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await forgotPassword(email.trim());
      setStep(2);
      setResendTimer(60);
      setInfoMsg(`A 6-digit recovery code has been sent to ${email.trim()}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP Code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter all 6 digits of your verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      const res = await verifyPasswordResetOtp(email.trim(), fullOtp);
      setResetToken(res.reset_token);
      setStep(3);
      setInfoMsg("Code verified! Please create your new password.");
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired recovery code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    try {
      await resendOtp(email.trim(), "password_reset");
      setResendTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
      setInfoMsg("New recovery code sent to your email!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend recovery code.");
    } finally {
      setIsResending(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setErrorMsg("Password must contain uppercase, lowercase letters, and numbers.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await resetPassword(email.trim(), newPassword, confirmPassword, resetToken);
      setStep(4);
    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <img src={logo} alt="PrepNova AI" className="forgot-logo" />
          <h2>
            {step === 1 && "Recover Password"}
            {step === 2 && "Enter Verification Code"}
            {step === 3 && "Create New Password"}
            {step === 4 && "Password Reset Complete!"}
          </h2>
          <p>
            {step === 1 && "Enter your registered email address below to receive a 6-digit recovery code."}
            {step === 2 && `We've sent a 6-digit recovery code to ${email}`}
            {step === 3 && "Your identity has been verified. Choose a strong new password for your account."}
            {step === 4 && "Your password has been reset successfully. You can now login with your new credentials."}
          </p>
        </div>

        {errorMsg && <div className="alert-message error">{errorMsg}</div>}
        {infoMsg && step !== 4 && <div className="alert-message info">{infoMsg}</div>}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="forgot-password-form">
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
              {isLoading ? "Sending Code..." : "Send Recovery Code"}
            </button>

            <p className="back-login-text">
              Remember your password?
              <a href="/login"> Back to Login</a>
            </p>
          </form>
        )}

        {/* STEP 2: Enter OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="forgot-password-form">
            <div className="otp-boxes-container" style={{ margin: "20px 0" }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength="1"
                  className="otp-box-digit"
                  value={digit}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/\D/g, "");
                    const newArr = [...otpDigits];
                    newArr[idx] = cleanVal;
                    setOtpDigits(newArr);
                  }}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                style={{
                  background: "none",
                  border: "none",
                  color: resendTimer > 0 ? "#71717a" : "#c084fc",
                  cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  textDecoration: "underline"
                }}
              >
                {isResending
                  ? "Resending code..."
                  : resendTimer > 0
                  ? `Resend code in ${resendTimer}s`
                  : "Resend Code"}
              </button>
            </div>

            <button
              type="submit"
              className="forgot-btn-main"
              disabled={isLoading || otpDigits.join("").length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <p className="back-login-text">
              Wrong email address?
              <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#c084fc", cursor: "pointer", textDecoration: "underline", marginLeft: "4px" }}>
                Change Email
              </button>
            </p>
          </form>
        )}

        {/* STEP 3: Enter New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPasswordSubmit} className="forgot-password-form">
            <div className="input-group">
              <label>New Password</label>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="password-mismatch-text">Passwords do not match</span>
              )}
            </div>

            <button type="submit" className="forgot-btn-main" disabled={isLoading}>
              {isLoading ? "Updating Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* STEP 4: Success */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🎉</div>
            <p style={{ color: "#34d399", fontWeight: "700", fontSize: "1.1rem", marginBottom: "24px" }}>
              Password Reset Successfully!
            </p>
            <button
              type="button"
              className="forgot-btn-main"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
