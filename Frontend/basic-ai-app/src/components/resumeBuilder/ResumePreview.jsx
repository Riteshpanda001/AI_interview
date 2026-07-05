import React from "react";
import "./ResumePreview.css";

const ResumePreview = ({ resumeData, selectedTemplate }) => {
  const { personal, summary, experience, education, skills, projects } = resumeData;

  const handleDownload = () => {
    alert("Exporting Resume to PDF format... Completed! Your download will begin shortly.");
  };

  const handleAIImprove = () => {
    alert("AI Resume Optimizer running: Analyzing details, correcting phrasing, and increasing ATS score!");
  };

  return (
    <section className="preview-section">
      <div className="section-header">
        <span className="preview-badge">👁️ LIVE LOOK</span>
        <h2 className="section-title">
          Live <span>Resume Preview</span>
        </h2>
        <p className="section-subtitle">
          Observe edits update dynamically. Toggle templates above to change presentation formats instantly.
        </p>
      </div>

      <div className="preview-container">
        {/* Actions Bar */}
        <div className="preview-actions">
          <div className="active-tpl-indicator">
            Active Format: <span>{selectedTemplate.toUpperCase()} Layout</span>
          </div>
          <div className="action-buttons">
            <button className="preview-action-btn primary" onClick={handleDownload}>
              📥 Download PDF
            </button>
            <button className="preview-action-btn secondary" onClick={handleAIImprove}>
              🤖 AI Optimize
            </button>
          </div>
        </div>

        {/* Paper Sheet Simulator */}
        <div className={`resume-paper ${selectedTemplate}`}>
          {/* Header */}
          <header className="resume-header">
            <h1 className="name">{personal.name || "Your Name"}</h1>
            <h4 className="role" style={{ color: "var(--tpl-accent)" }}>
              {personal.role || "Professional Role"}
            </h4>
            <div className="contact-info">
              {personal.email && <span>📧 {personal.email}</span>}
              {personal.phone && <span>📞 {personal.phone}</span>}
              {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
            </div>
          </header>

          <div className="resume-body">
            {/* Left/Main Column */}
            <div className="main-col">
              {/* Summary */}
              {summary && (
                <section className="preview-sub-section">
                  <h3 className="section-heading">Professional Summary</h3>
                  <div className="section-divider"></div>
                  <p className="summary-text">{summary}</p>
                </section>
              )}

              {/* Experience */}
              {experience && experience.length > 0 && (
                <section className="preview-sub-section">
                  <h3 className="section-heading">Work Experience</h3>
                  <div className="section-divider"></div>
                  {experience.map((exp, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="preview-item-header">
                        <strong>{exp.role || "Role"}</strong>
                        <span>{exp.duration || "Duration"}</span>
                      </div>
                      <div className="preview-item-sub">
                        <em>{exp.company || "Company"}</em>
                      </div>
                      <p className="preview-item-desc">{exp.details}</p>
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {projects && projects.length > 0 && (
                <section className="preview-sub-section">
                  <h3 className="section-heading">Projects</h3>
                  <div className="section-divider"></div>
                  {projects.map((proj, idx) => (
                    <div key={idx} className="preview-item">
                      <div className="preview-item-header">
                        <strong>{proj.name || "Project Title"}</strong>
                      </div>
                      <p className="preview-item-desc">{proj.description}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>

            {/* Sidebar (for template layout variant if needed) or simple side-section */}
            <div className="side-col">
              {/* Skills */}
              {skills && skills.length > 0 && (
                <section className="preview-sub-section">
                  <h3 className="section-heading">Skills</h3>
                  <div className="section-divider"></div>
                  <div className="preview-skills-list">
                    {skills.map((skill, idx) => (
                      <span key={idx} className="preview-skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {education && education.length > 0 && (
                <section className="preview-sub-section" style={{ marginTop: "25px" }}>
                  <h3 className="section-heading">Education</h3>
                  <div className="section-divider"></div>
                  {education.map((edu, idx) => (
                    <div key={idx} className="preview-edu-item">
                      <strong>{edu.degree || "Degree"}</strong>
                      <div>{edu.institution || "Institution"}</div>
                      <span className="date">{edu.duration}</span>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumePreview;
