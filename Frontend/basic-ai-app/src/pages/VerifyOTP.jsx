import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./VerifyOTP.css";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();

  const email = searchParams.get("email") || "";

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute countdown (60 seconds)
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = useRef([]);

  // Auto focus first box on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // 5-Minute Countdown Timer (300 seconds)
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Format seconds to MM:SS format
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleDigitChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    
    // If user pasted a code into a single box
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

    // Auto Focus Next Input Box
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
    if (timeLeft > 0 || isResending) return;
    if (!email) {
      setErrorMsg("Email address is missing. Please try registering again.");
      return;
    }

    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await resendOtp(email, "email_verification");
      setSuccessMsg("A new 6-digit verification code has been sent to your email.");
      setTimeLeft(60); // Reset timer to 1 minute
      setOtpDigits(["", "", "", "", "", ""]);
      if (inputRefs.current[0]?.current) {
        inputRefs.current[0].current.focus();
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to resend verification code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join("");

    if (otpCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the verification code.");
      return;
    }

    if (!email) {
      setErrorMsg("Email address is missing. Please return to login or registration.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await verifyOtp(email, otpCode, "email_verification");
      setSuccessMsg("Account successfully verified! Redirecting to Home...");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-card">
        <div className="verify-otp-header">
          <div className="verify-otp-icon-wrapper">
            🔐
          </div>
          <h1>Verify Your Email</h1>
          <p>
            Enter the 6-digit verification code sent to<br />
            <strong>{email || "your registered email"}</strong>
          </p>
        </div>

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
            <div className="countdown-badge">
              ⏳ Code expires in:{" "}
              <span className="countdown-timer-text">
                {formatTimer(timeLeft)}
              </span>
            </div>

            <button
              type="button"
              className="resend-btn"
              onClick={handleResendOTP}
              disabled={timeLeft > 0 || isResending}
            >
              {isResending ? "Resending Code..." : "Resend OTP Code"}
            </button>
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
              "Verify & Continue"
            )}
          </button>
        </form>

        <div className="back-to-login">
          Didn't mean to register? <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
