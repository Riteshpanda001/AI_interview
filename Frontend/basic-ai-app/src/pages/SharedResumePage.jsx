import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import ResumePreview from "../components/resumeBuilder/ResumePreview";
import "./SharedResumePage.css";

const API_BASE_URL = "http://localhost:8000/api";

const SharedResumePage = () => {
  const { shareToken } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [template, setTemplate] = useState("london");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isProtected, setIsProtected] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const fetchSharedResume = useCallback(async (pw = "") => {
    setLoading(true);
    setAuthError("");
    try {
      const url = `${API_BASE_URL}/resume/public/${shareToken}`;
      
      const res = await fetch(pw ? `${API_BASE_URL}/resume/public/${shareToken}/authenticate` : url, {
        method: pw ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: pw ? JSON.stringify({ password: pw }) : undefined
      });

      if (res.ok) {
        const data = await res.json();
        if (data.access_denied || data.is_protected) {
          setIsProtected(true);
          if (pw) setAuthError("Incorrect password. Please try again.");
        } else {
          setIsProtected(false);
          setResumeData(data.parsed_content || data.resume_data || {});
          setTemplate(data.selected_template || "london");
        }
      } else {
        setError("Shared resume not found or link has expired.");
      }
    } catch (err) {
      console.error("Error fetching shared resume:", err);
      setError("Unable to connect to server. Shared resume unavailable.");
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    fetchSharedResume();
  }, [fetchSharedResume]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      fetchSharedResume(passwordInput.trim());
    }
  };

  if (loading) {
    return (
      <div className="shared-resume-page-container" style={{ justifyContent: "center" }}>
        <p style={{ fontSize: "1.2rem", color: "#94a3b8" }}>Loading Shared Resume...</p>
      </div>
    );
  }

  if (isProtected && !resumeData) {
    return (
      <div className="shared-resume-page-container" style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{
          background: "#1e293b",
          padding: "2rem",
          borderRadius: "16px",
          border: "1px solid #334155",
          maxWidth: "400px",
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
          <h2 style={{ color: "#f8fafc", margin: "0 0 0.5rem 0" }}>Protected Resume</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            The owner has protected this resume with a password. Please enter the password to view.
          </p>
          
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Enter password..."
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #475569",
                background: "#0f172a",
                color: "#fff",
                fontSize: "1rem",
                marginBottom: "1rem",
                boxSizing: "border-box"
              }}
              autoFocus
            />
            {authError && <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "1rem" }}>{authError}</p>}
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "none",
                background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Unlock Resume
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error && !resumeData) {
    return (
      <div className="shared-resume-page-container" style={{ justifyContent: "center" }}>
        <h2 style={{ color: "#f87171" }}>⚠️ Link Expired or Private</h2>
        <p style={{ color: "#94a3b8" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="shared-resume-page-container">
      <div className="shared-top-header">
        <div className="shared-brand-badge">
          <span>✨</span> AI Resume Builder — Public View
        </div>
        <div className="shared-action-btns">
          <button className="btn-shared-print" onClick={() => window.print()}>
            🖨️ Download / Print PDF
          </button>
        </div>
      </div>

      <div className="shared-preview-wrapper">
        <ResumePreview resumeData={resumeData} selectedTemplate={template} />
      </div>
    </div>
  );
};

export default SharedResumePage;
