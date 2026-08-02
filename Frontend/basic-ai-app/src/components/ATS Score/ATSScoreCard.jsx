import React from "react";
import "./ATSScoreCard.css";

const ATSScoreCard = ({ score = 78, matchedSkills = [], missingSkills = [], hardSkills, softSkills, experienceLevel, impactQuantification }) => {
  const matchedCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  const totalKeywords = matchedCount + missingCount;
  const keywordScore = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 75;

  const hardScore = hardSkills?.score ?? keywordScore;
  const softScore = softSkills?.score ?? 82;
  const expScore = experienceLevel?.score ?? 85;
  const impactScore = impactQuantification?.score ?? 70;

  const categories = [
    { name: "Technical / Hard Skills", value: hardScore, color: hardScore >= 80 ? "#10b981" : hardScore >= 60 ? "#6366f1" : "#f59e0b" },
    { name: "Soft Skills & Leadership", value: softScore, color: softScore >= 80 ? "#10b981" : softScore >= 60 ? "#8b5cf6" : "#f59e0b" },
    { name: "Experience & Role Fit", value: expScore, color: expScore >= 80 ? "#10b981" : expScore >= 60 ? "#3b82f6" : "#f59e0b" },
    { name: "Impact Metrics & Action Terms", value: impactScore, color: impactScore >= 80 ? "#10b981" : impactScore >= 60 ? "#ec4899" : "#ef4444" }
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
            <span className="score-label">Overall Match Fit</span>
          </div>
        </div>

        <div className="scorecard-summary">
          <span className={`status-pill ${getScoreClass(score)}`}>
            {score >= 85 ? "🎯 High Priority Candidate Fit" : score >= 70 ? "⚡ Competitive Candidate Fit" : "⚠️ Needs Skill Alignment"}
          </span>
          <span className="hf-ai-engine-badge">🤗 Hugging Face & Gemini AI Analysis</span>
          <h3>Resume Fit is {score >= 75 ? "strongly aligned!" : "partially matching target role."}</h3>
          <p>
            An overall fit above 80% ensures your resume triggers top automated recruiter ranking filters.
          </p>
        </div>
      </div>

      <div className="score-breakdown">
        <h4>Multi-Dimensional Match Matrix</h4>
        <div className="breakdown-grid">
          {categories.map((cat, idx) => (
            <div key={idx} className="breakdown-item">
              <div className="breakdown-info">
                <span>{cat.name}</span>
                <strong>{cat.value}%</strong>
              </div>
              <div className="breakdown-bar-bg">
                <div 
                  className="breakdown-bar-fill" 
                  style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATSScoreCard;

