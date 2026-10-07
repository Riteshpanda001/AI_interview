import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./VerifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOtp, resendOtp, resendVerificationLink, sendMobileOtp, verifyMobileOtp } = useAuth();

  const email = searchParams.get("email") || "";
  const phoneParam = searchParams.get("phone") || "";
  const stepParam = searchParams.get("step") || "";
  const isLinkVerifiedParam = searchParams.get("link_verified") === "true";

  const [mode, setMode] = useState(stepParam === "mobile_otp" ? "MOBILE_OTP" : "EMAIL_OTP");
  const [isLinkVerified, setIsLinkVerified] = useState(isLinkVerifiedParam);
  const [phone, setPhone] = useState(phoneParam);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  
  // Timers
  const [timeLeft, setTimeLeft] = useState(isLinkVerifiedParam ? 600 : 0);
  const [resendOtpCooldown, setResendOtpCooldown] = useState(0);
  const [resendLinkCooldown, setResendLinkCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResendingLink, setIsResendingLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (mode === "MOBILE_OTP") {
      setTimeLeft(60);
      setResendOtpCooldown(60);
    } else if (isLinkVerified) {
      setTimeLeft(600);
      setResendOtpCooldown(0);
    }
  }, [mode, isLinkVerified]);

  useEffect(() => {
    if (isLinkVerifiedParam && !isLinkVerified) {
      setIsLinkVerified(true);
    }
  }, [isLinkVerifiedParam]);

  useEffect(() => {
    if (isLinkVerified && mode === "EMAIL_OTP") {
      inputRefs.current[0]?.focus();
    } else if (mode === "MOBILE_OTP") {
      inputRefs.current[0]?.focus();
    }
  }, [isLinkVerified, mode]);

  // Main OTP expiration timer (10 mins for Email OTP, 60s for Mobile)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Resend OTP 60s cooldown timer
  useEffect(() => {
    if (resendOtpCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendOtpCooldown]);

  // Resend Link 60s cooldown timer
  useEffect(() => {
    if (resendLinkCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendLinkCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendLinkCooldown]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
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

  const handleResendOTP = async () => {
    if (resendOtpCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "EMAIL_OTP") {
        if (!email) {
          setErrorMsg("Email address is missing. Please try registering again.");
          return;
        }
        await resendOtp(email, "email_verification");
        setSuccessMsg("A new 6-digit verification code has been sent to your email.");
        setTimeLeft(600);
      } else {
        if (!phone) {
          setErrorMsg("Mobile number is missing.");
          return;
        }
        await sendMobileOtp(phone);
        setSuccessMsg("A new 6-digit mobile verification code has been sent to your mobile number.");
        setTimeLeft(60);
      }
      setResendOtpCooldown(60);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleResendLink = async () => {
    if (resendLinkCooldown > 0 || isResendingLink || !email) return;
    setIsResendingLink(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await resendVerificationLink(email);
      setSuccessMsg("A new verification link email has been sent to your inbox.");
      setResendLinkCooldown(60);
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend verification link.");
    } finally {
      setIsResendingLink(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join("");

    if (otpCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      let res;
      if (mode === "MOBILE_OTP") {
        if (!phone) {
          setErrorMsg("Mobile number is missing.");
          return;
        }
        res = await verifyMobileOtp(phone, otpCode);
      } else {
        if (!email) {
          setErrorMsg("Email address is missing. Please return to login or registration.");
          return;
        }
        res = await verifyOtp(email, otpCode, "email_verification");
      }

      if (res?.require_mobile_otp) {
        setMode("MOBILE_OTP");
        setOtpDigits(["", "", "", "", "", ""]);
        if (res.phone) setPhone(res.phone);
        setSuccessMsg("Email verified! A 6-digit SMS code has been sent to your mobile number.");
        setTimeLeft(60);
        setResendOtpCooldown(60);
        return;
      }

      if (res?.require_email_link) {
        setSuccessMsg("OTP confirmed. Please click the verification link sent to your email to complete activation.");
        return;
      }

      if (res?.access_token || res?.is_verified) {
        setSuccessMsg("Account successfully verified! Welcome to PreNova AI.");
        navigate("/", { replace: true });
      } else {
        setSuccessMsg("Verification completed! Welcome to PreNova AI.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <div className="verify-otp-icon-wrapper">
            {mode === "MOBILE_OTP" ? "📱" : isLinkVerified ? "✓" : "📩"}
          </div>
          <h1>{mode === "MOBILE_OTP" ? "Verify Mobile Number" : "Verify Your Email"}</h1>
          <p>
            {mode === "MOBILE_OTP" ? (
              <>
                We sent a 6-digit verification code to:<br />
                <strong>{phone || "your registered mobile"}</strong>
              </>
            ) : isLinkVerified ? (
              <>
                We sent a 6-digit verification code to:<br />
                <strong>{email || "your registered email"}</strong>
              </>
            ) : (
              <>
                Verification email sent to:<br />
                <strong>{email || "your registered email"}</strong>
              </>
            )}
          </p>
        </div>

        {/* Notice Banners for Email Mode */}
        {mode === "EMAIL_OTP" && !isLinkVerified && (
          <div style={{
            background: "rgba(124, 58, 237, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "14px",
            padding: "18px 22px",
            marginBottom: "24px",
            color: "#e9d5ff",
            textAlign: "left",
            lineHeight: "1.6"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#ffffff", fontSize: "16px", fontWeight: "700" }}>
              📩 Check your email. We sent you a verification link.
            </h3>
            <p style={{ margin: "0 0 6px 0", color: "#d8b4fe", fontSize: "14px" }}>
              Open your Gmail and click the <strong>"Verify Email Address"</strong> button.
            </p>
            <p style={{ margin: 0, color: "#a7a7b5", fontSize: "13px" }}>
              After clicking the link, we will send your 6-digit verification code to this screen.
            </p>
          </div>
        )}

        {mode === "EMAIL_OTP" && isLinkVerified && (
          <div style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.3)",
            borderRadius: "14px",
            padding: "16px 22px",
            marginBottom: "24px",
            color: "#86efac",
            textAlign: "left",
            lineHeight: "1.6"
          }}>
            <h3 style={{ margin: "0 0 6px 0", color: "#4ade80", fontSize: "16px", fontWeight: "700" }}>
              ✓ Email link verified
            </h3>
            <p style={{ margin: 0, color: "#d1fae5", fontSize: "14px" }}>
              The verification link has been confirmed. A 6-digit verification code has been sent to your Gmail.
            </p>
          </div>
        )}

        {errorMsg && (
          <div className="otp-alert error">
            ⚠️ {errorMsg}
            {errorMsg.toLowerCase().includes("not found") && (
              <div style={{ marginTop: "8px" }}>
                <Link to="/register" style={{ color: "#c084fc", fontWeight: "bold", textDecoration: "underline" }}>
                  → Register New Account
                </Link>
              </div>
            )}
          </div>
        )}
        {successMsg && <div className="otp-alert success">✅ {successMsg}</div>}

        {/* BEFORE LINK IS CLICKED: Show Resend Verification Email option */}
        {mode === "EMAIL_OTP" && !isLinkVerified && (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p style={{ color: "#a7a7b5", fontSize: "0.9rem", marginBottom: "16px" }}>
              Didn't receive the email link or link expired?
            </p>
            <button
              type="button"
              className="verify-submit-btn"
              onClick={handleResendLink}
              disabled={isResendingLink || resendLinkCooldown > 0}
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)" }}
            >
              {isResendingLink
                ? "Sending Link..."
                : resendLinkCooldown > 0
                ? `Resend Link in ${resendLinkCooldown}s`
                : "Resend Verification Email"}
            </button>
          </div>
        )}

        {/* AFTER LINK IS CLICKED or MOBILE OTP MODE: Show OTP Boxes */}
        {(mode === "MOBILE_OTP" || (mode === "EMAIL_OTP" && isLinkVerified)) && (
          <form onSubmit={handleVerifySubmit}>
            <div className="otp-inputs-row" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength="1"
                  className={`otp-single-box ${digit ? "filled" : ""}`}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isLoading}
                />
              ))}
            </div>

            <div className="timer-resend-container">
              {timeLeft > 0 ? (
                <div className="countdown-badge">
                  ⏳ Code expires in:{" "}
                  <span className="countdown-timer-text">
                    {formatTimer(timeLeft)}
                  </span>
                </div>
              ) : (
                <div className="countdown-badge" style={{ borderColor: "#ef4444", color: "#fca5a5" }}>
                  ⚠️ Verification Code Expired
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendOTP}
                  disabled={resendOtpCooldown > 0 || isResending}
                >
                  {isResending
                    ? "Resending Code..."
                    : resendOtpCooldown > 0
                    ? `Resend OTP in ${resendOtpCooldown}s`
                    : "Resend OTP Code"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="verify-submit-btn"
              disabled={isLoading || otpDigits.join("").length !== 6}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Verifying Code...
                </>
              ) : (
                "Verify OTP & Activate"
              )}
            </button>
          </form>
        )}

        <div className="back-to-login" style={{ marginTop: "24px" }}>
          Didn't mean to register? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
