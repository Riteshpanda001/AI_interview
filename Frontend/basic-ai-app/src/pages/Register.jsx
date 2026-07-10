import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, verifyOtp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Prefill email if redirecting from login
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await register(fullName, email, password);
      setInfoMsg("Registration successful! An OTP code has been sent to your email.");
      setShowOtpModal(true);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      await verifyOtp(email, otpCode);
      setInfoMsg("Account successfully created and verified in PreNovaAi! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 2000);
      setShowOtpModal(false);
    } catch (err) {
      setOtpError(err.message || "Invalid or expired OTP code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <img src={logo} alt="PrepNova AI" />
          <h1>🚀 Join <span>PrepNova </span>AI</h1>
          <p>
            Create your account and start preparing for your dream job with AI-powered interviews.
          </p>
          <img src="/images/register-ai.png" alt="AI Career" className="register-image"/>
        </div>

        <div className="register-right">
          <h2>Create Account</h2>

          {errorMsg && <div className="alert-message error">{errorMsg}</div>}
          {infoMsg && <div className="alert-message info">{infoMsg}</div>}

          <form onSubmit={handleRegisterSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <button type="button" className="google-btn">
              <img src={googleLogo} alt="Google" className="google-icon" />
              Continue with Google
            </button>

            <p className="login-link">
              Already have an account?
              <a href="/login"> Login</a>
            </p>
          </form>
        </div>
      </div>

      {/* OTP Verification Modal Overlay */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <h3>Enter Verification Code</h3>
            <p>We've sent a 6-digit verification code to <strong>{email}</strong>.</p>
            
            {otpError && <div className="alert-message error">{otpError}</div>}
            
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-input-container">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  required
                  className="otp-code-input"
                />
              </div>
              
              <div className="otp-modal-buttons">
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={() => {
                    setShowOtpModal(false);
                    setInfoMsg("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="otp-submit-btn"
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            </form>
            <p className="otp-helper-text">
              Don't see it? Check your spam folder or enter "123456" in local dev environment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;