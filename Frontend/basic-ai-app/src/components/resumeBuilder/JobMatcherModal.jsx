import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./JobMatcherModal.css";

const JobMatcherModal = ({
  isOpen,
  onClose,
  resumeData,
  setResumeData,
  onSaveResume,
  onLaunchMockInterview
}) => {
  const { authFetch } = useAuth();
  const [targetRole, setTargetRole] = useState(resumeData?.personal?.role || "Senior Software Engineer");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [activeTab, setActiveTab] = useState("roadmap"); // "gap" | "roadmap" | "projects"
  const [optimizedAlert, setOptimizedAlert] = useState(false);

  if (!isOpen) return null;

  const handleRunMatch = async () => {
    if (!jobDescription.trim()) {
      alert("Please paste or upload a target Job Description.");
      return;
    }

    setLoading(true);
    setOptimizedAlert(false);

    try {
      const res = await authFetch("http://localhost:8000/api/resume/job-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_id: "",
          resume_data: resumeData || {},
          job_description: jobDescription,
          target_role: targetRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMatchResult(data);
      } else {
        throw new Error("Failed to match job");
      }
    } catch (err) {
      console.warn("Error running job matcher:", err);
      // Fallback response for offline dev
      setMatchResult({
        match_percentage: 78,
        skills_match_score: 75,
        keywords_match_score: 80,
        experience_match_score: 82,
        education_match_score: 90,
        matched_skills: resumeData?.skills || ["JavaScript", "React", "Node.js", "REST APIs"],
        missing_skills: ["Docker", "Kubernetes", "GraphQL", "AWS Lambda"],
        missing_keywords: ["CI/CD Pipelines", "Microservices Architecture", "Redis Caching"],
        suggestions: [
          "Add experience with Docker containerization to close primary technical gap.",
          "Quantify work experience bullet points with percentage metrics."
        ],
        learning_roadmap: [
          { week: "Week 1", focus: "Docker & Containerization Foundations", tasks: ["Build Dockerfile for Node/React app", "Review container networking"] },
          { week: "Week 2", focus: "Kubernetes & CI/CD Pipelines", tasks: ["Set up automated GitHub Actions workflow", "Deploy container to cloud"] },
          { week: "Week 3", focus: "Portfolio Integration", tasks: ["Publish live demo repository", "Add metrics to resume"] },
          { week: "Week 4", focus: "Interview Mastery", tasks: ["Practice STAR behavioral questions", "Complete 1-click mock interview"] }
        ],
        recommended_projects: [
          { title: "Dockerized Enterprise Portal", description: "Build full-stack web app with Docker orchestration.", tech_stack: ["Docker", "React", "Node.js"] }
        ],
        recommended_certifications: [
          { title: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", difficulty: "Intermediate" }
        ],
        mock_interview_questions: [
          { id: "q1", category: "Containerization", question: "How do you configure Docker multi-stage builds for React/Node applications?", sample_answer: "Explain Dockerfile stages..." }
        ],
        tailored_resume_preview: {
          ...resumeData,
          skills: [...(resumeData?.skills || []), "Docker", "Kubernetes", "GraphQL"]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimization = () => {
    if (matchResult?.tailored_resume_preview) {
      setResumeData(matchResult.tailored_resume_preview);
      if (onSaveResume) onSaveResume(matchResult.tailored_resume_preview);
      setOptimizedAlert(true);
      setTimeout(() => setOptimizedAlert(false), 3000);
    }
  };

  const handleStartMockInterview = () => {
    if (matchResult?.mock_interview_questions) {
      localStorage.setItem("mock_setup_prefill", JSON.stringify({
        role: targetRole,
        job_description: jobDescription,
        questions: matchResult.mock_interview_questions
      }));
    }
    if (onLaunchMockInterview) {
      onLaunchMockInterview();
    } else {
      window.location.href = "/mock-interviews";
    }
  };

  const handleAddMissingSkill = (skill) => {
    if (!resumeData) return;
    const currentSkills = resumeData.skills || [];
    if (!currentSkills.includes(skill)) {
      const updated = {
        ...resumeData,
        skills: [...currentSkills, skill]
      };
      setResumeData(updated);
      if (onSaveResume) onSaveResume(updated);
    }
  };

  return (
    <div className="job-matcher-overlay" onClick={onClose}>
      <div className="job-matcher-container" onClick={(e) => e.stopPropagation()}>
        <div className="job-matcher-header">
          <div className="job-matcher-title">
            <span style={{ fontSize: "1.5rem" }}>🎯</span>
            <h2>Job Matcher & Skill Gap Studio</h2>
          </div>
          <button className="jm-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="job-matcher-body">
          {!matchResult ? (
            /* Input Setup Stage */
            <div className="jm-input-grid">
              <div className="jm-field-group" style={{ gridColumn: "span 2" }}>
                <label>🎯 Target Job Role</label>
                <input
                  type="text"
                  className="jm-input"
                  placeholder="e.g., Senior Full Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>

              <div className="jm-field-group" style={{ gridColumn: "span 2" }}>
                <label>📄 Target Job Description (Paste Text or Upload File)</label>
                <textarea
                  className="jm-textarea"
                  placeholder="Paste the target job description here (skills, requirements, responsibilities)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                ></textarea>
              </div>

              <button
                className="jm-analyze-btn"
                onClick={handleRunMatch}
                disabled={loading}
                style={{ gridColumn: "span 2" }}
              >
                {loading ? "⚡ Analyzing Job Match & Skill Gap..." : "🎯 Run Job Match & Skill Gap Workflow"}
              </button>
            </div>
          ) : (
            /* Match Results Stage */
            <div>
              {optimizedAlert && (
                <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10b981", color: "#10b981", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem" }}>
                  ✨ Success! Job-tailored skills & optimizations applied to your active resume workspace.
                </div>
              )}

              {/* Match Header Gauge */}
              <div className="jm-results-header">
                <div className="jm-gauge-box">
                  <span className="jm-match-score">{matchResult.match_percentage}%</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#fff" }}>Overall Job Fit Rating</h3>
                    <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>
                      Target: {targetRole}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMatchResult(null)}
                  style={{ background: "#1e293b", border: "1px solid #475569", color: "#cbd5e1", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer" }}
                >
                  🔄 Change JD
                </button>
              </div>

              {/* 4 Category Component Scores */}
              <div className="jm-components-grid">
                <div className="jm-comp-card">
                  <span className="jm-comp-title">Skills Match (30%)</span>
                  <span className="jm-comp-val" style={{ color: "#10b981" }}>{matchResult.skills_match_score || 80}%</span>
                </div>
                <div className="jm-comp-card">
                  <span className="jm-comp-title">Keywords Match (30%)</span>
                  <span className="jm-comp-val" style={{ color: "#6366f1" }}>{matchResult.keywords_match_score || 75}%</span>
                </div>
                <div className="jm-comp-card">
                  <span className="jm-comp-title">Experience Match (20%)</span>
                  <span className="jm-comp-val" style={{ color: "#3b82f6" }}>{matchResult.experience_match_score || 85}%</span>
                </div>
                <div className="jm-comp-card">
                  <span className="jm-comp-title">Education Match (20%)</span>
                  <span className="jm-comp-val" style={{ color: "#ec4899" }}>{matchResult.education_match_score || 90}%</span>
                </div>
              </div>

              {/* Workflow Navigation Tabs */}
              <div className="jm-tab-bar">
                <button className={`jm-tab-btn ${activeTab === "gap" ? "active" : ""}`} onClick={() => setActiveTab("gap")}>
                  🔍 Skill Gap & Missing Keywords ({matchResult.missing_skills?.length || 0})
                </button>
                <button className={`jm-tab-btn ${activeTab === "roadmap" ? "active" : ""}`} onClick={() => setActiveTab("roadmap")}>
                  🗺️ 4-Week Learning Roadmap
                </button>
                <button className={`jm-tab-btn ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>
                  💡 Recommended Projects & Certs
                </button>
              </div>

              {/* Tab 1: Skill Gap */}
              {activeTab === "gap" && (
                <div>
                  <h4 style={{ margin: "0 0 0.5rem 0", color: "#f1f5f9" }}>Matched Skills</h4>
                  <div className="jm-skill-tags">
                    {(matchResult.matched_skills || []).map((sk, i) => (
                      <span key={i} className="jm-tag matched">✓ {sk}</span>
                    ))}
                  </div>

                  <h4 style={{ margin: "1.25rem 0 0.5rem 0", color: "#f87171" }}>Missing Technical Skills (Skill Gap)</h4>
                  <div className="jm-skill-tags">
                    {(matchResult.missing_skills || []).map((sk, i) => (
                      <span
                        key={i}
                        className="jm-tag missing"
                        style={{ cursor: "pointer" }}
                        title="Click to add to your resume"
                        onClick={() => handleAddMissingSkill(sk)}
                      >
                        + Add {sk}
                      </span>
                    ))}
                  </div>

                  <h4 style={{ margin: "1.25rem 0 0.5rem 0", color: "#fbbf24" }}>Missing Domain Keywords</h4>
                  <div className="jm-skill-tags">
                    {(matchResult.missing_keywords || []).map((kw, i) => (
                      <span key={i} className="jm-tag" style={{ background: "rgba(251, 191, 36, 0.15)", color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.3)" }}>
                        🔑 {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Learning Roadmap */}
              {activeTab === "roadmap" && (
                <div className="jm-roadmap-timeline">
                  {(matchResult.learning_roadmap || []).map((step, i) => (
                    <div key={i} className="jm-week-card">
                      <h4 style={{ margin: "0 0 0.25rem 0", color: "#a855f7" }}>{step.week}: {step.focus}</h4>
                      <ul style={{ margin: "0.5rem 0 0 1.25rem", padding: 0, color: "#cbd5e1", fontSize: "0.9rem" }}>
                        {(step.tasks || []).map((t, tidx) => (
                          <li key={tidx} style={{ marginBottom: "0.25rem" }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Recommended Projects & Certifications */}
              {activeTab === "projects" && (
                <div>
                  <h4 style={{ margin: "0 0 0.75rem 0", color: "#60a5fa" }}>Recommended Portfolio Projects</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    {(matchResult.recommended_projects || []).map((p, i) => (
                      <div key={i} style={{ background: "#1e293b", padding: "1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <h5 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", color: "#f8fafc" }}>{p.title}</h5>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8" }}>{p.description}</p>
                      </div>
                    ))}
                  </div>

                  <h4 style={{ margin: "0 0 0.75rem 0", color: "#a78bfa" }}>Recommended Industry Certifications</h4>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {(matchResult.recommended_certifications || []).map((c, i) => (
                      <div key={i} style={{ background: "#1e293b", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid #475569" }}>
                        <strong style={{ display: "block", color: "#fff", fontSize: "0.9rem" }}>{c.title}</strong>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{c.issuer}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        {matchResult && (
          <div className="jm-actions-footer">
            <button className="jm-btn-primary" onClick={handleApplyOptimization}>
              ✨ Optimize Resume for This Job
            </button>
            <button className="jm-btn-interview" onClick={handleStartMockInterview}>
              🚀 Start One-Click Mock Interview
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatcherModal;
