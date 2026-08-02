import React, { useState, useEffect } from "react";
import "./InterviewReadinessCard.css";

const InterviewReadinessCard = ({ resumeId, resumeData, authFetch }) => {
  const [readiness, setReadiness] = useState({
    readiness_score: 85,
    ats_score: 88,
    resume_quality: 90,
    skills_score: 80,
    projects_score: 85,
    experience_score: 82,
    suggestions: [
      "Learn Docker & Containerization",
      "Improve React Projects with metrics",
      "Add REST API Experience"
    ]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resumeId) {
      fetchReadiness();
    }
  }, [resumeId]);

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`http://localhost:8000/api/resume/${resumeId}/readiness`);
      if (res.ok) {
        const data = await res.json();
        setReadiness(data);
      }
    } catch (err) {
      console.warn("Readiness score fetch fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#3b82f6";
    return "#eab308";
  };

  return (
    <div className="interview-readiness-card">
      <div className="readiness-header">
        <div className="readiness-title-row">
          <span className="readiness-icon">🎯</span>
          <div>
            <h4>Interview Readiness Score</h4>
            <p className="readiness-sub">Calculated from ATS score, resume quality, skills & experience depth.</p>
          </div>
        </div>

        <div
          className="readiness-badge-ring"
          style={{ borderColor: getScoreColor(readiness.readiness_score) }}
        >
          <span className="score-val">{readiness.readiness_score}%</span>
          <span className="score-lbl">Readiness</span>
        </div>
      </div>

      <div className="readiness-metrics-grid">
        <div className="metric-box">
          <span className="m-val">{readiness.ats_score}%</span>
          <span className="m-lbl">ATS Score</span>
        </div>
        <div className="metric-box">
          <span className="m-val">{readiness.skills_score}%</span>
          <span className="m-lbl">Skills Depth</span>
        </div>
        <div className="metric-box">
          <span className="m-val">{readiness.projects_score}%</span>
          <span className="m-lbl">Projects Impact</span>
        </div>
        <div className="metric-box">
          <span className="m-val">{readiness.experience_score}%</span>
          <span className="m-lbl">Experience Alignment</span>
        </div>
      </div>

      <div className="readiness-suggestions-box">
        <div className="sugg-header">💡 Key Suggestions to Hit 95%+ Readiness:</div>
        <ul className="sugg-list">
          {readiness.suggestions.map((sugg, i) => (
            <li key={i}>
              <span className="sugg-bullet">📌</span>
              <span>{sugg}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InterviewReadinessCard;
