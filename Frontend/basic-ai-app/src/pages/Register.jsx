import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";
import logo from "../assets/prenova_ai_logo.png";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, verifyOtp, resendOtp, googleLogin, sendMobileOtp, verifyMobileOtp } = useAuth();
  // Mobile Verification States
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [showMobileOtpModal, setShowMobileOtpModal] = useState(false);
  const [mobileOtpDigits, setMobileOtpDigits] = useState(["", "", "", "", "", ""]);
  const [mobileOtpError, setMobileOtpError] = useState("");
  const [isVerifyingMobileOtp, setIsVerifyingMobileOtp] = useState(false);

  const handleSendMobileOtp = async () => {
    if (!phone || phone.trim().length < 10) {
      setErrorMsg("Please enter a valid mobile number first.");
      return;
    }
    setIsSendingMobileOtp(true);
    setErrorMsg("");
    try {
      await sendMobileOtp(phone.trim());
      setShowMobileOtpModal(true);
      setMobileOtpDigits(["", "", "", "", "", ""]);
      setInfoMsg(`SMS verification code sent to +91 ******${phone.trim().slice(-4)}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send mobile OTP.");
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleVerifyMobileOtpSubmit = async (e) => {
    e.preventDefault();
    const fullCode = mobileOtpDigits.join("");
    if (fullCode.length !== 6) {
      setMobileOtpError("Please enter all 6 digits of your SMS code.");
      return;
    }
    setIsVerifyingMobileOtp(true);
    setMobileOtpError("");
    try {
      await verifyMobileOtp(phone.trim(), fullCode);
      setPhoneVerified(true);
      setShowMobileOtpModal(false);
      setInfoMsg("Mobile number verified successfully! ✓");
    } catch (err) {
      setMobileOtpError(err.message || "Invalid SMS verification code.");
    } finally {
      setIsVerifyingMobileOtp(false);
    }
  };

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(() => searchParams.get("email") || "");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Load Google GSI script and render the official Sign-In button
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
            await googleLogin(response.credential);
            navigate("/");
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
        width: googleBtnRef.current.offsetWidth || 360,
        logo_alignment: "left",
      });
    };

    // If GSI already loaded (e.g. hot-reload), initialise immediately
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

  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
  const googleBtnRef = useRef(null);

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
      await register(fullName.trim(), email.trim(), password, confirmPassword, phone.trim(), gender);
      // Redirect to dedicated OTP Verification Page
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In is handled via the renderButton callback above.
  const handleGoogleSignIn = () => {
    // The official Google button rendered via renderButton() handles the click;
    // this function is intentionally left as a no-op.
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
    <div className="register-page">
      <div className="register-container">
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

        <div className="register-right">
          <div className="register-header">
            <h2>Create Account</h2>
            <p className="register-subtitle">Get started with your free PreNova AI account</p>
          </div>

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

            <div className="input-row">
              <div className="input-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ margin: 0 }}>Mobile Number</label>
                  {phoneVerified ? (
                    <span style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: "700" }}>✓ Mobile Verified</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={isSendingMobileOtp || !phone}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c084fc",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      {isSendingMobileOtp ? "Sending..." : "[ Verify ]"}
                    </button>
                  )}
                </div>
                <input
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (phoneVerified) setPhoneVerified(false);
                  }}
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

            <div className="auth-divider">
              <span>or sign up with</span>
            </div>

            {/* Official Google Sign-In button rendered by the GSI library */}
            <div
              id="google-signin-btn-register"
              ref={googleBtnRef}
              className="google-signin-btn-container"
              style={{ minHeight: "44px", display: "flex", justifyContent: "center" }}
            />
            {isGoogleLoading && (
              <p style={{ textAlign: "center", color: "#c084fc", fontSize: "0.9rem", marginTop: "8px" }}>
                Connecting to Google...
              </p>
            )}

            <p className="login-link">
              Already have an account?
              <a href="/login"> Login</a>
            </p>
          </form>
        </div>
      </div>

      {/* Email OTP Verification Modal Overlay */}
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
          </div>
        </div>
      )}

      {/* Mobile SMS OTP Modal Overlay */}
      {showMobileOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <div className="otp-icon-header">
              <span>📱</span>
            </div>
            <h3>Verify Mobile Number</h3>
            <p>Enter the 6-digit SMS code sent to <strong>+91 ******{phone.slice(-4)}</strong></p>
            
            {mobileOtpError && <div className="alert-message error">{mobileOtpError}</div>}
            
            <form onSubmit={handleVerifyMobileOtpSubmit}>
              <div className="otp-boxes-container">
                {mobileOtpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength="1"
                    className="otp-box-digit"
                    value={digit}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/\D/g, "");
                      const newArr = [...mobileOtpDigits];
                      newArr[idx] = cleanVal;
                      setMobileOtpDigits(newArr);
                    }}
                  />
                ))}
              </div>

              <div className="otp-modal-buttons" style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="otp-cancel-btn"
                  onClick={() => setShowMobileOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="otp-submit-btn"
                  disabled={isVerifyingMobileOtp || mobileOtpDigits.join("").length !== 6}
                >
                  {isVerifyingMobileOtp ? "Verifying..." : "Verify Mobile"}
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