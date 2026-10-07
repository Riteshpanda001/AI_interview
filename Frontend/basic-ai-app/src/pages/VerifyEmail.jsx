import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./VerifyEmail.css";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();
  const { verifyEmailLink, resendVerificationLink } = useAuth();

  const [status, setStatus] = useState("VERIFYING"); // "VERIFYING" | "LINK_VERIFIED" | "BOTH_VERIFIED" | "ALREADY_USED" | "EXPIRED" | "ERROR"
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (!token) {
      setStatus("ERROR");
      setMessage("Verification link token is missing. Please check the link in your email.");
      return;
    }

    const processVerification = async () => {
      try {
        const res = await verifyEmailLink(token);
        const userEmail = res.email || "";
        setEmail(userEmail);
        setPhone(res.phone || "");
        setMessage(res.message || "Email link verified successfully!");

        if (res.access_token && res.is_verified) {
          setStatus("LINK_VERIFIED");
          setMessage("Account verified and activated successfully!");
          navigate("/", { replace: true });
        } else if (res.require_mobile_otp) {
          setStatus("BOTH_VERIFIED");
          navigate(`/verify-otp?email=${encodeURIComponent(userEmail)}&phone=${encodeURIComponent(res.phone || "")}&step=mobile_otp`, { replace: true });
        } else {
          setStatus("LINK_VERIFIED");
          navigate(`/verify-otp?email=${encodeURIComponent(userEmail)}&link_verified=true`, { replace: true });
        }
      } catch (err) {
        const errMsg = err.message || "";
        if (errMsg.toLowerCase().includes("already used")) {
          setStatus("ALREADY_USED");
          setMessage("Verification link has already been used.");
        } else if (errMsg.toLowerCase().includes("expired")) {
          setStatus("EXPIRED");
          setMessage("This verification link has expired.");
        } else {
          setStatus("ERROR");
          setMessage(errMsg || "Invalid or expired verification link.");
        }
      }
    };

    processVerification();
  }, [token]);

  const handleResendLink = async () => {
    if (!email || resendTimer > 0 || isResending) return;
    setIsResending(true);
    setResendMsg("");
    try {
      await resendVerificationLink(email);
      setResendMsg("A new verification link email has been sent to your inbox!");
      setResendTimer(60);
    } catch (err) {
      setResendMsg(err.message || "Failed to resend verification link.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {status === "VERIFYING" && (
          <div className="verify-email-content">
            <div className="verify-spinner"></div>
            <h2>Verifying Email Link...</h2>
            <p>Please wait while we confirm your security token.</p>
          </div>
        )}

        {status === "LINK_VERIFIED" && (
          <div className="verify-email-content success">
            <div className="status-icon">✓</div>
            <h2>Email Link Verified!</h2>
            <p className="status-desc">
              Your verification link has been confirmed. A 6-digit verification code has been sent to your Gmail.
            </p>
            <div className="notice-box">
              <p>
                📩 <strong>Next Step:</strong> Redirecting to enter your 6-digit verification code...
              </p>
            </div>
            <button
              className="action-btn"
              onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}&link_verified=true`)}
            >
              Continue to OTP Verification →
            </button>
          </div>
        )}

        {status === "BOTH_VERIFIED" && (
          <div className="verify-email-content success">
            <div className="status-icon">🎉</div>
            <h2>Email Fully Verified!</h2>
            <p className="status-desc">
              Your email address has been verified.
            </p>
            <div className="notice-box">
              <p>
                📱 Redirecting to Mobile Verification...
              </p>
            </div>
            <button
              className="action-btn"
              onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}&step=mobile_otp`)}
            >
              Continue to Mobile Verification →
            </button>
          </div>
        )}

        {status === "ALREADY_USED" && (
          <div className="verify-email-content error">
            <div className="status-icon">ℹ️</div>
            <h2>Verification Link Already Used</h2>
            <p className="error-desc">{message}</p>
            <div className="notice-box" style={{ background: "rgba(124, 58, 237, 0.1)", borderColor: "rgba(168, 85, 247, 0.3)" }}>
              <p>
                Your verification code has already been sent. Please enter the code sent to your email to complete verification.
              </p>
            </div>
            {email && (
              <button
                className="action-btn"
                style={{ marginTop: "16px" }}
                onClick={() => navigate(`/verify-otp?email=${encodeURIComponent(email)}&link_verified=true`)}
              >
                Enter Verification Code →
              </button>
            )}
            <div className="back-links" style={{ marginTop: "20px" }}>
              <Link to="/login" className="back-link">← Back to Login</Link>
            </div>
          </div>
        )}

        {status === "EXPIRED" && (
          <div className="verify-email-content error">
            <div className="status-icon">⏰</div>
            <h2>Verification Link Expired</h2>
            <p className="error-desc">{message}</p>
            {email && (
              <div style={{ marginTop: "16px" }}>
                <button
                  className="resend-link-btn"
                  onClick={handleResendLink}
                  disabled={isResending || resendTimer > 0}
                >
                  {isResending
                    ? "Resending Link..."
                    : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Verification Email"}
                </button>
                {resendMsg && <p className="resend-info" style={{ marginTop: "10px", color: "#c084fc" }}>{resendMsg}</p>}
              </div>
            )}
            <div className="back-links" style={{ marginTop: "24px" }}>
              <Link to="/register" className="back-link">← Back to Registration</Link>
            </div>
          </div>
        )}

        {status === "ERROR" && (
          <div className="verify-email-content error">
            <div className="status-icon">⚠️</div>
            <h2>Verification Link Failed</h2>
            <p className="error-desc">{message}</p>

            {email && (
              <div style={{ marginTop: "16px" }}>
                <button
                  className="resend-link-btn"
                  onClick={handleResendLink}
                  disabled={isResending || resendTimer > 0}
                >
                  {isResending
                    ? "Resending Link..."
                    : resendTimer > 0
                    ? `Resend in ${resendTimer}s`
                    : "Resend Verification Email"}
                </button>
                {resendMsg && <p className="resend-info" style={{ marginTop: "10px", color: "#c084fc" }}>{resendMsg}</p>}
              </div>
            )}

            <div className="back-links" style={{ marginTop: "24px" }}>
              <Link to="/register" className="back-link">← Back to Registration</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
