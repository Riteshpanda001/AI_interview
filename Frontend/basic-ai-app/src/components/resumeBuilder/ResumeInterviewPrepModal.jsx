import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./ResumeInterviewPrepModal.css";

const INTERVIEW_TYPES = ["Technical", "HR", "Behavioral", "Mixed"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const ResumeInterviewPrepModal = ({ isOpen, onClose, resumeData, currentResumeId, authFetch }) => {
  const navigate = useNavigate();

  const [targetRole, setTargetRole] = useState(resumeData?.personal?.role || "");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [difficulty, setDifficulty] = useState("Medium");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [prepData, setPrepData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        resume_data: resumeData,
        target_role: targetRole || resumeData?.personal?.role || "Software Engineer",
        company: company,
        job_description: jobDescription,
        interview_type: interviewType,
        difficulty: difficulty
      };

      const res = await authFetch(`${API_BASE_URL}/resumes/interview-tips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Authentication required. Please log in.");
        if (res.status === 403) throw new Error("Forbidden access.");
        if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment.");
        if (res.status >= 500) throw new Error("AI service temporarily unavailable. Please retry.");
        throw new Error(`Server returned error (${res.status})`);
      }

      const data = await res.json();
      if (data && (data.likely_questions || data.technical_topics)) {
        setPrepData(data);
      } else {
        throw new Error("Received empty response from interview coach.");
      }
    } catch (err) {
      console.error("Interview prep error:", err);
      setErrorMsg(err.message || "Network error. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!prepData) return;
    let fullText = `=== INTERVIEW PREPARATION GUIDE ===\n`;
    fullText += `Role: ${targetRole || resumeData?.personal?.role || 'Candidate'}\n`;
    if (company) fullText += `Company: ${company}\n`;
    fullText += `Type: ${interviewType} | Difficulty: ${difficulty}\n\n`;

    if (prepData.likely_questions?.length) {
      fullText += `--- Likely Interview Questions ---\n`;
      prepData.likely_questions.forEach((q, i) => {
        fullText += `${i + 1}. ${q}\n`;
      });
      fullText += `\n`;
    }

    if (prepData.technical_topics?.length) {
      fullText += `--- Technical Topics to Review ---\n`;
      prepData.technical_topics.forEach((t) => {
        fullText += `• ${t}\n`;
      });
      fullText += `\n`;
    }

    if (prepData.resume_based_questions?.length) {
      fullText += `--- Resume-Based Deep Dive Questions ---\n`;
      prepData.resume_based_questions.forEach((q) => {
        fullText += `• ${q}\n`;
      });
      fullText += `\n`;
    }

    if (prepData.recommended_prep?.length) {
      fullText += `--- Recommended Preparation ---\n`;
      prepData.recommended_prep.forEach((r) => {
        fullText += `✓ ${r}\n`;
      });
      fullText += `\n`;
    }

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartMockInterview = () => {
    onClose();
    // Navigate to MockInterviews with prefilled role and company state
    navigate("/mock-interviews", {
      state: {
        startWithPreset: true,
        interviewDetails: {
          role: targetRole || resumeData?.personal?.role || "Software Engineer",
          company: company || "General Tech",
          interviewType: interviewType === "Mixed" ? "Comprehensive" : interviewType,
          difficulty: difficulty,
          resume_id: currentResumeId || ""
        }
      }
    });
  };

  return (
    <div className="interview-prep-overlay" onClick={onClose}>
      <div className="interview-prep-card" onClick={(e) => e.stopPropagation()}>
        <button className="interview-prep-close" onClick={onClose} title="Close">
          ✕
        </button>

        <div className="interview-prep-header">
          <div className="interview-prep-badge">🎯 AI INTERVIEW COACH</div>
          <h2>
            Interview <span>Preparation</span>
          </h2>
          <p className="interview-prep-sub">
            Targeted technical questions, architectural deep dives, and behavioral preparation extracted from your resume.
          </p>
        </div>

        {errorMsg && (
          <div className="interview-prep-error-box">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        <div className="interview-prep-body-grid">
          {/* Left Form Settings */}
          <div className="interview-prep-form-pane">
            <h4 className="pane-section-title">⚙️ Target Role & Interview Settings</h4>

            <div className="ip-form-group">
              <label>Target Role *</label>
              <input
                type="text"
                placeholder="e.g. Senior Backend Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="ip-form-group">
              <label>Target Company (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Meta, Amazon, Stripe"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="ip-form-group">
              <label>Interview Type</label>
              <div className="ip-chip-grid">
                {INTERVIEW_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`ip-chip ${interviewType === t ? "active" : ""}`}
                    onClick={() => setInterviewType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="ip-form-group">
              <label>Target Difficulty</label>
              <div className="ip-chip-grid">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={`ip-chip ${difficulty === d ? "active" : ""}`}
                    onClick={() => setDifficulty(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="ip-form-group">
              <label>Job Description (Optional)</label>
              <textarea
                rows={3}
                placeholder="Paste job posting to tailor questions directly to job requirements..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <button
              className="btn-generate-interview-prep"
              disabled={loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <>
                  <span className="ip-spinner"></span> Analyzing your resume...
                </>
              ) : prepData ? (
                "🔄 Regenerate Questions"
              ) : (
                "⚡ Generate Interview Questions"
              )}
            </button>
          </div>

          {/* Right Results Pane */}
          <div className="interview-prep-results-pane">
            <div className="ip-results-top-bar">
              <span className="ip-results-status">
                {prepData ? "🎯 Preparation Breakdown" : "💡 Ready for Analysis"}
              </span>

              {prepData && (
                <div className="ip-results-actions">
                  <button className="ip-act-btn mock-btn" onClick={handleStartMockInterview}>
                    🚀 Start Mock Interview
                  </button>
                  <button className="ip-act-btn" onClick={handleCopy}>
                    {copied ? "✓ Copied!" : "📋 Copy All"}
                  </button>
                </div>
              )}
            </div>

            <div className="ip-results-scroll-area">
              {loading ? (
                <div className="ip-loading-box">
                  <div className="ip-big-spinner"></div>
                  <h3>Analyzing your resume and preparing interview questions...</h3>
                  <p>Extracting high-probability technical questions and behavioral scenarios</p>
                </div>
              ) : prepData ? (
                <div className="ip-content-wrapper">
                  {/* Section 1: Likely Questions */}
                  {prepData.likely_questions?.length > 0 && (
                    <div className="ip-section-card">
                      <h4 className="ip-card-title">
                        <span className="ip-icon">❓</span> Likely Interview Questions
                      </h4>
                      <ol className="ip-question-list">
                        {prepData.likely_questions.map((q, idx) => (
                          <li key={idx} className="ip-question-item">
                            {q}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Section 2: Technical Topics */}
                  {prepData.technical_topics?.length > 0 && (
                    <div className="ip-section-card">
                      <h4 className="ip-card-title">
                        <span className="ip-icon">🛠️</span> Technical Topics to Review
                      </h4>
                      <div className="ip-topics-tags">
                        {prepData.technical_topics.map((topic, idx) => (
                          <div key={idx} className="ip-topic-tag">
                            <span className="ip-tag-dot">•</span>
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Resume Deep Dives */}
                  {prepData.resume_based_questions?.length > 0 && (
                    <div className="ip-section-card">
                      <h4 className="ip-card-title">
                        <span className="ip-icon">🔍</span> Resume-Based Questions
                      </h4>
                      <ul className="ip-bullet-list">
                        {prepData.resume_based_questions.map((q, idx) => (
                          <li key={idx} className="ip-bullet-item">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Section 4: Recommended Preparation */}
                  {prepData.recommended_prep?.length > 0 && (
                    <div className="ip-section-card highlight-card">
                      <h4 className="ip-card-title">
                        <span className="ip-icon">💡</span> Recommended Preparation Steps
                      </h4>
                      <ul className="ip-bullet-list">
                        {prepData.recommended_prep.map((rec, idx) => (
                          <li key={idx} className="ip-rec-item">
                            <span className="ip-check">✓</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Action Card */}
                  <div className="ip-cta-footer">
                    <div className="ip-cta-info">
                      <strong>Ready to practice these questions in real-time?</strong>
                      <p>Start an interactive AI Mock Interview session with live speech & feedback.</p>
                    </div>
                    <button className="btn-start-mock-cta" onClick={handleStartMockInterview}>
                      🚀 Start Mock Interview Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ip-empty-box">
                  <div className="ip-empty-icon">🎯</div>
                  <h4>No Interview Analysis Generated</h4>
                  <p>
                    Set your target role and difficulty on the left, then click <strong>Generate Interview Questions</strong> to receive targeted prep materials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeInterviewPrepModal;
