import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import logo from "../assets/prenova_ai_logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkRegistration, register, verifyOtp, resendOtp, sendMobileOtp, verifyMobileOtp, googleLogin } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Workflow / Modal States
  // Steps: "FORM" | "EMAIL_OTP" | "MOBILE_OTP" | "SUCCESS" | "MODAL_EXISTING_ACCOUNT" | "MODAL_EMAIL_EXISTS" | "MODAL_PHONE_EXISTS" | "MODAL_IDENTITY_CONFLICT" | "MODAL_GOOGLE_MOBILE"
  const [step, setStep] = useState("FORM");

  // Loading & Messages
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  // OTP Verification States (6 Digits)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Google OAuth Mobile Verification Prompt States
  const [googleCredential, setGoogleCredential] = useState("");
  const [googlePhone, setGooglePhone] = useState("");

  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
  const googleBtnRef = useRef(null);

  // Load Google GSI script and render official Sign-In button
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response?.credential) {
            setErrorMsg("Google Sign-In was cancelled or failed. Please try again.");
            return;
          }
          setIsGoogleLoading(true);
          setErrorMsg("");
          try {
            setGoogleCredential(response.credential);
            const res = await googleLogin(response.credential);
            if (res?.require_mobile) {
              setStep("MODAL_GOOGLE_MOBILE");
            } else if (res?.access_token) {
              navigate("/dashboard");
            }
          } catch (err) {
            setErrorMsg(err.message || "Google Sign-In failed. Please try again.");
          } finally {
            setIsGoogleLoading(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "380",
      });
    };

    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // OTP Resend Cooldown Timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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
      inputRefs.current[nextFocus]?.current?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue;
    setOtpDigits(newOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.current?.focus();
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
    inputRefs.current[focusIdx]?.current?.focus();
  };

  const validateRegistrationFields = () => {
    if (!fullName || !email || !password || !confirmPassword || !phone) {
      return "All fields including Full Name, Email, Password, and Mobile Number are required.";
    }
    if (fullName.trim().length < 3) {
      return "Full Name must be at least 3 characters long.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return "Please enter a valid 10-digit mobile number.";
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
    const validationError = validateRegistrationFields();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    try {
      // Step 1: Pre-check registration status for Email & Phone uniqueness
      const checkRes = await checkRegistration(email.trim(), phone.trim());

      if (checkRes.status === "EXISTING_ACCOUNT") {
        setStep("MODAL_EXISTING_ACCOUNT");
        return;
      }
      if (checkRes.status === "EMAIL_ALREADY_REGISTERED") {
        setStep("MODAL_EMAIL_EXISTS");
        return;
      }
      if (checkRes.status === "PHONE_ALREADY_REGISTERED") {
        setStep("MODAL_PHONE_EXISTS");
        return;
      }
      if (checkRes.status === "IDENTITY_CONFLICT") {
        setStep("MODAL_IDENTITY_CONFLICT");
        return;
      }

      // Step 2: New User -> Initiate pending registration & email OTP
      await register(fullName.trim(), email.trim(), password, confirmPassword, phone.trim(), gender);
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}&phone=${encodeURIComponent(phone.trim())}`);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP handler for Email / Mobile
  const handleResendOtpCode = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      if (step === "EMAIL_OTP") {
        await resendOtp(email.trim(), "email_verification");
      } else if (step === "MOBILE_OTP") {
        await sendMobileOtp(phone.trim());
      }
      setResendTimer(60);
      setOtpDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setOtpError(err.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  // Email OTP Submit
  const handleEmailOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of your Email verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const res = await verifyOtp(email.trim(), fullOtp, "email_verification");
      if (res?.require_mobile_otp) {
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(60);
        setStep("MOBILE_OTP");
      } else if (res?.access_token) {
        setStep("SUCCESS");
      }
    } catch (err) {
      setOtpError(err.message || "Invalid or expired Email OTP code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Mobile OTP Submit
  const handleMobileOtpSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of your Mobile verification code.");
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError("");

    try {
      const targetPhone = googlePhone || phone.trim();
      const res = await verifyMobileOtp(targetPhone, fullOtp);
      if (res?.access_token || res?.phone_verified) {
        setStep("SUCCESS");
      }
    } catch (err) {
      setOtpError(err.message || "Invalid or expired Mobile OTP code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Google Mobile Prompt Submit
  const handleGoogleMobileSubmit = async (e) => {
    e.preventDefault();
    if (!googlePhone || googlePhone.replace(/\D/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await googleLogin(googleCredential, googlePhone.trim());
      if (res?.require_mobile_otp) {
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(60);
        setStep("MOBILE_OTP");
      } else if (res?.access_token) {
        setStep("SUCCESS");
      }
    } catch (err) {
      setErrorMsg(err.message || "Mobile verification for Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        {/* Left Side Hero Panel */}
        <div className="register-left">
          <img src={logo} alt="PrepNova AI" className="logo" />
          <h1>🚀 Join <span>PreNova</span> AI</h1>
          <p>
            Create your account and start preparing for your dream job with AI-powered interviews.
          </p>
          
          <div className="register-image-wrapper">
            <img src="/images/register-ai.png" alt="AI Career" className="register-image"/>
          </div>
        </div>

        {/* Right Side Form Panel */}
        <div className="register-right">
          <div className="register-header">
            <h2>Create <span>Account</span></h2>
            <p className="register-subtitle">Get started with your free PreNova AI account</p>
          </div>

          {errorMsg && <div className="alert-message error">{errorMsg}</div>}
          {infoMsg && <div className="alert-message info">{infoMsg}</div>}

          {/* Main Registration Form */}
          {step === "FORM" && (
            <form onSubmit={handleRegisterSubmit} className="register-form">
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

              <div className="input-row">
                <div className="input-group">
                  <label>Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="gender-select"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="password-box">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
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
                {isLoading ? "Checking & Registering..." : "Continue"}
              </button>

              <div className="auth-divider">
                <span>or sign up with</span>
              </div>

              <div className="google-btn-wrapper">
                <button type="button" className="custom-google-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="google-icon-svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.88h12.66c-.55 2.87-2.17 5.31-4.61 6.94l7.2 5.58C39.46 35.15 46.5 29.5 46.5 24z"/>
                    <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.2-5.58c-2 1.34-4.55 2.13-8.69 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <div
                  id="google-signin-btn-register"
                  ref={googleBtnRef}
                  className="google-signin-btn-container-overlay"
                />
              </div>
              {isGoogleLoading && (
                <p style={{ textAlign: "center", color: "#c084fc", fontSize: "0.9rem", marginTop: "8px" }}>
                  Connecting to Google...
                </p>
              )}
            </form>
          )}

          <p className="login-link register-login-link">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>
        </div>
      </div>

      {/* ==========================================
          STEP: EMAIL OTP VERIFICATION MODAL
         ========================================== */}
      {step === "EMAIL_OTP" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-icon-header">
              <span>📧</span>
            </div>
            <h3>Email Verification</h3>
            <p>We sent a 6-digit verification code to your Gmail: <strong>{email}</strong></p>

            {otpError && <div className="alert-message error">{otpError}</div>}

            <form onSubmit={handleEmailOtpSubmit}>
              <div className="otp-boxes-container" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
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
                  onClick={handleResendOtpCode}
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
                    : "Resend OTP"}
                </button>
              </div>

              <div className="otp-modal-buttons">
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={() => setStep("FORM")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="otp-submit-btn"
                  disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP: MOBILE OTP VERIFICATION MODAL
         ========================================== */}
      {step === "MOBILE_OTP" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-icon-header">
              <span>📱</span>
            </div>
            <h3>Mobile Verification</h3>
            <p>We sent a 6-digit verification code to your mobile number: <strong>{googlePhone || phone}</strong></p>

            {otpError && <div className="alert-message error">{otpError}</div>}

            <form onSubmit={handleMobileOtpSubmit}>
              <div className="otp-boxes-container" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
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
                  onClick={handleResendOtpCode}
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
                    : "Resend Mobile OTP"}
                </button>
              </div>

              <div className="otp-modal-buttons">
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={() => setStep("FORM")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="otp-submit-btn"
                  disabled={isVerifyingOtp || otpDigits.join("").length !== 6}
                >
                  {isVerifyingOtp ? "Verifying..." : "Verify Mobile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          STEP: SUCCESS MODAL / SCREEN
         ========================================== */}
      {step === "SUCCESS" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal" style={{ textAlign: "center", padding: "36px 28px" }}>
            <div className="otp-icon-header" style={{ fontSize: "3.5rem" }}>
              <span>🎉</span>
            </div>
            <h2 style={{ color: "#F8F8FA", margin: "12px 0 8px 0" }}>Account Created Successfully</h2>
            <p style={{ color: "#A7A7B5", fontSize: "0.95rem", marginBottom: "28px" }}>
              Your PreNova AI account has been verified. Welcome aboard!
            </p>
            <button
              type="button"
              className="register-btn"
              onClick={() => navigate("/dashboard")}
              style={{ width: "100%" }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          CASE 4: EXISTING ACCOUNT MODAL
         ========================================== */}
      {step === "MODAL_EXISTING_ACCOUNT" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal" style={{ textAlign: "center", padding: "36px 28px" }}>
            <div className="otp-icon-header">
              <span>🔒</span>
            </div>
            <h3 style={{ color: "#F8F8FA", margin: "12px 0 8px 0" }}>Account Already Exists</h3>
            <p style={{ color: "#A7A7B5", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.6" }}>
              This email and mobile number are already registered with PreNova AI.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                className="register-btn"
                onClick={() => navigate("/login")}
                style={{ width: "100%" }}
              >
                Login
              </button>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => navigate("/pricing")}
                style={{ borderColor: "#c084fc", color: "#c084fc" }}
              >
                View Subscription Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CASE 2: DUPLICATE EMAIL MODAL
         ========================================== */}
      {step === "MODAL_EMAIL_EXISTS" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal" style={{ textAlign: "center", padding: "36px 28px" }}>
            <div className="otp-icon-header">
              <span>⚠️</span>
            </div>
            <h3 style={{ color: "#F8F8FA", margin: "12px 0 8px 0" }}>Email Already Registered</h3>
            <p style={{ color: "#A7A7B5", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.6" }}>
              This email is already associated with an account. Please log in or use another email.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                className="register-btn"
                onClick={() => navigate("/login")}
                style={{ width: "100%" }}
              >
                Login
              </button>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => {
                  setEmail("");
                  setStep("FORM");
                }}
              >
                Use Another Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CASE 3: DUPLICATE PHONE MODAL
         ========================================== */}
      {step === "MODAL_PHONE_EXISTS" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal" style={{ textAlign: "center", padding: "36px 28px" }}>
            <div className="otp-icon-header">
              <span>📱</span>
            </div>
            <h3 style={{ color: "#F8F8FA", margin: "12px 0 8px 0" }}>Mobile Number Already Registered</h3>
            <p style={{ color: "#A7A7B5", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.6" }}>
              This mobile number is already associated with an account. Please use another mobile number.
            </p>
            <button
              type="button"
              className="register-btn"
              onClick={() => {
                setPhone("");
                setStep("FORM");
              }}
              style={{ width: "100%" }}
            >
              Use Another Mobile Number
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          IDENTITY CONFLICT MODAL
         ========================================== */}
      {step === "MODAL_IDENTITY_CONFLICT" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal" style={{ textAlign: "center", padding: "36px 28px" }}>
            <div className="otp-icon-header">
              <span>⛔</span>
            </div>
            <h3 style={{ color: "#EF4444", margin: "12px 0 8px 0" }}>Identity Conflict</h3>
            <p style={{ color: "#A7A7B5", fontSize: "0.95rem", marginBottom: "28px", lineHeight: "1.6" }}>
              The email and mobile number cannot be combined because they are already associated with existing accounts.
            </p>
            <button
              type="button"
              className="register-btn"
              onClick={() => setStep("FORM")}
              style={{ width: "100%" }}
            >
              Try Different Details
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          GOOGLE REGISTRATION MOBILE PROMPT MODAL
         ========================================== */}
      {step === "MODAL_GOOGLE_MOBILE" && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-icon-header">
              <span>🌐</span>
            </div>
            <h3>Complete Google Sign-Up</h3>
            <p>Please enter your mobile number to complete your PreNova AI account registration.</p>

            {errorMsg && <div className="alert-message error">{errorMsg}</div>}

            <form onSubmit={handleGoogleMobileSubmit}>
              <div className="input-group" style={{ marginBottom: "20px" }}>
                <label style={{ color: "#A7A7B5", fontSize: "12px", textTransform: "uppercase" }}>Mobile Number</label>
                <input
                  type="tel"
                  placeholder="Enter mobile number"
                  value={googlePhone}
                  onChange={(e) => setGooglePhone(e.target.value)}
                  required
                  style={{
                    background: "rgba(13, 13, 20, 0.8)",
                    border: "1.5px solid #292936",
                    borderRadius: "12px",
                    color: "#F8F8FA",
                    fontSize: "15px",
                    padding: "12px 16px",
                    width: "100%",
                    outline: "none"
                  }}
                />
              </div>

              <div className="otp-modal-buttons">
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={() => setStep("FORM")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="otp-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Register;