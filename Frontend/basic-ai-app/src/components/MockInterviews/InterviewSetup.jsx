import React, { useState } from "react";
import { FaPlay, FaGraduationCap, FaNetworkWired, FaBriefcase, FaUpload, FaSpinner, FaFileAlt, FaBullseye } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./InterviewSetup.css";

const InterviewSetup = ({ onStartInterview }) => {
  const { authFetch } = useAuth();
  const [prepMode, setPrepMode] = useState("role"); // "role" | "resume"
  const [role, setRole] = useState("AI-ML Engineer");
  const [customRole, setCustomRole] = useState("");
  const [interviewType, setInterviewType] = useState("technical");
  
  // Configuration states
  const [experience, setExperience] = useState("Mid Level");
  const [difficulty, setDifficulty] = useState("Medium");
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState(45);
  
  // Resume upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeId, setResumeId] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadError("");
    setUploadingResume(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authFetch("http://localhost:8000/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setResumeId(data.id || data._id);
        setUploadError("");
      } else {
        const errorData = await response.json();
        setUploadError(errorData.detail || "Failed to upload and parse resume.");
        setResumeId("");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network error uploading resume.");
      setResumeId("");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (prepMode === "resume") {
      if (!selectedFile && !resumeId) {
        setUploadError("Please choose or upload a resume file to proceed with Resume-Based Interview.");
        return;
      }
    }

    const finalRole = prepMode === "role" 
      ? (role === "Other" ? customRole : role) 
      : (selectedFile ? `${selectedFile.name.replace(/\.[^/.]+$/, "")} Profile` : "Resume Based Candidate");

    if (!finalRole && prepMode === "role") return;

    onStartInterview({
      role_target: finalRole,
      interview_type: interviewType,
      experience_level: experience,
      language: language,
      duration: duration,
      difficulty: difficulty,
      resume_id: resumeId || null,
      prep_mode: prepMode
    });
  };

  return (
    <div className="interview-setup-container">
      <div className="interview-setup-header">
        <h2>Configure Your Mock Interview</h2>
        <p>
          Select how you want to prepare: by entering a Target Job Role or uploading your Resume profile.
        </p>

        {/* Prep Mode Tabs */}
        <div className="setup-mode-tabs">
          <button
            type="button"
            className={`setup-mode-tab ${prepMode === "role" ? "active" : ""}`}
            onClick={() => { setPrepMode("role"); setUploadError(""); }}
          >
            <FaBullseye className="tab-icon" />
            <span>1. By Target Job Role</span>
          </button>
          <button
            type="button"
            className={`setup-mode-tab ${prepMode === "resume" ? "active" : ""}`}
            onClick={() => { setPrepMode("resume"); setUploadError(""); }}
          >
            <FaFileAlt className="tab-icon" />
            <span>2. By Resume Upload</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="interview-setup-form">
        {/* MODE 1: Target Job Role Selection */}
        {prepMode === "role" && (
          <>
            <div>
              <label className="interview-setup-label">
                Target Job Role
              </label>
              <div style={{ position: "relative" }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="interview-setup-select"
                >
                  <option value="AI-ML Engineer">AI-ML Engineer</option>
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
                <label className="interview-setup-label">
                  Custom Role Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. iOS Developer, Cybersecurity Engineer"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  required
                  className="interview-setup-input"
                />
              </div>
            )}
          </>
        )}

        {/* MODE 2: Resume Upload Selection */}
        {prepMode === "resume" && (
          <div className="resume-mode-section">
            <label className="interview-setup-label">
              Upload Your Resume (PDF / DOCX / TXT)
            </label>
            <p className="resume-mode-desc">
              Upload your latest resume. Our AI parser will extract your skills, experience, and projects to generate custom, highly-tailored interview questions.
            </p>

            <div className="resume-upload-box">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.json"
                id="resume-file-mode"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label htmlFor="resume-file-mode" className="resume-upload-label-btn large">
                {uploadingResume ? (
                  <>
                    <FaSpinner className="spin" style={{ animation: "spin 1s linear infinite" }} />
                    <span>Uploading & Parsing Resume Skills...</span>
                  </>
                ) : selectedFile ? (
                  <>
                    <FaFileAlt style={{ color: "#10b981", fontSize: "20px" }} />
                    <span>Selected: <strong>{selectedFile.name}</strong></span>
                  </>
                ) : (
                  <>
                    <FaUpload style={{ fontSize: "20px" }} />
                    <span>Click to Browse or Drag & Drop Resume File</span>
                  </>
                )}
              </label>

              {resumeId && (
                <div className="resume-success-banner">
                  ✓ Resume uploaded & parsed successfully! Questions will be tailored to your experience.
                </div>
              )}
              {uploadError && <div className="resume-error-msg">⚠️ {uploadError}</div>}
            </div>
          </div>
        )}

        {/* Interview Category (Common to Both Modes) */}
        <div>
          <label className="interview-setup-label" style={{ marginBottom: "12px" }}>
            Interview Category
          </label>
          <div className="interview-setup-grid">
            {/* Technical Card */}
            <div
              onClick={() => setInterviewType("technical")}
              className={`interview-setup-card ${interviewType === "technical" ? "active" : ""}`}
            >
              <FaNetworkWired className="interview-setup-card-icon" />
              <div className="interview-setup-card-title">Technical</div>
              <div className="interview-setup-card-desc">System, coding & concepts</div>
            </div>

            {/* Behavioral Card */}
            <div
              onClick={() => setInterviewType("behavioral")}
              className={`interview-setup-card ${interviewType === "behavioral" ? "active" : ""}`}
            >
              <FaGraduationCap className="interview-setup-card-icon" />
              <div className="interview-setup-card-title">Behavioral</div>
              <div className="interview-setup-card-desc">STAR method scenarios</div>
            </div>

            {/* HR Card */}
            <div
              onClick={() => setInterviewType("hr")}
              className={`interview-setup-card ${interviewType === "hr" ? "active" : ""}`}
            >
              <FaBriefcase className="interview-setup-card-icon" />
              <div className="interview-setup-card-title">HR & Fit</div>
              <div className="interview-setup-card-desc">Culture & background</div>
            </div>
          </div>
        </div>

        {/* Experience Level & Difficulty Level */}
        <div className="interview-setup-row">
          {prepMode === "role" && (
            <div>
              <label className="interview-setup-label">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="interview-setup-select"
              >
                <option value="Entry Level">Entry Level (0-2 years)</option>
                <option value="Mid Level">Mid Level (2-5 years)</option>
                <option value="Senior Level">Senior Level (5-8 years)</option>
                <option value="Lead / Architect">Lead / Architect (8+ years)</option>
              </select>
            </div>
          )}

          <div style={{ gridColumn: prepMode === "resume" ? "span 2" : "span 1" }}>
            <label className="interview-setup-label">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="interview-setup-select"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Language & Duration */}
        <div className="interview-setup-row">
          <div>
            <label className="interview-setup-label">Interview Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="interview-setup-select"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div>
            <label className="interview-setup-label">Interview Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="interview-setup-select"
            >
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button type="submit" className="interview-setup-btn" disabled={uploadingResume}>
          <FaPlay /> {prepMode === "resume" ? "Start Resume-Based AI Interview" : "Start AI Interview Session"}
        </button>
      </form>
    </div>
  );
};

export default InterviewSetup;
