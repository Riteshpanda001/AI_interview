import React, { useState } from "react";
import "./KeywordAnalysis.css";

const KeywordAnalysis = ({ matchedSkills = [], missingSkills = [], hardSkills, softSkills, weakKeywordsAudit, onInjectSkill }) => {
  const [injectedSet, setInjectedSet] = useState(new Set());

  const criticalMissing = hardSkills?.missing_critical || missingSkills.slice(0, Math.ceil(missingSkills.length / 2));
  const optionalMissing = hardSkills?.missing_optional || missingSkills.slice(Math.ceil(missingSkills.length / 2));

  const weakWords = weakKeywordsAudit?.weak_words_found || ["worked on", "responsible for"];
  const powerVerbs = weakKeywordsAudit?.suggested_power_verbs || ["Architected", "Spearheaded", "Engineered", "Orchestrated", "Accelerated", "Delivered"];

  const handleInject = (skillName) => {
    setInjectedSet(prev => new Set(prev).add(skillName));
    if (onInjectSkill) {
      onInjectSkill(skillName);
    }
  };

  return (
    <div className="keyword-analysis-container">
      <div className="section-title">
        <h2>🔍 Skill & Keyword Alignment Matrix</h2>
        <p>Real-time breakdown of matched terms, missing critical skills, and weak word replacements.</p>
      </div>

      <div className="keywords-grid">
        <div className="keyword-card matches">
          <h3>✅ Matched Technical & Soft Skills ({matchedSkills.length})</h3>
          <div className="keyword-tags">
            {matchedSkills.map((skill, i) => (
              <div key={i} className="keyword-tag match">
                <span className="word">{skill}</span>
                <span className="count">Found</span>
              </div>
            ))}
          </div>
        </div>

        <div className="keyword-card missing">
          <h3>⚠️ Missing Critical Skills ({criticalMissing.length})</h3>
          <div className="keyword-tags">
            {criticalMissing.map((skill, i) => (
              <div key={i} className={`keyword-tag miss critical ${injectedSet.has(skill) ? 'injected' : ''}`}>
                <span className="word">{skill}</span>
                <button 
                  className="inject-btn" 
                  onClick={() => handleInject(skill)}
                  disabled={injectedSet.has(skill)}
                >
                  {injectedSet.has(skill) ? "✓ Added" : "+ Inject Skill"}
                </button>
              </div>
            ))}
          </div>

          {optionalMissing.length > 0 && (
            <>
              <h4 className="optional-title">💡 Secondary / Bonus Keywords ({optionalMissing.length})</h4>
              <div className="keyword-tags">
                {optionalMissing.map((skill, i) => (
                  <div key={i} className={`keyword-tag miss optional ${injectedSet.has(skill) ? 'injected' : ''}`}>
                    <span className="word">{skill}</span>
                    <button 
                      className="inject-btn" 
                      onClick={() => handleInject(skill)}
                      disabled={injectedSet.has(skill)}
                    >
                      {injectedSet.has(skill) ? "✓ Added" : "+ Inject"}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weak Keywords & Action Verbs Audit */}
      <div className="keyword-card weak-audit-card" style={{ marginTop: "1.5rem" }}>
        <h3>🚨 Weak / Passive Verbs Audit</h3>
        <p className="section-subtext" style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
          ATS algorithms downgrade resumes containing passive verbs. Replace weak verbs with high-impact power verbs.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", padding: "1rem" }}>
            <h4 style={{ color: "#ef4444", margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>⚠️ Passive / Weak Verbs Flagged ({weakWords.length})</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {weakWords.map((word, idx) => (
                <span key={idx} style={{ background: "#fee2e2", color: "#991b1b", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "600" }}>
                  "{word}"
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", padding: "1rem" }}>
            <h4 style={{ color: "#10b981", margin: "0 0 0.5rem 0", fontSize: "0.95rem" }}>⚡ High-Impact Replacement Verbs</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {powerVerbs.map((verb, idx) => (
                <span key={idx} style={{ background: "#d1fae5", color: "#065f46", padding: "0.25rem 0.6rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "600" }}>
                  +{verb}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;

