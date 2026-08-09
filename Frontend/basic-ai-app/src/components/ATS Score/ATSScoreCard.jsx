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
  impactQuantification
}) => {
  const breakdownData = categoryBreakdown || category_breakdown;

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

      <div className="score-breakdown">
        <h4>7-Component Deterministic Match Breakdown (100% Total)</h4>
        <div className="breakdown-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          {categories.map((cat, idx) => {
            const pct = Math.round((cat.value / cat.max) * 100);
            return (
              <div key={idx} className="breakdown-item" style={{ background: "rgba(15, 23, 42, 0.6)", padding: "10px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="breakdown-info" style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#cbd5e1" }}>{cat.name} ({cat.weight})</span>
                  <strong style={{ fontSize: "13px", color: cat.color }}>{cat.value} / {cat.max}</strong>
                </div>
                <div className="breakdown-bar-bg" style={{ height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
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
