import React from "react";
import "./ResumeCompletionTracker.css";

const ResumeCompletionTracker = ({ resumeData }) => {
  if (!resumeData) return null;

  const sections = [
    {
      id: "personal",
      label: "Personal Details",
      isComplete: Boolean(resumeData.personal?.name && resumeData.personal?.email && resumeData.personal?.phone)
    },
    {
      id: "summary",
      label: "Summary",
      isComplete: Boolean(resumeData.summary && resumeData.summary.trim().length > 15)
    },
    {
      id: "skills",
      label: "Skills",
      isComplete: Boolean(resumeData.skills && resumeData.skills.length >= 3)
    },
    {
      id: "experience",
      label: "Experience",
      isComplete: Boolean(resumeData.experience && resumeData.experience.length > 0 && resumeData.experience[0].company)
    },
    {
      id: "projects",
      label: "Projects",
      isComplete: Boolean(resumeData.projects && resumeData.projects.length > 0 && resumeData.projects[0].name)
    },
    {
      id: "education",
      label: "Education",
      isComplete: Boolean(resumeData.education && resumeData.education.length > 0 && resumeData.education[0].institution)
    },
    {
      id: "certifications",
      label: "Certifications",
      isComplete: Boolean(resumeData.certifications && resumeData.certifications.length > 0)
    }
  ];

  const completedCount = sections.filter((s) => s.isComplete).length;
  const percentage = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="resume-completion-tracker-card">
      <div className="tracker-header">
        <div className="tracker-title-group">
          <span className="tracker-icon">⚡</span>
          <h4>Resume Completion Tracker</h4>
        </div>
        <div className="tracker-badge" style={{ background: percentage >= 85 ? "rgba(34, 197, 94, 0.15)" : "rgba(234, 179, 8, 0.15)", color: percentage >= 85 ? "#22c55e" : "#eab308" }}>
          {percentage}% Overall
        </div>
      </div>

      <div className="tracker-progress-bar-bg">
        <div
          className="tracker-progress-bar-fill"
          style={{
            width: `${percentage}%`,
            background: percentage >= 85 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #3b82f6, #6366f1)"
          }}
        />
      </div>

      <div className="tracker-sections-grid">
        {sections.map((sec) => (
          <div key={sec.id} className={`tracker-section-pill ${sec.isComplete ? "complete" : "incomplete"}`}>
            <span className="sec-icon">{sec.isComplete ? "✔" : "✘"}</span>
            <span className="sec-label">{sec.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeCompletionTracker;
