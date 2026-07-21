import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";

const Login = () => {
  const navigate = useNavigate();
  const { login, checkEmail, verifyOtp, resendOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  
  // OTP Verification States (6 Digits)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  const inputRefs = Array.from({ length: 6 }, () => React.createRef());

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      await resendOtp(email);
      setResendTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setOtpError(err.message || "Failed to resend code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleDigitChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length > 1) {
      const digits = cleanValue.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      digits.forEach((d, idx) => {
        if (index + idx < 6) {
          newOtp[index + idx] = d;
        }
      });
      setOtpDigits(newOtp);
      const nextFocus = Math.min(index + digits.length, 5);
      inputRefs[nextFocus]?.current?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue;
    setOtpDigits(newOtp);

    if (cleanValue && index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;

    const digits = pastedData.split("");
    const newOtp = ["", "", "", "", "", ""];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtpDigits(newOtp);
    const focusIdx = Math.min(digits.length, 5);
    inputRefs[focusIdx]?.current?.focus();
  };

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

      // 2. Attempt login (triggers OTP sending to Gmail if credentials valid)
      const loginRes = await login(email, password);
      if (loginRes?.require_otp) {
        setInfoMsg(loginRes.message || "A 6-digit OTP code has been sent to your Gmail for verification.");
        setShowOtpModal(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(60);
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      if (err.status === 403) {
        setErrorMsg("");
        setInfoMsg("Account requires verification. An OTP has been sent to your email.");
        setShowOtpModal(true);
        setResendTimer(60);
      } else {
        setErrorMsg(err.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of your verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      await verifyOtp(email, fullOtp);
      setInfoMsg("Account successfully verified! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
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
              <a href="/forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn-main" disabled={isLoading}>
              {isLoading ? "Verifying Credentials..." : "Login"}
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
            <div className="otp-icon-header">
              <span>🔐</span>
            </div>
            <h3>Verify Your Gmail</h3>
            <p>Enter the 6-digit random code sent to <strong>{email}</strong></p>
            
            {otpError && <div className="alert-message error">{otpError}</div>}
            
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-boxes-container" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength="1"
                    className="otp-box-digit"
                    value={digit}
                    onChange={(e) => handleDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <div className="resend-otp-container" style={{ margin: "16px 0", textAlign: "center" }}>
                <button
                  type="button"
                  className="resend-otp-btn"
                  onClick={handleResendCode}
                  disabled={resendTimer > 0 || isResending}
                  style={{
                    background: "none",
                    border: "none",
                    color: resendTimer > 0 ? "#71717a" : "#c084fc",
                    cursor: resendTimer > 0 ? "not-allowed" : "pointer",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    textDecoration: "underline"
                  }}
                >
                  {isResending
                    ? "Sending code..."
                    : resendTimer > 0
                    ? `Resend code in ${resendTimer}s`
                    : "Resend 6-Digit Code"}
                </button>
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
                  disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify & Login"}
                </button>
              </div>
            </form>
            <p className="otp-helper-text">
              Check your inbox & spam folder. (Local Dev Test Code: 123456)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;