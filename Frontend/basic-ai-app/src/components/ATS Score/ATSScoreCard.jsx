import React from "react";
import "./ATSScoreCard.css";

const ATSScoreCard = ({
  score = 78,
  matchedSkills = [],
  missingSkills = [],
  categoryBreakdown,
  category_breakdown,
  hardSkills,
  softSkills,
  experienceLevel,
  impactQuantification,
  weakKeywordsAudit
}) => {
  const breakdownData = categoryBreakdown || category_breakdown;
  const weakWords = weakKeywordsAudit?.weak_words_found || ["worked on", "responsible for"];

  // Use exact 7-component deterministic category breakdown if available
  const categories = breakdownData ? [
    { name: "Skills Match", value: breakdownData.skills_match.score, max: 25, weight: "25%", color: "#10b981" },
    { name: "Keyword Match", value: breakdownData.keyword_match.score, max: 20, weight: "20%", color: "#6366f1" },
    { name: "Experience Match", value: breakdownData.experience_match.score, max: 15, weight: "15%", color: "#3b82f6" },
    { name: "Projects Match", value: breakdownData.projects_match.score, max: 10, weight: "10%", color: "#8b5cf6" },
    { name: "Education", value: breakdownData.education.score, max: 10, weight: "10%", color: "#ec4899" },
    { name: "Resume Structure", value: breakdownData.resume_structure.score, max: 10, weight: "10%", color: "#f59e0b" },
    { name: "Job Relevance", value: breakdownData.job_relevance.score, max: 10, weight: "10%", color: "#14b8a6" }
  ] : [
    { name: "Skills Match", value: Math.min(25, Math.round((matchedSkills.length / Math.max(1, matchedSkills.length + missingSkills.length)) * 25)), max: 25, weight: "25%", color: "#10b981" },
    { name: "Keyword Match", value: 16, max: 20, weight: "20%", color: "#6366f1" },
    { name: "Experience Match", value: 12, max: 15, weight: "15%", color: "#3b82f6" },
    { name: "Projects Match", value: 8, max: 10, weight: "10%", color: "#8b5cf6" },
    { name: "Education", value: 8, max: 10, weight: "10%", color: "#ec4899" },
    { name: "Resume Structure", value: 8, max: 10, weight: "10%", color: "#f59e0b" },
    { name: "Job Relevance", value: 8, max: 10, weight: "10%", color: "#14b8a6" }
  ];

  const getScoreClass = (val) => {
    if (val >= 85) return "excellent";
    if (val >= 70) return "good";
    return "needs-improvement";
  };

  return (
    <div className="ats-scorecard-container">
      <div className="scorecard-main">
        <div className="radial-score-wrapper">
          <svg className="radial-svg" viewBox="0 0 120 120">
            <circle className="radial-bg" cx="60" cy="60" r="50"></circle>
            <circle
              className={`radial-fill ${getScoreClass(score)}`}
              cx="60"
              cy="60"
              r="50"
              strokeDasharray="314"
              strokeDashoffset={314 - (314 * score) / 100}
            ></circle>
          </svg>
          <div className="radial-content">
            <span className="score-num">{score}%</span>
            <span className="score-label">Deterministic ATS Score</span>
          </div>
        </div>

        <div className="scorecard-summary">
          <span className={`status-pill ${getScoreClass(score)}`}>
            {score >= 85 ? "🎯 High Priority Candidate Fit" : score >= 70 ? "⚡ Competitive Candidate Fit" : "⚠️ Needs Skill Alignment"}
          </span>
          <span className="hf-ai-engine-badge">🛡️ 100% Deterministic Score & AI Explainer</span>
          <h3>Resume Fit is {score >= 75 ? "strongly aligned!" : "partially matching target role."}</h3>
          <p>
            Calculated via a weighted 7-category evaluation matrix. An overall fit above 80% ensures top automated recruiter ranking.
          </p>
        </div>
      </div>

      {/* QUICK AUDIT HIGHLIGHTS PANEL (ATS SCORE, MISSING SKILLS, ERROR KEYWORDS) */}
      <div className="quick-audit-highlights" style={{ marginTop: "1.25rem", paddingTop: "1.25rem", borderTop: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        {/* ATS Score Card */}
        <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)", padding: "16px 20px", borderRadius: "14px", color: "#ffffff", boxShadow: "0 8px 20px rgba(124, 58, 237, 0.25)" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", opacity: 0.9, display: "block", marginBottom: "6px" }}>🎯 Resume ATS Score</span>
          <strong style={{ fontSize: "1.6rem", fontWeight: "800", display: "block" }}>{score} / 100</strong>
          <span style={{ fontSize: "13px", fontWeight: "600", opacity: 0.95, marginTop: "4px", display: "block" }}>
            {score >= 80 ? "✓ High Priority Candidate Fit" : score >= 60 ? "⚡ Moderate Alignment" : "⚠️ Needs Skill Enhancement"}
          </span>
        </div>

        {/* Missing Skills Card */}
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "16px 20px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(245, 158, 11, 0.05)" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: "#b45309", display: "block", marginBottom: "8px" }}>⚠️ Missing Skills ({missingSkills.length})</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {missingSkills.length > 0 ? (
              missingSkills.slice(0, 5).map((sk, idx) => (
                <span key={idx} style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                  {sk}
                </span>
              ))
            ) : (
              <span style={{ color: "#059669", fontSize: "13px", fontWeight: "600" }}>✓ Zero missing critical skills!</span>
            )}
          </div>
        </div>

        {/* Error / Weak Keywords Card */}
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", padding: "16px 20px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.05)" }}>
          <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700", color: "#b91c1c", display: "block", marginBottom: "8px" }}>🚨 Error / Weak Keywords ({weakWords.length})</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {weakWords.map((word, idx) => (
              <span key={idx} style={{ background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca", padding: "3px 10px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                "{word}"
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="score-breakdown" style={{ marginTop: "1.5rem" }}>
        <h4 style={{ fontSize: "1.1rem", color: "#1e293b", marginBottom: "1rem", fontWeight: "700" }}>7-Component Deterministic Match Breakdown (100% Total)</h4>
        <div className="breakdown-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {categories.map((cat, idx) => {
            const pct = Math.round((cat.value / cat.max) * 100);
            return (
              <div key={idx} className="breakdown-item" style={{ background: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div className="breakdown-info" style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#334155" }}>{cat.name} ({cat.weight})</span>
                  <strong style={{ fontSize: "13px", color: cat.color }}>{cat.value} / {cat.max}</strong>
                </div>
                <div className="breakdown-bar-bg" style={{ height: "7px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
                  <div 
                    className="breakdown-bar-fill" 
                    style={{ width: `${pct}%`, backgroundColor: cat.color, height: "100%", transition: "width 0.5s ease" }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ATSScoreCard;
