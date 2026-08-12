import React, { useState, useEffect } from "react";
import "./ATSSuggestions.css";

const ATSSuggestions = ({ recommendations = [], detailedFeedback = "", tailoredBulletSuggestions = [], optimizedSummary = "", tailoredProjects = [] }) => {
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedProjectIdx, setCopiedProjectIdx] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (recommendations.length > 0) {
      setSuggestions(
        recommendations.map((rec, idx) => {
          let title = rec;
          let desc = "Follow this AI recommendation to enhance your ATS score and compatibility.";
          
          if (rec.includes(":")) {
            const parts = rec.split(":");
            title = parts[0].trim();
            desc = parts.slice(1).join(":").trim();
          }

          let before = "Created basic API endpoints and worked on databases.";
          let after = "Architected high-performance REST APIs, optimizing database query response times by 35%.";
          
          if (title.toLowerCase().includes("docker") || title.toLowerCase().includes("container")) {
            before = "Ran the application locally using simple scripts.";
            after = "Containerized application workflows using Docker, ensuring consistent multi-environment deployment.";
          } else if (title.toLowerCase().includes("aws") || title.toLowerCase().includes("cloud")) {
            before = "Deployed codebase to local server settings.";
            after = "Leveraged AWS cloud infrastructure (S3, EC2) to scale storage and server capacity dynamically.";
          } else if (title.toLowerCase().includes("testing") || title.toLowerCase().includes("jest")) {
            before = "Tested the features manually by clicking around.";
            after = "Implemented comprehensive unit testing using Jest/React Testing Library, raising test coverage to 85%.";
          }

          return {
            id: idx + 1,
            title,
            impact: idx === 0 ? "High" : "Medium",
            desc,
            before,
            after,
            expanded: idx === 0
          };
        })
      );
    } else {
      setSuggestions([]);
    }
  }, [recommendations]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopySummary = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyProject = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedProjectIdx(idx);
    setTimeout(() => setCopiedProjectIdx(null), 2000);
  };

  const toggleExpand = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  return (
    <div className="ats-suggestions-container">
      <div className="suggestions-header">
        <h2>⚡ AI Resume Rewrites & Recommendations</h2>
        <p>Intelligent summary optimization, project rewrites, and keyword alignment suggestions.</p>
        {detailedFeedback && (
          <div className="feedback-overview-box">
            <h4>💡 AI Recruiter Fit Diagnosis</h4>
            <p>{detailedFeedback}</p>
          </div>
        )}
      </div>

      {/* AI OPTIMIZED PROFESSIONAL SUMMARY */}
      {optimizedSummary && (
        <div className="optimized-summary-card" style={{ background: "linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(168, 85, 247, 0.05) 100%)", border: "1px solid rgba(124, 58, 237, 0.25)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h3 style={{ color: "#7c3aed", margin: 0, fontSize: "1.1rem" }}>🌟 AI-Optimized Professional Summary</h3>
            <button
              onClick={() => handleCopySummary(optimizedSummary)}
              style={{ padding: "0.4rem 0.85rem", borderRadius: "8px", border: "none", background: "#7c3aed", color: "#fff", fontWeight: "600", fontSize: "0.85rem", cursor: "pointer" }}
            >
              {copiedSummary ? "✓ Copied!" : "📋 Copy Optimized Summary"}
            </button>
          </div>
          <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
            "{optimizedSummary}"
          </p>
        </div>
      )}

      {/* AI PERFECTED PROJECT DESCRIPTIONS (STAR FRAMEWORK) */}
      {tailoredProjects && tailoredProjects.length > 0 && (
        <div className="tailored-projects-section" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", color: "#1e293b", marginBottom: "0.75rem" }}>🚀 AI-Perfected Project Descriptions (STAR Method)</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {tailoredProjects.map((p, idx) => (
              <div key={idx} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "1.25rem", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <h4 style={{ color: "#0f172a", margin: 0, fontSize: "1rem" }}>📌 {p.name}</h4>
                  <button
                    onClick={() => handleCopyProject(p.optimized_star_description, idx)}
                    style={{ padding: "0.35rem 0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontWeight: "600", fontSize: "0.8rem", cursor: "pointer" }}
                  >
                    {copiedProjectIdx === idx ? "✓ Copied!" : "📋 Copy Project Description"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                  {p.original_description && (
                    <div style={{ background: "#f1f5f9", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem" }}>
                      <span style={{ color: "#64748b", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>Original Description:</span>
                      <p style={{ margin: 0, color: "#475569" }}>"{p.original_description}"</p>
                    </div>
                  )}

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.75rem", borderRadius: "8px", fontSize: "0.88rem" }}>
                    <span style={{ color: "#16a34a", fontWeight: "700", display: "block", marginBottom: "0.25rem" }}>✨ AI Optimized (STAR & High Impact Metrics):</span>
                    <p style={{ margin: 0, color: "#166534", fontWeight: "500" }}>"{p.optimized_star_description}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tailored Bullets Section */}
      {tailoredBulletSuggestions && tailoredBulletSuggestions.length > 0 && (
        <div className="tailored-bullets-section">
          <h3>✨ Recommended Bullet Point Rewrites</h3>
          <div className="bullets-grid">
            {tailoredBulletSuggestions.map((b, i) => (
              <div key={i} className="bullet-rewrite-card">
                <div className="bullet-target-tag">🎯 Keyword: {b.target_keyword}</div>
                <div className="bullet-comparison">
                  <div className="bullet-before">
                    <span className="bullet-label original">Original Bullet</span>
                    <p>"{b.original}"</p>
                  </div>
                  <div className="bullet-after">
                    <span className="bullet-label AI">AI Tailored Bullet</span>
                    <p>"{b.tailored}"</p>
                  </div>
                </div>
                <div className="bullet-card-actions">
                  <button 
                    className="copy-bullet-btn"
                    onClick={() => handleCopy(b.tailored, i)}
                  >
                    {copiedIdx === i ? "✓ Copied!" : "📋 Copy Tailored Bullet"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Recommendations */}
      <div className="suggestions-list">
        <h3>📌 Actionable Recommendations</h3>
        {suggestions.map((s) => (
          <div key={s.id} className={`suggestion-card ${s.expanded ? "expanded" : ""}`}>
            <div className="card-top" onClick={() => toggleExpand(s.id)}>
              <div className="title-area">
                <span className={`impact-indicator ${s.impact.toLowerCase()}`}>
                  {s.impact} Impact
                </span>
                <h3>{s.title}</h3>
              </div>
              <span className="arrow-icon">{s.expanded ? "▲" : "▼"}</span>
            </div>

            {s.expanded && (
              <div className="card-details">
                <p className="description">{s.desc}</p>
                
                <div className="comparison-box">
                  <div className="comparison-col before">
                    <span>❌ Original / Standard Example</span>
                    <p>"{s.before}"</p>
                  </div>
                  <div className="comparison-col after">
                    <span>✨ Suggested / Optimized Example</span>
                    <p>"{s.after}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSSuggestions;

