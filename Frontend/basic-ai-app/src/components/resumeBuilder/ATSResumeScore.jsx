import React from "react";
import "./ATSResumeScore.css";

const ATSResumeScore = ({ resumeData }) => {
  const defaultKeywords = ["AWS", "Docker", "Kubernetes", "CI/CD", "TypeScript", "GraphQL"];
  const lowercaseSkills = (resumeData.skills || []).map((s) => s.toLowerCase());

  const missingKeywords = defaultKeywords.filter((kw) => !lowercaseSkills.includes(kw.toLowerCase()));

  // Calculate score: base score of 70 + percentage of keywords present
  const keywordsCount = defaultKeywords.length;
  const presentKeywordsCount = keywordsCount - missingKeywords.length;
  const atsScore = Math.min(
    100,
    70 + Math.round((presentKeywordsCount / keywordsCount) * 30)
  );

  return (
    <section className="ats-score-section">
      <div className="section-header">
        <span className="ats-score-badge">📊 ATS METRICS</span>
        <h2 className="section-title">
          Real-Time <span>ATS Scanner</span>
        </h2>
        <p className="section-subtitle">
          Ensure your resume passes automatic parsers. See how your keywords align with top industry requirements.
        </p>
      </div>

      <div className="ats-score-container">
        {/* Left Side: Score Circle */}
        <div className="ats-card score-gauge-card">
          <h3>ATS Score Dial</h3>
          <div className="gauge-outer">
            <svg viewBox="0 0 100 100">
              <circle className="gauge-bg" cx="50" cy="50" r="45"></circle>
              <circle
                className="gauge-fill"
                cx="50"
                cy="50"
                r="45"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * atsScore) / 100}
                style={{
                  stroke: atsScore > 85 ? "#10b981" : atsScore > 75 ? "#7c3aed" : "#f59e0b"
                }}
              ></circle>
            </svg>
            <div className="gauge-text">
              <h2>{atsScore}%</h2>
              <span>{atsScore > 85 ? "Excellent" : atsScore > 75 ? "Good" : "Needs Review"}</span>
            </div>
          </div>
          <p className="gauge-summary">
            A score above 80% is recommended for competitive roles in Tech.
          </p>
        </div>

        {/* Right Side: Critical Missing Details */}
        <div className="ats-card keyword-feedback-card">
          <div className="feedback-block">
            <h4>Missing Critical Keywords</h4>
            {missingKeywords.length === 0 ? (
              <p className="success-msg">✓ Excellent! All critical industry keywords detected.</p>
            ) : (
              <div className="kw-tags-grid">
                {missingKeywords.map((kw) => (
                  <span key={kw} className="kw-tag missing">
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="feedback-block" style={{ marginTop: "30px" }}>
            <h4>Resume Scanner Checklist</h4>
            <ul className="checklist">
              <li className={resumeData.summary.length > 50 ? "checked" : ""}>
                <span className="chk-icon"></span> Professional Summary Present
              </li>
              <li className={resumeData.experience.length > 0 ? "checked" : ""}>
                <span className="chk-icon"></span> Structured Work History
              </li>
              <li className={resumeData.skills.length > 5 ? "checked" : ""}>
                <span className="chk-icon"></span> Skill Grid Optimization (5+ skills)
              </li>
              <li className="checked">
                <span className="chk-icon"></span> PDF-Friendly Parsing Format
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ATSResumeScore;
