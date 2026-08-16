import React, { useState, useEffect, useCallback } from "react";
import "./InterviewReadinessCard.css";

// Computes a local readiness estimate from the resumeData prop.
// Used when: no resumeId yet, or the backend API is unavailable.
const computeLocalReadiness = (resumeData) => {
  if (!resumeData) {
    return {
      readiness_score: 0,
      ats_score: 0,
      resume_quality: 0,
      skills_score: 0,
      projects_score: 0,
      experience_score: 0,
      suggestions: ["Start building your resume to see your readiness score"],
    };
  }

  const personal = resumeData.personal || {};
  const personalFields = [personal.name, personal.email, personal.phone, personal.linkedin, personal.role];
  const personalFilled = personalFields.filter((f) => f && String(f).trim()).length;
  const personalScore = Math.round((personalFilled / 5) * 100);

  const summary = resumeData.summary || "";
  const summaryScore = summary.length >= 120 ? 100 : summary.length >= 60 ? 75 : summary.length > 0 ? 45 : 0;

  const skills = resumeData.skills || [];
  const skillsScore = skills.length >= 10 ? 100 : skills.length >= 6 ? 75 : skills.length >= 3 ? 50 : 20;

  const experience = resumeData.experience || [];
  let expScore = 0;
  for (const exp of experience) {
    if (exp.company && exp.role) expScore += 40;
    if (exp.details && String(exp.details).length >= 80) expScore += 20;
  }
  const experienceScore = Math.min(100, experience.length > 0 ? expScore : 0);

  const projects = resumeData.projects || [];
  let projScore = 0;
  for (const proj of projects) {
    if (proj.name) projScore += 35;
    if (proj.description && String(proj.description).length >= 60) projScore += 25;
  }
  const projectsScore = Math.min(100, projects.length > 0 ? projScore : 0);

  const resumeQuality = Math.round(
    personalScore * 0.15 +
    summaryScore * 0.20 +
    skillsScore * 0.20 +
    experienceScore * 0.30 +
    projectsScore * 0.15
  );

  // Local mode: no interview/coding data — use resume signals only
  const readinessScore = Math.min(98, Math.max(10, Math.round(
    resumeQuality * 0.45 +
    skillsScore * 0.30 +
    personalScore * 0.25
  )));

  // Generate targeted suggestions
  const suggestions = [];
  if (personalScore < 100) suggestions.push("Complete all personal info fields (LinkedIn, phone, role title)");
  if (summaryScore < 75) suggestions.push("Write a compelling professional summary (aim for 120+ characters with metrics)");
  if (skillsScore < 75) suggestions.push(`Add more skills — you have ${skills.length}, aim for 10+ relevant technical skills`);
  if (experienceScore < 60) suggestions.push("Add quantified bullet points to experience (e.g., 'Reduced load time by 40%')");
  if (projectsScore < 60) suggestions.push("Add 2+ projects with clear impact descriptions and tech stacks");

  return {
    readiness_score: readinessScore,
    ats_score: resumeQuality,      // best local proxy for ATS without a JD
    resume_quality: resumeQuality,
    skills_score: skillsScore,
    projects_score: projectsScore,
    experience_score: experienceScore,
    suggestions: suggestions.slice(0, 3),
  };
};

const InterviewReadinessCard = ({ resumeId, resumeData, authFetch }) => {
  const [readiness, setReadiness] = useState(() => computeLocalReadiness(resumeData));
  const [loading, setLoading] = useState(false);

  // Recompute local scores whenever resumeData changes (user is editing their resume)
  useEffect(() => {
    const local = computeLocalReadiness(resumeData);
    setReadiness((prev) => {
      // Only override with local data if we don't have a fresher API response
      // (detected by checking if previous readiness_score is from API — i.e. non-zero ats_score from DB)
      if (!prev._fromApi) return local;
      return prev;
    });
  }, [resumeData]);

  const fetchReadiness = useCallback(async () => {
    if (!resumeId || !authFetch) return;
    setLoading(true);
    try {
      const res = await authFetch(`http://localhost:8000/api/resume/${resumeId}/readiness`);
      if (res.ok) {
        const data = await res.json();
        setReadiness({ ...data, _fromApi: true });
      }
    } catch (err) {
      console.warn("Readiness API unavailable, using local calculation:", err);
    } finally {
      setLoading(false);
    }
  }, [resumeId, authFetch]);

  // Fetch from backend whenever resumeId becomes available
  useEffect(() => {
    if (resumeId) {
      fetchReadiness();
    }
  }, [resumeId, fetchReadiness]);

  const getScoreColor = (score) => {
    if (score >= 85) return "#22c55e";
    if (score >= 70) return "#3b82f6";
    if (score >= 50) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="interview-readiness-card">
      <div className="readiness-header">
        <div className="readiness-title-row">
          <span className="readiness-icon">🎯</span>
          <div>
            <h4>Interview Readiness Score</h4>
            <p className="readiness-sub">
              {resumeId
                ? "Calculated from ATS score, resume quality, skills, interview & coding performance."
                : "Based on your current resume content. Take a Mock Interview to improve accuracy."}
            </p>
          </div>
        </div>

        <div
          className="readiness-badge-ring"
          style={{ borderColor: getScoreColor(readiness.readiness_score) }}
        >
          {loading ? (
            <span className="score-val" style={{ fontSize: "1rem" }}>…</span>
          ) : (
            <>
              <span className="score-val">{readiness.readiness_score}%</span>
              <span className="score-lbl">{getScoreLabel(readiness.readiness_score)}</span>
            </>
          )}
        </div>
      </div>

      <div className="readiness-metrics-grid">
        <div className="metric-box">
          <span className="m-val" style={{ color: getScoreColor(readiness.ats_score) }}>
            {readiness.ats_score}%
          </span>
          <span className="m-lbl">ATS Score</span>
        </div>
        <div className="metric-box">
          <span className="m-val" style={{ color: getScoreColor(readiness.skills_score) }}>
            {readiness.skills_score}%
          </span>
          <span className="m-lbl">Skills Depth</span>
        </div>
        <div className="metric-box">
          <span className="m-val" style={{ color: getScoreColor(readiness.projects_score) }}>
            {readiness.projects_score}%
          </span>
          <span className="m-lbl">Projects Impact</span>
        </div>
        <div className="metric-box">
          <span className="m-val" style={{ color: getScoreColor(readiness.experience_score) }}>
            {readiness.experience_score}%
          </span>
          <span className="m-lbl">Experience Depth</span>
        </div>
      </div>

      <div className="readiness-suggestions-box">
        <div className="sugg-header">💡 Key Suggestions to Hit 95%+ Readiness:</div>
        <ul className="sugg-list">
          {(readiness.suggestions || []).map((sugg, i) => (
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
