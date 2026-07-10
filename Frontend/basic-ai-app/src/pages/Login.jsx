import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, checkEmail, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  
  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      // 1. Check if email exists
      const exists = await checkEmail(email);
      if (!exists) {
        setInfoMsg("Account does not exist! Redirecting to Registration...");
        setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email)}`);
        }, 2000);
        return;
      }

      // 2. Attempt login
      await login(email, password);
      // Redirect to homepage on success
      navigate("/");
    } catch (err) {
      if (err.status === 403) {
        // Account exists but not verified. Show OTP modal.
        setErrorMsg("");
        setInfoMsg("Account requires verification. An OTP has been sent to your email.");
        setShowOtpModal(true);
      } else {
        setErrorMsg(err.message || "Invalid credentials. Please try again.");
      }
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
      setInfoMsg("Account successfully verified and logged in!");
      setTimeout(() => {
        navigate("/");
      }, 1500);
      setShowOtpModal(false);
    } catch (err) {
      setOtpError(err.message || "Invalid or expired OTP code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };


  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side */}
        <div className="login-left">
          <img src={logo} alt="PrepNova AI" className="logo" />
          <h1>Welcome <span>Back</span> 👋</h1>
          <p>
            Sign in to continue your interview preparation journey with PrepNova AI (PreNovaAi).
          </p>
          <img src="/images/login-ai.png" alt="AI Interview" className="login-image" />
        </div>

        {/* Right Side */}
        <div className="login-right">
          <h2>Login</h2>

          {errorMsg && <div className="alert-message error">{errorMsg}</div>}
          {infoMsg && <div className="alert-message info">{infoMsg}</div>}

          <form onSubmit={handleLoginSubmit}>
            <div className="input-group">
              <label>Email Address</label>
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

            <div className="login-options">
              <label>
                <input type="checkbox" /> Remember Me
              </label>
              <a href="/">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn-main" disabled={isLoading}>
              {isLoading ? "Checking Details..." : "Login"}
            </button>


            <button type="button" className="google-btn">
              <img src={googleLogo} alt="Google" className="google-icon" />
              Continue with Google
            </button>

            <p className="signup-text">
              Don't have an account?
              <a href="/register"> Create Account</a>
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

export default Login;