import React, { useState } from "react";
import "./AIGeneratorModal.css";

const AIGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
  const [role, setRole] = useState("Full Stack Developer");
  const [level, setLevel] = useState("Mid-Level");
  const [industry, setIndustry] = useState("Software & Technology");
  const [skills, setSkills] = useState("React, Node.js, Python, PostgreSQL, AWS");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role.trim()) return;

    setLoading(true);
    try {
      await onGenerate({
        role: role.trim(),
        experience_level: level,
        industry: industry,
        key_skills: skills,
        bio_prompt: prompt
      });
    } catch (err) {
      console.error("Failed to generate AI resume:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-card">
        <button className="ai-modal-close-btn" onClick={onClose} disabled={loading}>
          &times;
        </button>

        <div className="ai-modal-header">
          <span className="ai-header-sparkle">✨</span>
          <h2>AI Resume Generator</h2>
        </div>
        <p className="ai-modal-sub">
          Provide your target role details, and our AI will build a complete, professional, ATS-optimized resume.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="ai-form-group">
            <label>Target Job Role / Title *</label>
            <input
              type="text"
              placeholder="e.g. Senior Frontend Engineer, Product Manager, Data Analyst"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </div>

          <div className="ai-form-row">
            <div className="ai-form-group">
              <label>Experience Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="Entry-Level">Entry-Level / Junior (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior Level">Senior Level (5-8+ yrs)</option>
                <option value="Lead / Executive">Lead / Manager / Executive</option>
              </select>
            </div>

            <div className="ai-form-group">
              <label>Target Industry</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="Software & Technology">Software & Technology</option>
                <option value="Finance & Banking">Finance & Fintech</option>
                <option value="Healthcare & Tech">Healthcare & HealthTech</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div className="ai-form-group">
            <label>Key Skills (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. React, TypeScript, FastAPI, MongoDB, Docker, Git"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="ai-form-group">
            <label>Additional Highlights / Bio Prompt (Optional)</label>
            <textarea
              placeholder="e.g. Include experience scaling systems to 100k users, led a team of 4 engineers..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="ai-modal-footer">
            <button type="button" className="btn-ai-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-ai-submit" disabled={loading}>
              {loading ? "Generating Resume..." : "✨ Generate Resume Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
