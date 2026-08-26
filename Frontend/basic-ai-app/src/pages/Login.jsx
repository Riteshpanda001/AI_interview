import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";
import logo from "../assets/prenova_ai_logo.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, checkEmail, verifyOtp, resendOtp, googleLogin, verifyMfaLogin, sendMobileOtp } = useAuth();

  const redirectTarget = location.state?.from || "/";

  const [email, setEmail] = useState(() => localStorage.getItem("remembered_email") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("remembered_email"));
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  
  // OTP Verification States (6 Digits)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [mfaType, setMfaType] = useState("");
  const [mfaPhone, setMfaPhone] = useState("");
  
  const inputRefs = useRef([]);
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
            const loginRes = await googleLogin(response.credential);
            const userRole = (loginRes?.user?.role || "").toLowerCase().trim();
            const userEmail = (loginRes?.user?.email || loginRes?.email || "").toLowerCase().trim();
            const isAdmin = userRole === "admin" || userRole === "superadmin" || userEmail === "prenovaai01@gmail.com";
            const target = isAdmin ? "/admin" : redirectTarget;
            navigate(target, { replace: true });
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
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: "380",
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

  const handleResendCode = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setOtpError("");
    try {
      if (mfaType === "phone" && mfaPhone) {
        await sendMobileOtp(mfaPhone);
      } else {
        await resendOtp(email, "email_verification");
      }
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
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanValue;
    setOtpDigits(newOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
    inputRefs.current[focusIdx]?.focus();
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
    setIsUnverified(false);

    try {
      const exists = await checkEmail(email);
      if (!exists) {
        setInfoMsg("Account does not exist! Redirecting to Registration...");
        setTimeout(() => {
          navigate(`/register?email=${encodeURIComponent(email)}`);
        }, 2000);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("remembered_email", email);
      } else {
        localStorage.removeItem("remembered_email");
      }

      const loginRes = await login(email, password, rememberMe);
      if (loginRes?.require_otp) {
        if (loginRes.mfa_type) {
          setMfaType(loginRes.mfa_type);
          setMfaPhone(loginRes.phone || "");
          setInfoMsg(loginRes.message || "MFA Verification Required.");
        } else {
          setMfaType("");
          setMfaPhone("");
          setInfoMsg("A 6-digit OTP code has been sent to your email for verification.");
        }
        setShowOtpModal(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendTimer(60);
      } else {
        const userRole = (loginRes?.user?.role || "").toLowerCase().trim();
        const userEmail = (loginRes?.user?.email || loginRes?.email || email || "").toLowerCase().trim();
        const isAdmin = userRole === "admin" || userRole === "superadmin" || userEmail === "prenovaai01@gmail.com";
        const target = isAdmin ? "/admin" : redirectTarget;
        navigate(target, { replace: true });
      }
    } catch (err) {
      if (err.status === 403) {
        setIsUnverified(true);
        setErrorMsg("Please verify your email before logging in.");
      } else {
        setErrorMsg(err.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In is handled via the renderButton callback above.
  // This stub is kept for any programmatic re-trigger needs.
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
      let otpRes;
      if (mfaType) {
        otpRes = await verifyMfaLogin(email, fullOtp, mfaType);
      } else {
        otpRes = await verifyOtp(email, fullOtp, "email_verification");
      }
      setInfoMsg("Account successfully verified! Redirecting...");
      setTimeout(() => {
        const userRole = (otpRes?.user?.role || "").toLowerCase().trim();
        const userEmail = (otpRes?.user?.email || otpRes?.email || email || "").toLowerCase().trim();
        const isAdmin = userRole === "admin" || userRole === "superadmin" || userEmail === "prenovaai01@gmail.com";
        const target = isAdmin ? "/admin" : redirectTarget;
        navigate(target, { replace: true });
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
            Sign in to continue your interview preparation journey with PrepNova AI.
          </p>

          <div className="login-image-wrapper">
            <img src="/images/login-ai.png" alt="AI Interview" className="login-image" />
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Please enter your details to sign in</p>
          </div>

          {errorMsg && (
            <div className="alert-message error">
              {errorMsg}
              {isUnverified && (
                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}`)}
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Verify Email Now 🔐
                  </button>
                </div>
              )}
            </div>
          )}
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
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> Remember Me
              </label>
              <a href="/forgot-password" className="forgot-password-link">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn-main" disabled={isLoading}>
              {isLoading ? "Verifying Credentials..." : "Login"}
            </button>



            <div className="auth-divider">
              <span>or sign in with</span>
            </div>

            {/* Custom Google Button with absolute-positioned GSI iframe overlay */}
            <div className="google-btn-wrapper">
              <button type="button" className="custom-google-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="google-icon-svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.5 24c0-1.61-.15-3.16-.42-4.69H24v8.88h12.66c-.55 2.87-2.17 5.31-4.61 6.94l7.2 5.58C39.46 35.15 46.5 29.5 46.5 24z"/>
                  <path fill="#FBBC05" d="M10.54 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.98-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.2-5.58c-2 1.34-4.55 2.13-8.69 2.13-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
              <div
                id="google-signin-btn-login"
                ref={googleBtnRef}
                className="google-signin-btn-container-overlay"
              />
            </div>
            {isGoogleLoading && (
              <p style={{ textAlign: "center", color: "#c084fc", fontSize: "0.9rem", marginTop: "8px" }}>
                Connecting to Google...
              </p>
            )}

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
            <h3>{mfaType === "totp" ? "Authenticator App (TOTP) MFA" : mfaType === "phone" ? "Phone OTP (SMS) MFA" : "Verify Your Email"}</h3>
            <p>
              {mfaType === "totp" 
                ? "Enter the 6-digit code from your authenticator app." 
                : mfaType === "phone" 
                ? `Enter the 6-digit SMS code sent to your registered number: ******${mfaPhone.slice(-4)}`
                : <>Enter the 6-digit random code sent to <strong>{email}</strong></>}
            </p>
            
            {otpError && <div className="alert-message error">{otpError}</div>}
            
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-boxes-container" onPaste={handlePaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
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

              {mfaType !== "totp" && (
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
                      : mfaType === "phone" ? "Resend SMS Code" : "Resend Verification Code"}
                  </button>
                </div>
              )}
              
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
              {mfaType === "totp" 
                ? "Open your authenticator app to view the 2FA token." 
                : mfaType === "phone" 
                ? "Check your mobile device text messages for the SMS code." 
                : "Check your email inbox & spam folder for your 6-digit verification code."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;