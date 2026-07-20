import React from "react";
import "./ATSScoreCard.css";

const ATSScoreCard = ({ score = 78, matchedSkills = [], missingSkills = [] }) => {
  const matchedCount = matchedSkills.length;
  const missingCount = missingSkills.length;
  const totalKeywords = matchedCount + missingCount;
  const keywordScore = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 65;

  const categories = [
    { name: "Keyword Match", value: keywordScore, color: keywordScore >= 80 ? "#10b981" : keywordScore >= 60 ? "#3b82f6" : "#f59e0b" },
    { name: "Formatting & Layout", value: 92, color: "#10b981" },
    { name: "Section Headings", value: 85, color: "#10b981" },
    { name: "Content Quality", value: score, color: score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : "#f59e0b" }
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
            <span className="score-label">Overall Score</span>
          </div>
        </div>

        <div className="scorecard-summary">
          <span className={`status-pill ${getScoreClass(score)}`}>
            {score >= 85 ? "Excellent Match" : score >= 70 ? "Good Match" : "Weak Match"}
          </span>
          <h3>Your Resume is {score >= 70 ? "almost ready!" : "needing optimization."}</h3>
          <p>
            An overall score above 80% significantly increases your chances of passing automated recruitment filters.
          </p>
        </div>
      </div>

      <div className="score-breakdown">
        <h4>Score Breakdown</h4>
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
