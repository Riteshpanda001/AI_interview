import React from "react";
import "./BeforeAfterComparisonModal.css";

const BeforeAfterComparisonModal = ({
  isOpen,
  onClose,
  originalData,
  polishedData,
  onAcceptPolished,
  title = "AI Polish: Before & After Comparison",
  factualValidation = null
}) => {
  if (!isOpen || (!polishedData && !originalData)) return null;

  return (
    <div className="diff-modal-overlay" onClick={onClose}>
      <div className="diff-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="diff-modal-header">
          <div className="diff-title-row">
            <span className="diff-icon">⚡</span>
            <h3>{title}</h3>
          </div>
          <button className="diff-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="diff-modal-body">
          {factualValidation && (
            <div className={`factual-banner ${factualValidation.is_consistent ? "consistent" : "warning"}`} style={{
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: factualValidation.is_consistent ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: factualValidation.is_consistent ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              color: factualValidation.is_consistent ? "#10b981" : "#ef4444"
            }}>
              <div>
                <strong>🛡️ AI Factual Consistency Score: {factualValidation.trust_score}%</strong>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", opacity: 0.9 }}>
                  {factualValidation.is_consistent ? "Verified: No timeline contradictions or metric inflations detected." : "Warning: Inconsistencies detected in AI generated claims."}
                </p>
              </div>
              {factualValidation.flags && factualValidation.flags.length > 0 && (
                <div style={{ fontSize: "12px", textAlign: "right" }}>
                  ⚠️ {factualValidation.flags.length} Flagged Item(s)
                </div>
              )}
            </div>
          )}

          <p className="diff-subtitle">
            Review the side-by-side enhancements made by the AI Engine before updating your active resume data.
          </p>

          <div className="diff-columns-grid">
            {/* Column 1: Before / Original */}
            <div className="diff-column original">
              <div className="diff-col-header">
                <span className="badge original-badge">Before (Original)</span>
              </div>
              <div className="diff-col-content">
                <div className="diff-section">
                  <div className="diff-section-title">Professional Summary</div>
                  <p className="diff-text">{originalData?.summary || "No summary provided."}</p>
                </div>

                <div className="diff-section">
                  <div className="diff-section-title">Experience Bullet Points</div>
                  {originalData?.experience && originalData.experience.length > 0 ? (
                    originalData.experience.map((exp, i) => (
                      <div key={i} className="diff-exp-box">
                        <strong>{exp.role || "Role"} at {exp.company || "Company"}</strong>
                        <p className="diff-text">{exp.details || "No details"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="diff-text">No work experience listed.</p>
                  )}
                </div>

                <div className="diff-section">
                  <div className="diff-section-title">Technical Skills</div>
                  <div className="diff-tags">
                    {(originalData?.skills || []).map((s, i) => (
                      <span key={i} className="diff-tag old-tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: After / Polished */}
            <div className="diff-column polished">
              <div className="diff-col-header">
                <span className="badge polished-badge">✨ After (Enhanced)</span>
              </div>
              <div className="diff-col-content">
                <div className="diff-section">
                  <div className="diff-section-title">Enhanced Summary (ATS Optimized)</div>
                  <p className="diff-text highlight-new">{polishedData?.summary || "Enhanced summary."}</p>
                </div>

                <div className="diff-section">
                  <div className="diff-section-title">Rewritten Experience (Action Verbs + Metrics)</div>
                  {polishedData?.experience && polishedData.experience.length > 0 ? (
                    polishedData.experience.map((exp, i) => (
                      <div key={i} className="diff-exp-box highlight-exp">
                        <strong>{exp.role || "Role"} at {exp.company || "Company"}</strong>
                        <p className="diff-text">{exp.details || "Details"}</p>
                      </div>
                    ))
                  ) : (
                    <p className="diff-text">No experience generated.</p>
                  )}
                </div>

                <div className="diff-section">
                  <div className="diff-section-title">Expanded Skill Set</div>
                  <div className="diff-tags">
                    {(polishedData?.skills || []).map((s, i) => (
                      <span key={i} className="diff-tag new-tag">+ {s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="diff-actions-footer">
            <button className="diff-cancel-btn" onClick={onClose}>
              Keep Original
            </button>
            {onAcceptPolished && (
              <button
                className="diff-accept-btn"
                onClick={() => {
                  onAcceptPolished(polishedData);
                  onClose();
                }}
              >
                Apply Polished Version ✔
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterComparisonModal;
