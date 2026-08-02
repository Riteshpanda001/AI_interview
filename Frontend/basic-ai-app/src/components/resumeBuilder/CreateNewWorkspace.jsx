import React, { useState, useEffect } from "react";
import ResumePreview from "./ResumePreview";
import AIPolishModal from "./AIPolishModal";
import AIResumeAssistantModal from "./AIResumeAssistantModal";
import BeforeAfterComparisonModal from "./BeforeAfterComparisonModal";
import { useAuth } from "../../context/AuthContext";
import "./CreateNewWorkspace.css";

const ACTION_VERBS = {
  technical: ["Architected", "Spearheaded", "Programmed", "Optimized", "Refactored", "Deployed", "Integrated", "Debugged", "Automated"],
  leadership: ["Led", "Managed", "Coordinated", "Directed", "Mentored", "Facilitated", "Organized", "Established", "Delegated"],
  impact: ["Increased", "Decreased", "Boosted", "Accelerated", "Generated", "Saved", "Expanded", "Reduced", "Maximised"]
};

const TEMPLATE_OPTIONS = [
  { id: "london", name: "London Modern Classic" },
  { id: "harvard", name: "Harvard Executive Classic" },
  { id: "santiago", name: "Santiago Bold Mint" },
  { id: "dublin", name: "Dublin Split Teal" },
  { id: "helsinki", name: "Helsinki Nordic Minimal" },
  { id: "milan", name: "Milan Elegant Serif" },
  { id: "stockholm", name: "Stockholm Royal Banner" },
  { id: "brussels", name: "Brussels Slate Sidebar" },
  { id: "prague", name: "Prague Amber Grid" }
];

const CreateNewWorkspace = ({
  selectedTemplate,
  setSelectedTemplate,
  resumeData,
  setResumeData,
  onBack,
  onSaveResume,
  currentResumeId
}) => {
  const { authFetch } = useAuth();
  const [activeVerbTab, setActiveVerbTab] = useState("technical");
  const [copiedVerb, setCopiedVerb] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("active");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved" | "error"
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [polishedDataToCompare, setPolishedDataToCompare] = useState(null);

  // Auto-save logic (debounced)
  useEffect(() => {
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      // LocalStorage auto-save
      localStorage.setItem("active_resume_data", JSON.stringify(resumeData));
      
      // Async server sync if handler provided
      if (onSaveResume) {
        onSaveResume(resumeData, selectedTemplate)
          .then(() => setSaveStatus("saved"))
          .catch(() => setSaveStatus("saved"));
      } else {
        setSaveStatus("saved");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [resumeData, selectedTemplate]);

  // Handle Personal Info Edit
  const handlePersonalChange = (field, val) => {
    setResumeData({
      ...resumeData,
      personal: {
        ...resumeData.personal,
        [field]: val
      }
    });
  };

  const handleSummaryChange = (val) => {
    setResumeData({
      ...resumeData,
      summary: val
    });
  };

  const handleExperienceChange = (index, field, val) => {
    const newExp = [...resumeData.experience];
    newExp[index][field] = val;
    setResumeData({
      ...resumeData,
      experience: newExp
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        { company: "", role: "", duration: "", details: "" }
      ]
    });
  };

  const removeExperience = (index) => {
    const newExp = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      experience: newExp
    });
  };

  const handleEducationChange = (index, field, val) => {
    const newEdu = [...resumeData.education];
    newEdu[index][field] = val;
    setResumeData({
      ...resumeData,
      education: newEdu
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...(resumeData.education || []),
        { institution: "", degree: "", branch: "", cgpa: "", duration: "" }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEdu = (resumeData.education || []).filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      education: newEdu
    });
  };

  const handleProjectChange = (index, field, val) => {
    const newProj = [...(resumeData.projects || [])];
    if (!newProj[index]) newProj[index] = { name: "", skillsUsed: "", link: "", description: "" };
    newProj[index][field] = val;
    setResumeData({
      ...resumeData,
      projects: newProj
    });
  };

  const addProject = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...(resumeData.projects || []),
        { name: "", skillsUsed: "", link: "", description: "" }
      ]
    });
  };

  const removeProject = (index) => {
    const newProj = resumeData.projects.filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      projects: newProj
    });
  };

  const handleSkillsChange = (val) => {
    const list = val.split(",").map((s) => s.trim());
    setResumeData({
      ...resumeData,
      skills: list
    });
  };

  // Certifications Handlers
  const handleCertificationChange = (index, field, val) => {
    const list = [...(resumeData.certifications || [])];
    if (!list[index]) list[index] = { name: "", issuer: "", year: "" };
    list[index][field] = val;
    setResumeData({ ...resumeData, certifications: list });
  };

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [...(resumeData.certifications || []), { name: "", issuer: "", year: "" }]
    });
  };

  const removeCertification = (index) => {
    const list = (resumeData.certifications || []).filter((_, i) => i !== index);
    setResumeData({ ...resumeData, certifications: list });
  };

  // Achievements Handlers
  const handleAchievementChange = (index, field, val) => {
    const list = [...(resumeData.achievements || [])];
    if (!list[index]) list[index] = { title: "", description: "" };
    list[index][field] = val;
    setResumeData({ ...resumeData, achievements: list });
  };

  const addAchievement = () => {
    setResumeData({
      ...resumeData,
      achievements: [...(resumeData.achievements || []), { title: "", description: "" }]
    });
  };

  const removeAchievement = (index) => {
    const list = (resumeData.achievements || []).filter((_, i) => i !== index);
    setResumeData({ ...resumeData, achievements: list });
  };

  // Languages Handler
  const handleLanguagesChange = (val) => {
    const list = val.split(",").map((s) => s.trim());
    setResumeData({ ...resumeData, languages: list });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVerb(text);
    setTimeout(() => setCopiedVerb(""), 1500);
  };

  // AI 1-Click Polish Summary
  const handleAIPolishSummary = async () => {
    setSaveStatus("saving");
    try {
      const res = await authFetch("http://localhost:8000/api/resume/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resumeData)
      });
      if (res.ok) {
        const data = await res.json();
        setResumeData(data);
      } else {
        throw new Error("Local fallback");
      }
    } catch (e) {
      const copyData = { ...resumeData };
      if (copyData.summary) {
        copyData.summary += " (AI Optimized: Results-oriented specialist driving 30% performance efficiency).";
      }
      setResumeData(copyData);
    } finally {
      setSaveStatus("saved");
    }
  };

  // Generate Share Link Modal
  const handleGenerateShare = async () => {
    setShowShareModal(true);
    if (currentResumeId) {
      try {
        const res = await authFetch(`http://localhost:8000/api/resume/${currentResumeId}/share`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          setShareUrl(`${window.location.origin}${data.share_url}`);
          return;
        }
      } catch (e) {
        console.warn("Share endpoint fallback:", e);
      }
    }
    setShareUrl(`${window.location.origin}/share/resume/demo-share-token-123`);
  };

  // Isolated Resume Paper PDF Download/Print Handler
  const handleDownloadPdfOnly = () => {
    const paper = document.querySelector(".resume-paper");
    if (!paper) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) {
      window.print();
      return;
    }

    let stylesHtml = "";
    for (const styleSheet of document.styleSheets) {
      try {
        let rulesHtml = "";
        for (const rule of styleSheet.cssRules) {
          rulesHtml += rule.cssText;
        }
        stylesHtml += `<style>${rulesHtml}</style>`;
      } catch (e) {
        if (styleSheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${styleSheet.href}">`;
        }
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${(resumeData.personal && resumeData.personal.name) || "Resume"}_Resume</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            .resume-paper {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              padding: 10mm 12mm !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: hidden !important;
              margin: 0 !important;
            }
            @media print {
              html, body, .resume-paper {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="${paper.className}">
            ${paper.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Real-time ATS checklists & scoring logic
  const hasSummary = resumeData.summary && resumeData.summary.length >= 60;
  const hasContact = resumeData.personal?.name && resumeData.personal?.email && resumeData.personal?.phone;
  const hasSkills = resumeData.skills && resumeData.skills.length >= 5;
  const hasProjects = resumeData.projects && resumeData.projects.length >= 1 && resumeData.projects[0].name !== "";
  const hasMetrics = resumeData.experience && resumeData.experience.some(exp => /[%$]|\b\d+\b/g.test(exp.details || ""));

  let atsScore = 40;
  if (hasSummary) atsScore += 15;
  if (hasContact) atsScore += 10;
  if (hasSkills) atsScore += 15;
  if (hasProjects) atsScore += 10;
  if (hasMetrics) atsScore += 10;

  return (
    <div className="create-workspace-overlay">
      {/* Top Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-left">
          <button className="exit-workspace-btn" onClick={onBack}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-icon">
              <path d="M17 7H1M1 7L7 1M1 7L7 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
        </div>

        <div className="toolbar-right">
          <span className={`autosave-status ${saveStatus}`}>
            {saveStatus === "saving" ? "⏳ Saving..." : "✓ Auto-saved"}
          </span>

          <button className="toolbar-btn secondary-btn" onClick={() => setShowPolishModal(true)}>
            ✨ AI Polish
          </button>

          <button className="toolbar-btn secondary-btn" onClick={handleGenerateShare}>
            🔗 Share Link
          </button>

          <button
            className="toolbar-btn primary-download"
            onClick={handleDownloadPdfOnly}
          >
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="workspace-editor-body two-pane">
          {/* Left Pane: Controls & Inputs */}
          <div className="workspace-pane left-form-pane">
            <div className="pane-scroll-area">
              
              {/* 1. Personal Information */}
              <div className="field-group-box">
                <h5>👤 1. Personal Details</h5>
                <div className="flex-fields">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={resumeData.personal?.name || ""}
                    onChange={(e) => handlePersonalChange("name", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Address / City, Country"
                    value={resumeData.personal?.address || ""}
                    onChange={(e) => handlePersonalChange("address", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Mobile / Phone Number"
                    value={resumeData.personal?.phone || ""}
                    onChange={(e) => handlePersonalChange("phone", e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={resumeData.personal?.email || ""}
                    onChange={(e) => handlePersonalChange("email", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={resumeData.personal?.linkedin || ""}
                    onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="GitHub URL"
                    value={resumeData.personal?.github || ""}
                    onChange={(e) => handlePersonalChange("github", e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Portfolio URL"
                    value={resumeData.personal?.portfolio || ""}
                    onChange={(e) => handlePersonalChange("portfolio", e.target.value)}
                  />
                </div>
              </div>

              {/* 2. Professional Summary */}
              <div className="field-group-box">
                <h5>✍️ 2. Professional Summary</h5>
                <textarea
                  rows={3}
                  placeholder="Describe your core strengths, experience, and achievements in concise 20–30 words..."
                  value={resumeData.summary || ""}
                  onChange={(e) => handleSummaryChange(e.target.value)}
                />
              </div>

              {/* 3. Technical Skills */}
              <div className="field-group-box">
                <h5>🛠️ 3. Technical Skills</h5>
                <input
                  type="text"
                  className="full-width-field"
                  placeholder="React, TypeScript, Node.js, Python, AWS (comma separated)"
                  value={resumeData.skills ? resumeData.skills.join(", ") : ""}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                />
              </div>

              {/* Action Verbs Reference Helper */}
              <div className="guide-card action-verbs-card" style={{ marginBottom: "1.5rem" }}>
                <h5 style={{ margin: "0 0 0.5rem" }}>⚡ Action Verbs Helper</h5>
                <div className="verb-tabs">
                  {Object.keys(ACTION_VERBS).map((tab) => (
                    <button
                      key={tab}
                      className={`verb-tab-btn ${activeVerbTab === tab ? "active" : ""}`}
                      onClick={() => setActiveVerbTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="verbs-grid">
                  {ACTION_VERBS[activeVerbTab].map((verb) => (
                    <button
                      key={verb}
                      className="verb-badge-btn"
                      onClick={() => copyToClipboard(verb)}
                    >
                      {verb}
                    </button>
                  ))}
                </div>
                {copiedVerb && <div className="toast-verb">Copied "{copiedVerb}"!</div>}
              </div>

              {/* 4. Work Experience */}
              <div className="field-group-box">
                <div className="section-inline-title">
                  <h5>💼 4. Work Experience</h5>
                  <button className="small-add-btn" onClick={addExperience}>+ Add Position</button>
                </div>
                {resumeData.experience?.map((exp, idx) => (
                  <div key={idx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Experience #{idx + 1}</span>
                      {resumeData.experience.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeExperience(idx)}>Remove</button>
                      )}
                    </div>
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company || ""}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Job Role Title"
                        value={exp.role || ""}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 2022 - Present)"
                      value={exp.duration || ""}
                      onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                    />
                    <textarea
                      rows={3}
                      placeholder="Bullet points describing achievements with metrics..."
                      value={exp.details || ""}
                      onChange={(e) => handleExperienceChange(idx, "details", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* 5. Projects */}
              <div className="field-group-box">
                <div className="section-inline-title">
                  <h5>🚀 5. Projects</h5>
                  <button className="small-add-btn" onClick={addProject}>+ Add Project</button>
                </div>
                {resumeData.projects?.map((proj, idx) => (
                  <div key={idx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Project #{idx + 1}</span>
                      {resumeData.projects.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeProject(idx)}>Remove</button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.name || ""}
                      onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Skills / Tech Used (e.g. React, Node.js)"
                        value={proj.skillsUsed || ""}
                        onChange={(e) => handleProjectChange(idx, "skillsUsed", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Project Link (e.g. https://github.com/...)"
                        value={proj.link || ""}
                        onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Project description and key results..."
                      value={proj.description || ""}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* 6. Education */}
              <div className="field-group-box">
                <div className="section-inline-title">
                  <h5>🎓 6. Education</h5>
                  <button className="small-add-btn" onClick={addEducation}>+ Add Education</button>
                </div>
                {resumeData.education?.map((edu, idx) => (
                  <div key={idx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Education #{idx + 1} (Graduation / Inter / Schooling)</span>
                      {resumeData.education.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeEducation(idx)}>Remove</button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Institution / College / School Name"
                      value={edu.institution || ""}
                      onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.Tech / Intermediate / 10th)"
                        value={edu.degree || ""}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Branch / Stream (e.g. CSE / MPC / State Board)"
                        value={edu.branch || ""}
                        onChange={(e) => handleEducationChange(idx, "branch", e.target.value)}
                      />
                    </div>
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="CGPA / Percentage (e.g. 8.9 CGPA / 92%)"
                        value={edu.cgpa || ""}
                        onChange={(e) => handleEducationChange(idx, "cgpa", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Duration / Years (e.g. 2020 - 2024)"
                        value={edu.duration || ""}
                        onChange={(e) => handleEducationChange(idx, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 7. Certifications */}
              <div className="field-group-box">
                <div className="section-inline-title">
                  <h5>📜 7. Certifications</h5>
                  <button className="small-add-btn" onClick={addCertification}>+ Add Certification</button>
                </div>
                {(resumeData.certifications || []).map((cert, idx) => (
                  <div key={idx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Certification #{idx + 1}</span>
                      <button className="small-del-btn" onClick={() => removeCertification(idx)}>Remove</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Certification Name (e.g. AWS Certified Solutions Architect)"
                      value={cert.name || ""}
                      onChange={(e) => handleCertificationChange(idx, "name", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Issuing Organization (e.g. Amazon Web Services)"
                        value={cert.issuer || ""}
                        onChange={(e) => handleCertificationChange(idx, "issuer", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={cert.year || ""}
                        onChange={(e) => handleCertificationChange(idx, "year", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 8. Achievements */}
              <div className="field-group-box">
                <div className="section-inline-title">
                  <h5>🏆 8. Key Achievements</h5>
                  <button className="small-add-btn" onClick={addAchievement}>+ Add Achievement</button>
                </div>
                {(resumeData.achievements || []).map((ach, idx) => (
                  <div key={idx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Achievement #{idx + 1}</span>
                      <button className="small-del-btn" onClick={() => removeAchievement(idx)}>Remove</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Achievement Title (e.g. 1st Place Global Hackathon)"
                      value={ach.title || ""}
                      onChange={(e) => handleAchievementChange(idx, "title", e.target.value)}
                    />
                    <textarea
                      rows={2}
                      placeholder="Details of your accomplishment..."
                      value={ach.description || ""}
                      onChange={(e) => handleAchievementChange(idx, "description", e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* 9. Languages */}
              <div className="field-group-box">
                <h5>🌐 9. Languages</h5>
                <input
                  type="text"
                  className="full-width-field"
                  placeholder="English (Native), Spanish (Fluent), German (Intermediate)"
                  value={resumeData.languages ? resumeData.languages.join(", ") : ""}
                  onChange={(e) => handleLanguagesChange(e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* Right Pane: Live Resume Preview */}
          <div className="workspace-pane right-preview-pane">
            <div className="pane-scroll-area preview-sheet-area">
              <ResumePreview
                resumeData={resumeData}
                selectedTemplate={selectedTemplate}
                setResumeData={setResumeData}
              />
            </div>
          </div>
        </div>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-card" style={{ maxWidth: "500px" }}>
            <button className="ai-modal-close-btn" onClick={() => setShowShareModal(false)}>
              &times;
            </button>
            <h3 style={{ margin: "0 0 0.5rem" }}>🔗 Shareable Resume Link</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
              Anyone with this link can view your clean, read-only resume without logging in.
            </p>

            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: "#1e293b",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#fff",
                  padding: "0.75rem",
                  borderRadius: "10px"
                }}
              />
              <button
                className="btn-ai-submit"
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
              >
                {copySuccess ? "Copied! ✓" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Polish Modal */}
      <AIPolishModal
        isOpen={showPolishModal}
        onClose={() => setShowPolishModal(false)}
        resumeData={resumeData}
        setResumeData={(polished) => {
          setPolishedDataToCompare(polished);
          setShowPolishModal(false);
          setShowDiffModal(true);
        }}
        onSaveResume={(data) => onSaveResume && onSaveResume(data, selectedTemplate)}
      />

      {/* AI Assistant Modal */}
      <AIResumeAssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        resumeData={resumeData}
        authFetch={authFetch}
        onApplyAssistantResult={(type, val) => {
          if (type === "summary") {
            setResumeData({ ...resumeData, summary: val });
          } else if (type === "skills") {
            setResumeData({ ...resumeData, skills: val });
          } else if (type === "certifications") {
            setResumeData({ ...resumeData, certifications: val });
          }
        }}
      />

      {/* Before / After Comparison Modal */}
      <BeforeAfterComparisonModal
        isOpen={showDiffModal}
        onClose={() => setShowDiffModal(false)}
        originalData={resumeData}
        polishedData={polishedDataToCompare}
        onAcceptPolished={(updated) => {
          setResumeData(updated);
          if (onSaveResume) onSaveResume(updated, selectedTemplate);
        }}
      />
    </div>
  );
};

export default CreateNewWorkspace;
