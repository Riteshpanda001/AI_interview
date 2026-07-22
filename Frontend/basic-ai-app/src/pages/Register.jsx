import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import logo from "../assets/prenova_ai_logo.png";
import googleLogo from "../assets/google.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, verifyOtp, resendOtp, googleLogin } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Prefill email if redirecting from login
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  // Load Google OAuth script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
      await resendOtp(email, "email_verification");
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

  const validateRegistration = () => {
    if (!fullName || !email || !password || !confirmPassword) {
      return "All fields are required.";
    }
    if (fullName.trim().length < 3) {
      return "Full Name must be at least 3 characters long.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number.";
    }
    if (!/[!@#$%^&*(),.?":{}|<>\-_+=]/.test(password)) {
      return "Password must contain at least one special character.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return null;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegistration();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      await register(fullName.trim(), email.trim(), password, confirmPassword);
      // Redirect to dedicated OTP Verification Page
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    setErrorMsg("");
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: "1057492984572-mockclientid.apps.googleusercontent.com",
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
            navigate("/dashboard");
          } catch (err) {
            setErrorMsg(err.message || "Google Sign-In failed.");
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } else {
      setTimeout(async () => {
        try {
          const fakeToken = "mock_google_jwt_token_for_dev_testing";
          await googleLogin(fakeToken);
          navigate("/dashboard");
        } catch (err) {
          setErrorMsg("Google Sign-In error: " + (err.message || err));
        } finally {
          setIsGoogleLoading(false);
        }
      }, 1000);
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
      await verifyOtp(email, fullOtp, "email_verification");
      setInfoMsg("Account successfully created and verified! Redirecting...");
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
    <div className="register-page">
      <div className="register-container">
        <div className="register-left">
          <img src={logo} alt="PrepNova AI" />
          <h1>🚀 Join <span>PreNova</span> AI</h1>
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
                  placeholder="Minimum 6 characters"
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

            <div className="input-group">
              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span className="password-mismatch-text">Passwords do not match</span>
              )}
            </div>

            <button type="submit" className="register-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              <img src={googleLogo} alt="Google" className="google-icon" />
              {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
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
            <div className="otp-icon-header">
              <span>🔐</span>
            </div>
            <h3>Verify Your Email</h3>
            <p>We've sent a 6-digit verification code to <strong>{email}</strong></p>
            
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
                    : "Resend Verification Code"}
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
                  {isVerifyingOtp ? "Verifying..." : "Verify & Activate"}
                </button>
              </div>
            </form>
            <p className="otp-helper-text">
              Check your email inbox & spam folder for your 6-digit verification code.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;