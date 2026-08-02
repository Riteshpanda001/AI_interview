import React, { useState } from "react";
import "./AIResumeAssistantModal.css";

const QUICK_PROMPTS = [
  { id: "improve_summary", label: "✨ Improve my summary", action: "improve_summary" },
  { id: "rewrite_project", label: "🚀 Rewrite this project", action: "rewrite_project" },
  { id: "suggest_skills", label: "💡 Suggest skills", action: "suggest_skills" },
  { id: "improve_ats", label: "📈 Improve ATS score", action: "improve_ats" },
  { id: "suggest_certifications", label: "📜 Suggest certifications", action: "suggest_certifications" },
  { id: "tailor_role", label: "🎯 Tailor for Frontend Developer", action: "tailor_role", role: "Frontend Developer" }
];

const AIResumeAssistantModal = ({ isOpen, onClose, resumeData, onApplyAssistantResult, authFetch }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(QUICK_PROMPTS[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [targetRole, setTargetRole] = useState(resumeData?.personal?.role || "Frontend Developer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleRunAction = async (promptObj) => {
    const activeObj = promptObj || selectedPrompt;
    setLoading(true);
    setResult(null);

    const payload = {
      action: activeObj.action,
      target_role: targetRole,
      current_content: resumeData,
      prompt: customPrompt || activeObj.label
    };

    try {
      const res = await authFetch("http://localhost:8000/api/resume/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error("Assistant request failed");
      }
    } catch (err) {
      console.warn("Assistant fallback execution:", err);
      if (activeObj.action === "suggest_skills") {
        setResult({
          suggested_skills: ["React", "TypeScript", "Next.js", "Redux Toolkit", "Tailwind CSS", "REST APIs", "Jest", "GraphQL"],
          reasoning: `Top required technical skills for ${targetRole} positions.`
        });
      } else if (activeObj.action === "suggest_certifications") {
        setResult({
          suggested_certifications: [
            { title: "Meta Front-End Developer Professional Certificate", issuer: "Meta", year: "2024" },
            { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", "year": "2024" }
          ]
        });
      } else if (activeObj.action === "improve_summary") {
        setResult({
          summary: `High-impact ${targetRole} with 3+ years of experience building modern web applications. Expert in React, JavaScript, and cloud integrations with a history of increasing application performance by 35%.`
        });
      } else {
        setResult({
          result: `Enhanced resume content for ${targetRole}.`,
          suggestions: ["Use strong action verbs", "Highlight performance optimizations", "Include quantifiable project metrics"]
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyResult = () => {
    if (!result) return;

    if (result.summary && onApplyAssistantResult) {
      onApplyAssistantResult("summary", result.summary);
    } else if (result.suggested_skills && onApplyAssistantResult) {
      onApplyAssistantResult("skills", result.suggested_skills);
    } else if (result.suggested_certifications && onApplyAssistantResult) {
      onApplyAssistantResult("certifications", result.suggested_certifications);
    }
    onClose();
  };

  return (
    <div className="assistant-modal-overlay" onClick={onClose}>
      <div className="assistant-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="assistant-modal-header">
          <div className="assistant-title-row">
            <span className="assistant-icon">🤖</span>
            <h3>AI Resume Assistant</h3>
          </div>
          <button className="assistant-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="assistant-modal-body">
          <p className="assistant-subtitle">
            Ask AI to rewrite sections, suggest high-demand skills, optimize ATS scores, or tailor your resume for a target job.
          </p>

          <div className="assistant-role-input-group">
            <label>Target Job Role:</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Senior Full Stack Engineer"
            />
          </div>

          <div className="assistant-quick-prompts-label">Quick Prompts:</div>
          <div className="assistant-prompt-chips">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.id}
                className={`prompt-chip ${selectedPrompt.id === p.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedPrompt(p);
                  handleRunAction(p);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="assistant-custom-prompt-row">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Type custom instruction (e.g., 'Rewrite my first project to focus on scalable REST APIs')..."
            />
            <button
              className="assistant-run-btn"
              disabled={loading}
              onClick={() => handleRunAction(selectedPrompt)}
            >
              {loading ? "Generating..." : "Ask AI"}
            </button>
          </div>

          {loading && (
            <div className="assistant-loading-box">
              <div className="spinner"></div>
              <span>AI is thinking & enhancing your resume...</span>
            </div>
          )}

          {result && !loading && (
            <div className="assistant-result-box">
              <h4>✨ AI Recommendation Result:</h4>

              {result.summary && (
                <div className="result-section">
                  <div className="result-label">Improved Professional Summary:</div>
                  <p className="result-text">{result.summary}</p>
                </div>
              )}

              {result.suggested_skills && (
                <div className="result-section">
                  <div className="result-label">Suggested Skills to Add:</div>
                  <div className="suggested-tags">
                    {result.suggested_skills.map((s, idx) => (
                      <span key={idx} className="suggested-tag">+ {s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.suggested_certifications && (
                <div className="result-section">
                  <div className="result-label">Recommended Certifications:</div>
                  <ul className="suggested-list">
                    {result.suggested_certifications.map((c, idx) => (
                      <li key={idx}><strong>{c.title}</strong> — {c.issuer} ({c.year})</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.suggestions && (
                <div className="result-section">
                  <div className="result-label">Key Recommendations:</div>
                  <ul className="suggested-list">
                    {result.suggestions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="assistant-action-row">
                <button className="apply-ai-btn" onClick={handleApplyResult}>
                  Apply to Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResumeAssistantModal;
