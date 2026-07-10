import React, { useState } from "react";
import { FaPlay, FaGraduationCap, FaNetworkWired, FaBriefcase } from "react-icons/fa";

const InterviewSetup = ({ onStartInterview }) => {
  const [role, setRole] = useState("Backend Developer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("technical");

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRole = role === "Other" ? customRole : role;
    if (!finalRole) return;
    onStartInterview({
      role_target: finalRole,
      interview_type: interviewType,
    });
  };

  return (
    <div style={{
      background: "#ffffff",
      padding: "45px",
      borderRadius: "25px",
      boxShadow: "0 15px 35px rgba(0,0,0,.08)",
      maxWidth: "700px",
      margin: "0 auto",
      fontFamily: "'Poppins', sans-serif"
    }}>
      <div style={{ textAlign: "center", marginBottom: "35px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "10px" }}>
          Configure Your Mock Interview
        </h2>
        <p style={{ color: "#6b7280", fontSize: "15px" }}>
          Customize your AI session details below to generate specialized, real-time interview questions.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {/* Role Selection */}
        <div>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "8px"
          }}>
            Target Job Role
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                background: "#f9fafb",
                cursor: "pointer",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="Backend Developer">Backend Developer</option>
              <option value="Frontend Developer">Frontend Developer</option>
              <option value="Fullstack Developer">Fullstack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Other">Other (Type custom role...)</option>
            </select>
          </div>
        </div>

        {/* Custom Role Input */}
        {role === "Other" && (
          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Custom Role Name
            </label>
            <input
              type="text"
              placeholder="e.g. iOS Developer, Cybersecurity Engineer"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                outline: "none",
                background: "#ffffff",
                transition: "border-color 0.3s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
        )}

        {/* Interview Type Cards */}
        <div>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "12px"
          }}>
            Interview Category
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
            {/* Technical Card */}
            <div
              onClick={() => setInterviewType("technical")}
              style={{
                border: `2px solid ${interviewType === "technical" ? "#7c3aed" : "#e5e7eb"}`,
                background: interviewType === "technical" ? "rgba(124, 58, 237, 0.05)" : "#ffffff",
                padding: "20px 15px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              <FaNetworkWired style={{ fontSize: "24px", color: "#7c3aed", marginBottom: "8px" }} />
              <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "14px" }}>Technical</div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>System, coding & concepts</div>
            </div>

            {/* Behavioral Card */}
            <div
              onClick={() => setInterviewType("behavioral")}
              style={{
                border: `2px solid ${interviewType === "behavioral" ? "#7c3aed" : "#e5e7eb"}`,
                background: interviewType === "behavioral" ? "rgba(124, 58, 237, 0.05)" : "#ffffff",
                padding: "20px 15px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              <FaGraduationCap style={{ fontSize: "24px", color: "#7c3aed", marginBottom: "8px" }} />
              <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "14px" }}>Behavioral</div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>STAR method scenarios</div>
            </div>

            {/* HR Card */}
            <div
              onClick={() => setInterviewType("hr")}
              style={{
                border: `2px solid ${interviewType === "hr" ? "#7c3aed" : "#e5e7eb"}`,
                background: interviewType === "hr" ? "rgba(124, 58, 237, 0.05)" : "#ffffff",
                padding: "20px 15px",
                borderRadius: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              <FaBriefcase style={{ fontSize: "24px", color: "#7c3aed", marginBottom: "8px" }} />
              <div style={{ fontWeight: "700", color: "#1f2937", fontSize: "14px" }}>HR & Fit</div>
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>Culture & background</div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "16px",
            border: "none",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
            color: "#ffffff",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            transition: "all 0.3s",
            boxShadow: "0 10px 20px rgba(124, 58, 237, 0.2)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 15px 25px rgba(124, 58, 237, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(124, 58, 237, 0.2)";
          }}
        >
          <FaPlay /> Start AI Interview Session
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;
