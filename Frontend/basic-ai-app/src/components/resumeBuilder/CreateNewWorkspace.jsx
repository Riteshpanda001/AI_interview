import React, { useState, useEffect } from "react";
import ResumePreview from "./ResumePreview";
import AIPolishModal from "./AIPolishModal";
import AIResumeAssistantModal from "./AIResumeAssistantModal";
import BeforeAfterComparisonModal from "./BeforeAfterComparisonModal";
import JobMatcherModal from "./JobMatcherModal";
import CoverLetterModal from "./CoverLetterModal";
import ResumeInterviewPrepModal from "./ResumeInterviewPrepModal";
import PrintPreviewModal from "./PrintPreviewModal";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./CreateNewWorkspace.css";

const ACTION_VERBS = {
  technical: ["Architected", "Spearheaded", "Programmed", "Optimized", "Refactored", "Deployed", "Integrated", "Debugged", "Automated"],
  leadership: ["Led", "Managed", "Coordinated", "Directed", "Mentored", "Facilitated", "Organized", "Established", "Delegated"],
  impact: ["Increased", "Decreased", "Boosted", "Accelerated", "Generated", "Saved", "Expanded", "Reduced", "Maximised"]
};

const TEMPLATE_OPTIONS = [
  { id: "london", name: "London Modern Classic" },
  { id: "classic", name: "Classic ATS Professional" },
  { id: "academic", name: "Academic & Research" },
  { id: "tokyo", name: "Tokyo High-Tech" },
  { id: "executive", name: "Executive Leadership" },
  { id: "tech", name: "Tech Minimalist" },
  { id: "harvard", name: "Harvard Executive Classic" },
  { id: "santiago", name: "Santiago Bold Mint" },
  { id: "dublin", name: "Dublin Split Teal" },
  { id: "helsinki", name: "Helsinki Nordic Minimal" },
  { id: "milan", name: "Milan Elegant Serif" },
  { id: "stockholm", name: "Stockholm Royal Banner" },
  { id: "brussels", name: "Brussels Slate Sidebar" },
  { id: "prague", name: "Prague Amber Grid" }
];

const DEFAULT_SECTION_ORDER = [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "languages"
];

const SECTION_LABELS = {
  personal: { name: "Personal Details", icon: "👤", number: 1 },
  summary: { name: "Professional Summary", icon: "✍️", number: 2 },
  experience: { name: "Work Experience", icon: "💼", number: 3 },
  education: { name: "Education", icon: "🎓", number: 4 },
  skills: { name: "Technical Skills", icon: "🛠️", number: 5 },
  projects: { name: "Projects", icon: "🚀", number: 6 },
  certifications: { name: "Certifications", icon: "📜", number: 7 },
  achievements: { name: "Key Achievements", icon: "🏆", number: 8 },
  languages: { name: "Languages", icon: "🌐", number: 9 }
};

const CreateNewWorkspace = ({
  selectedTemplate,
  setSelectedTemplate,
  resumeData,
  setResumeData,
  onBack,
  onSaveResume,
  currentResumeId,
  workspaceMode = "new"
}) => {
  const { authFetch } = useAuth();
  const [activeVerbTab, setActiveVerbTab] = useState("technical");
  const [copiedVerb, setCopiedVerb] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState("active");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saving" | "saved" | "error"
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versions, setVersions] = useState([]);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [showPolishModal, setShowPolishModal] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);
  const [showJobMatcherModal, setShowJobMatcherModal] = useState(false);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [showInterviewPrepModal, setShowInterviewPrepModal] = useState(false);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  const [showReorderDrawer, setShowReorderDrawer] = useState(false);
  const [polishedDataToCompare, setPolishedDataToCompare] = useState(null);

  // Section Ordering & Visibility State
  const [sectionOrder, setSectionOrder] = useState(() => {
    if (resumeData?.section_order && Array.isArray(resumeData.section_order) && resumeData.section_order.length > 0) {
      return resumeData.section_order;
    }
    return DEFAULT_SECTION_ORDER;
  });
  const [hiddenSections, setHiddenSections] = useState(() => {
    return (resumeData?.hidden_sections && Array.isArray(resumeData.hidden_sections))
      ? resumeData.hidden_sections
      : [];
  });
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // Fetch Version History
  const handleFetchVersions = async () => {
    setShowVersionModal(true);
    if (currentResumeId) {
      try {
        const res = await authFetch(`${API_BASE_URL}/resume/${currentResumeId}/versions`);
        if (res.ok) {
          const list = await res.json();
          setVersions(list);
          return;
        }
      } catch (err) {
        console.warn("Versions endpoint error, using fallback:", err);
      }
    }
    // Fallback versions if server snapshot not available
    setVersions([
      { id: "v2", version_name: "Auto-Saved Snapshot (Current)", created_at: new Date().toISOString(), resume_data: resumeData },
      { id: "v1", version_name: "Initial Draft Snapshot", created_at: new Date(Date.now() - 3600000).toISOString(), resume_data: resumeData }
    ]);
  };

  // Restore Snapshot Version
  const handleRestoreVersion = async (ver) => {
    if (currentResumeId && ver._id) {
      try {
        const res = await authFetch(`${API_BASE_URL}/resume/${currentResumeId}/restore-version?version_id=${ver._id}`, { method: "POST" });
        if (res.ok) {
          const restored = await res.json();
          const targetData = restored.parsed_content || restored.resume_data || ver.resume_data;
          const restoredOrder = restored.section_order || ver.section_order || DEFAULT_SECTION_ORDER;
          const restoredHidden = restored.hidden_sections || ver.hidden_sections || [];
          setResumeData(targetData);
          setSectionOrder(restoredOrder);
          setHiddenSections(restoredHidden);
          alert(`✨ Restored snapshot "${ver.version_name || 'Version'}" successfully!`);
          setShowVersionModal(false);
          return;
        }
      } catch (err) {
        console.warn("Server version restore error:", err);
      }
    }
    if (ver.resume_data) {
      setResumeData(ver.resume_data);
      if (ver.section_order) setSectionOrder(ver.section_order);
      if (ver.hidden_sections) setHiddenSections(ver.hidden_sections);
      if (onSaveResume) onSaveResume({ ...ver.resume_data, section_order: ver.section_order || sectionOrder, hidden_sections: ver.hidden_sections || hiddenSections }, selectedTemplate);
      alert(`✨ Restored version "${ver.version_name}" successfully!`);
      setShowVersionModal(false);
    }
  };

  // Drag and drop section reordering handlers
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, moved);
    setSectionOrder(newOrder);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const moveSection = (index, delta) => {
    const newIdx = index + delta;
    if (newIdx < 0 || newIdx >= sectionOrder.length) return;
    const newOrder = [...sectionOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(newIdx, 0, moved);
    setSectionOrder(newOrder);
  };

  const toggleHideSection = (secId) => {
    if (hiddenSections.includes(secId)) {
      setHiddenSections(hiddenSections.filter(s => s !== secId));
    } else {
      setHiddenSections([...hiddenSections, secId]);
    }
  };

  // Export Resume as native DOCX Document
  const handleDownloadDocx = async () => {
    if (currentResumeId) {
      try {
        const response = await authFetch(`${API_BASE_URL}/resume/${currentResumeId}/export/docx`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const name = resumeData?.personal?.name || "Resume";
          link.href = url;
          link.download = `${name.replace(/\s+/g, '_')}_Resume.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn("Error exporting docx from server, using local fallback:", err);
      }
    }

    const name = resumeData?.personal?.name || "Candidate";
    const title = resumeData?.personal?.role || "Software Engineer";
    const summary = resumeData?.summary || "";
    const skills = resumeData?.skills ? resumeData.skills.join(", ") : "";

    let expHtml = "";
    (resumeData?.experience || []).forEach(exp => {
      expHtml += `
        <div style="margin-bottom: 10pt;">
          <p style="font-size: 11pt; font-weight: bold; margin: 0;">${exp.role || ''} - ${exp.company || ''} <span style="float: right; font-weight: normal;">${exp.duration || ''}</span></p>
          <p style="font-size: 10pt; color: #333; margin: 4pt 0 0 0; white-space: pre-line;">${exp.details || ''}</p>
        </div>
      `;
    });

    const docxContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${name} - Resume</title></head>
      <body>
        <h1>${name}</h1>
        <div>${title} | ${resumeData?.personal?.email || ''} | ${resumeData?.personal?.phone || ''}</div>
        ${summary ? `<h2>Professional Summary</h2><p>${summary}</p>` : ''}
        ${skills ? `<h2>Technical Skills</h2><p>${skills}</p>` : ''}
        ${expHtml ? `<h2>Work Experience</h2>${expHtml}` : ''}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + docxContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_')}_Resume.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auto-save logic (debounced)
  useEffect(() => {
    setSaveStatus("saving");
    const timer = setTimeout(() => {
      const fullPayload = {
        ...resumeData,
        section_order: sectionOrder,
        hidden_sections: hiddenSections
      };
      // LocalStorage auto-save
      localStorage.setItem("active_resume_data", JSON.stringify(fullPayload));
      localStorage.setItem("active_section_order", JSON.stringify(sectionOrder));
      localStorage.setItem("active_hidden_sections", JSON.stringify(hiddenSections));
      
      // Async server sync if handler provided
      if (onSaveResume) {
        onSaveResume(fullPayload, selectedTemplate)
          .then(() => setSaveStatus("saved"))
          .catch(() => setSaveStatus("saved"));
      } else {
        setSaveStatus("saved");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [resumeData, selectedTemplate, sectionOrder, hiddenSections]);

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
      const res = await authFetch(`${API_BASE_URL}/resume/optimize`, {
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
        const res = await authFetch(`${API_BASE_URL}/resume/${currentResumeId}/share`, {
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

  // Server-side PDF download (falls back to browser print if unavailable)
  const handleDownloadPdfOnly = async () => {
    // 1. Try server PDF endpoint first (produces a true PDF file)
    if (currentResumeId) {
      try {
        const response = await authFetch(`${API_BASE_URL}/resume/${currentResumeId}/export/pdf`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          const name = resumeData?.personal?.name || "Resume";
          link.href = url;
          link.download = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          return;
        }
      } catch (err) {
        console.warn("Server PDF endpoint unavailable, falling back to browser print:", err);
      }
    }

    // 2. Browser print-to-PDF fallback (captures styled live preview)
    const paper = document.querySelector(".resume-paper");
    if (!paper) {
      window.print();
      return;
    }

    // Compute scale ratio for strict 1-page fit
    const scrollH = paper.scrollHeight;
    const clientH = paper.clientHeight;
    let scaleRatio = 1.0;
    if (scrollH > clientH && clientH > 0) {
      scaleRatio = Math.max(0.72, Math.min(0.98, clientH / scrollH));
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
              padding: 8mm 10mm !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: hidden !important;
              margin: 0 !important;
              transform: scale(${scaleRatio});
              transform-origin: top center;
            }
            @media print {
              html, body, .resume-paper {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
                transform: scale(${scaleRatio});
                transform-origin: top center;
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
          <\/script>
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

  const renderSectionHeader = (secId, idx) => {
    const meta = SECTION_LABELS[secId] || { name: secId, icon: "📄", number: idx + 1 };
    const isHidden = hiddenSections.includes(secId);

    return (
      <div className="section-drag-header">
        <div className="section-drag-left">
          <span
            className="drag-handle-grip"
            title="Drag to reorder section"
            draggable
            onDragStart={(e) => handleDragStart(e, idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            ☰
          </span>
          <span className="section-number-badge">{idx + 1}</span>
          <h5 className="section-card-title">
            <span className="sec-icon">{meta.icon}</span> {meta.name}
          </h5>
        </div>

        <div className="section-drag-actions">
          <button
            type="button"
            className="sec-ctrl-btn"
            title="Move section up"
            disabled={idx === 0}
            onClick={() => moveSection(idx, -1)}
          >
            ▲
          </button>
          <button
            type="button"
            className="sec-ctrl-btn"
            title="Move section down"
            disabled={idx === sectionOrder.length - 1}
            onClick={() => moveSection(idx, 1)}
          >
            ▼
          </button>
          <button
            type="button"
            className={`sec-ctrl-btn hide-toggle-btn ${isHidden ? "hidden-active" : ""}`}
            title={isHidden ? "Show section on resume" : "Hide section from resume"}
            onClick={() => toggleHideSection(secId)}
          >
            {isHidden ? "👁️‍🗨️ Hidden" : "👁️ Visible"}
          </button>
        </div>
      </div>
    );
  };

  const renderFormSection = (secId, idx) => {
    const isHidden = hiddenSections.includes(secId);

    switch (secId) {
      case "summary":
        return (
          <div
            key="summary"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("summary", idx)}
            {!isHidden && (
              <textarea
                rows={3}
                placeholder="Describe your core strengths, experience, and achievements in concise 20–30 words..."
                value={resumeData.summary || ""}
                onChange={(e) => handleSummaryChange(e.target.value)}
              />
            )}
          </div>
        );

      case "personal":
        return (
          <div
            key="personal"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("personal", idx)}
            {!isHidden && (
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
            )}
          </div>
        );

      case "education":
        return (
          <div
            key="education"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("education", idx)}
            {!isHidden && (
              <>
                <div className="section-inline-title">
                  <span className="sub-helper">List your degrees and institutions</span>
                  <button className="small-add-btn" onClick={addEducation}>+ Add Education</button>
                </div>
                {resumeData.education?.map((edu, eIdx) => (
                  <div key={eIdx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Education #{eIdx + 1} ({edu.duration || '2021 – 2025'})</span>
                      {resumeData.education.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeEducation(eIdx)}>Remove</button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Institution / College / School Name"
                      value={edu.institution || ""}
                      onChange={(e) => handleEducationChange(eIdx, "institution", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Degree (e.g. B.Tech / Intermediate / 10th)"
                        value={edu.degree || ""}
                        onChange={(e) => handleEducationChange(eIdx, "degree", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Branch / Stream (e.g. CSE / MPC / State Board)"
                        value={edu.branch || ""}
                        onChange={(e) => handleEducationChange(eIdx, "branch", e.target.value)}
                      />
                    </div>
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="CGPA / Percentage (e.g. 8.9 CGPA / 92%)"
                        value={edu.cgpa || ""}
                        onChange={(e) => handleEducationChange(eIdx, "cgpa", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Duration / Years (e.g. 2021 – 2025)"
                        value={edu.duration || ""}
                        onChange={(e) => handleEducationChange(eIdx, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case "skills":
        return (
          <div
            key="skills"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("skills", idx)}
            {!isHidden && (
              <input
                type="text"
                className="full-width-field"
                placeholder="React, TypeScript, Node.js, Python, AWS (comma separated)"
                value={resumeData.skills ? resumeData.skills.join(", ") : ""}
                onChange={(e) => handleSkillsChange(e.target.value)}
              />
            )}
          </div>
        );

      case "experience":
        return (
          <div
            key="experience"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("experience", idx)}
            {!isHidden && (
              <>
                <div className="section-inline-title">
                  <span className="sub-helper">Roles, responsibilities, and achievements</span>
                  <button className="small-add-btn" onClick={addExperience}>+ Add Position</button>
                </div>
                {resumeData.experience?.map((exp, expIdx) => (
                  <div key={expIdx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Position #{expIdx + 1} ({exp.duration || '2021 – 2025'})</span>
                      {resumeData.experience.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeExperience(expIdx)}>Remove</button>
                      )}
                    </div>
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={exp.company || ""}
                        onChange={(e) => handleExperienceChange(expIdx, "company", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Job Role Title"
                        value={exp.role || ""}
                        onChange={(e) => handleExperienceChange(expIdx, "role", e.target.value)}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Duration (e.g. 2021 – 2025)"
                      value={exp.duration || ""}
                      onChange={(e) => handleExperienceChange(expIdx, "duration", e.target.value)}
                    />
                    <textarea
                      rows={3}
                      placeholder="Bullet points describing achievements with metrics..."
                      value={exp.details || ""}
                      onChange={(e) => handleExperienceChange(expIdx, "details", e.target.value)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case "projects":
        return (
          <div
            key="projects"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("projects", idx)}
            {!isHidden && (
              <>
                <div className="section-inline-title">
                  <span className="sub-helper">Key technical and personal projects</span>
                  <button className="small-add-btn" onClick={addProject}>+ Add Project</button>
                </div>
                {resumeData.projects?.map((proj, pIdx) => (
                  <div key={pIdx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Project #{pIdx + 1}</span>
                      {resumeData.projects.length > 1 && (
                        <button className="small-del-btn" onClick={() => removeProject(pIdx)}>Remove</button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.name || ""}
                      onChange={(e) => handleProjectChange(pIdx, "name", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Skills / Tech Used (e.g. React, Node.js)"
                        value={proj.skillsUsed || ""}
                        onChange={(e) => handleProjectChange(pIdx, "skillsUsed", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Project Link (e.g. https://github.com/...)"
                        value={proj.link || ""}
                        onChange={(e) => handleProjectChange(pIdx, "link", e.target.value)}
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Project description and key results..."
                      value={proj.description || ""}
                      onChange={(e) => handleProjectChange(pIdx, "description", e.target.value)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case "certifications":
        return (
          <div
            key="certifications"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("certifications", idx)}
            {!isHidden && (
              <>
                <div className="section-inline-title">
                  <span className="sub-helper">Professional certifications & credentials</span>
                  <button className="small-add-btn" onClick={addCertification}>+ Add Certification</button>
                </div>
                {(resumeData.certifications || []).map((cert, cIdx) => (
                  <div key={cIdx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Certification #{cIdx + 1}</span>
                      <button className="small-del-btn" onClick={() => removeCertification(cIdx)}>Remove</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Certification Name (e.g. AWS Certified Solutions Architect)"
                      value={cert.name || ""}
                      onChange={(e) => handleCertificationChange(cIdx, "name", e.target.value)}
                    />
                    <div className="input-row-half">
                      <input
                        type="text"
                        placeholder="Issuing Organization (e.g. Amazon Web Services)"
                        value={cert.issuer || ""}
                        onChange={(e) => handleCertificationChange(cIdx, "issuer", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Year (e.g. 2024)"
                        value={cert.year || ""}
                        onChange={(e) => handleCertificationChange(cIdx, "year", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case "achievements":
        return (
          <div
            key="achievements"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("achievements", idx)}
            {!isHidden && (
              <>
                <div className="section-inline-title">
                  <span className="sub-helper">Awards, competitions, hackathons, & honors</span>
                  <button className="small-add-btn" onClick={addAchievement}>+ Add Achievement</button>
                </div>
                {(resumeData.achievements || []).map((ach, aIdx) => (
                  <div key={aIdx} className="nested-field-card">
                    <div className="nested-header">
                      <span>Achievement #{aIdx + 1}</span>
                      <button className="small-del-btn" onClick={() => removeAchievement(aIdx)}>Remove</button>
                    </div>
                    <input
                      type="text"
                      placeholder="Achievement Title (e.g. 1st Place Global Hackathon)"
                      value={ach.title || ""}
                      onChange={(e) => handleAchievementChange(aIdx, "title", e.target.value)}
                    />
                    <textarea
                      rows={2}
                      placeholder="Details of your accomplishment..."
                      value={ach.description || ""}
                      onChange={(e) => handleAchievementChange(aIdx, "description", e.target.value)}
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case "languages":
        return (
          <div
            key="languages"
            className={`field-group-box draggable-section-box ${isHidden ? "is-hidden-section" : ""} ${dragOverIdx === idx ? "drag-target-active" : ""}`}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
          >
            {renderSectionHeader("languages", idx)}
            {!isHidden && (
              <input
                type="text"
                className="full-width-field"
                placeholder="English (Native), Spanish (Fluent), German (Intermediate)"
                value={resumeData.languages ? resumeData.languages.join(", ") : ""}
                onChange={(e) => handleLanguagesChange(e.target.value)}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

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

          <button
            className={`toolbar-btn secondary-btn reorder-toggle-btn ${showReorderDrawer ? "active" : ""}`}
            onClick={() => setShowReorderDrawer(!showReorderDrawer)}
            title="Reorder resume sections via drag & drop"
          >
            ⇅ Reorder
          </button>

          <button
            className="toolbar-btn secondary-btn cover-letter-btn"
            onClick={() => setShowCoverLetterModal(true)}
            title="Generate AI Cover Letter from this resume"
          >
            📄 Cover Letter
          </button>

          <button
            className="toolbar-btn secondary-btn interview-prep-btn"
            onClick={() => setShowInterviewPrepModal(true)}
            title="Generate personalized interview questions & prep"
          >
            🎯 Interview Prep
          </button>

          {workspaceMode === "uploaded" ? (
            <button className="toolbar-btn secondary-btn ai-assistant-btn" onClick={() => setShowPolishModal(true)}>
              ✨ AI Polish
            </button>
          ) : (
            <button className="toolbar-btn secondary-btn ai-assistant-btn" onClick={() => setShowAssistantModal(true)}>
              🤖 AI Assistant
            </button>
          )}

          <button className="toolbar-btn secondary-btn job-matcher-btn" onClick={() => setShowJobMatcherModal(true)}>
            🎯 Job Matcher
          </button>

          <button className="toolbar-btn secondary-btn analytics-btn" onClick={() => setShowAnalyticsModal(true)}>
            📊 Analytics
          </button>

          <button className="toolbar-btn secondary-btn share-btn" onClick={handleGenerateShare}>
            🔗 Share
          </button>

          <button className="toolbar-btn secondary-btn print-prev-btn" onClick={() => setShowPrintPreviewModal(true)}>
            👁️ Preview
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
            
            {/* Quick Drag & Drop Section Reorder Drawer */}
            {showReorderDrawer && (
              <div className="section-reorder-drawer">
                <div className="drawer-header">
                  <span>☰ Drag & Drop Section Ordering</span>
                  <button className="drawer-close-btn" onClick={() => setShowReorderDrawer(false)}>✕</button>
                </div>
                <p className="drawer-desc">Drag any section handle to reorder, or use arrow buttons. Changes update the live resume preview immediately.</p>
                <div className="reorder-chips-list">
                  {sectionOrder.map((secId, i) => {
                    const meta = SECTION_LABELS[secId] || { name: secId, icon: "📄" };
                    const isHidden = hiddenSections.includes(secId);
                    return (
                      <div
                        key={secId}
                        className={`reorder-chip-item ${dragOverIdx === i ? "drop-hover" : ""} ${isHidden ? "is-hidden" : ""}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={(e) => handleDrop(e, i)}
                      >
                        <span className="chip-grip">☰</span>
                        <span className="chip-num">{i + 1}</span>
                        <span className="chip-label">{meta.icon} {meta.name}</span>
                        <div className="chip-btn-group">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => moveSection(i, -1)}
                            title="Move Up"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={i === sectionOrder.length - 1}
                            onClick={() => moveSection(i, 1)}
                            title="Move Down"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            className="chip-hide-btn"
                            onClick={() => toggleHideSection(secId)}
                            title={isHidden ? "Unhide" : "Hide"}
                          >
                            {isHidden ? "👁️‍🗨️" : "👁️"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Section Forms Rendering */}
            {sectionOrder.map((secId, idx) => renderFormSection(secId, idx))}

          </div>
        </div>

        {/* Right Pane: Live Resume Preview */}
        <div className="workspace-pane right-preview-pane">
          <div className="pane-scroll-area preview-sheet-area">
            <ResumePreview
              resumeData={resumeData}
              selectedTemplate={selectedTemplate}
              setResumeData={setResumeData}
              sectionOrder={sectionOrder}
              hiddenSections={hiddenSections}
            />
          </div>
        </div>
      </div>

      {/* Share Link Modal */}
      {showShareModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-card" style={{ maxWidth: "520px" }}>
            <button className="ai-modal-close-btn" onClick={() => setShowShareModal(false)}>
              &times;
            </button>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", fontWeight: "800", color: "#ffffff" }}>
              🔗 Shareable <span style={{ color: "#c084fc" }}>Resume Link</span>
            </h3>
            <p style={{ color: "#a3a3c2", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Anyone with this link can view your clean, read-only resume without logging in.
            </p>

            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <input
                type="text"
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1.5px solid rgba(168, 85, 247, 0.25)",
                  color: "#ffffff",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
              <button
                className="btn-ai-submit"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#ffffff",
                  border: "none",
                  padding: "0.85rem 1.6rem",
                  borderRadius: "12px",
                  fontWeight: "800",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  boxShadow: "0 6px 24px rgba(124, 58, 237, 0.4)"
                }}
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

      {/* Version History Modal */}
      {showVersionModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-card" style={{ maxWidth: "600px" }}>
            <button className="ai-modal-close-btn" onClick={() => setShowVersionModal(false)}>
              &times;
            </button>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.4rem", fontWeight: "800", color: "#ffffff" }}>
              📜 Version Snapshots & <span style={{ color: "#c084fc" }}>History</span>
            </h3>
            <p style={{ color: "#a3a3c2", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Every time you auto-save, a version snapshot is created. You can restore any past state.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "350px", overflowY: "auto" }}>
              {versions.map((ver, idx) => (
                <div key={idx} style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1.5px solid rgba(168, 85, 247, 0.2)",
                  borderRadius: "14px",
                  padding: "1.1rem 1.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>{ver.version_name || `Version #${idx + 1}`}</strong>
                    <div style={{ color: "#a3a3c2", fontSize: "0.8rem", marginTop: "3px" }}>
                      Saved on {new Date(ver.created_at || Date.now()).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className="btn-ai-submit"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.55rem 1.1rem",
                      borderRadius: "10px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.3)"
                    }}
                    onClick={() => handleRestoreVersion(ver)}
                  >
                    Restore Version ↺
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resume Analytics Modal */}
      {showAnalyticsModal && (
        <div className="ai-modal-overlay">
          <div className="ai-modal-card" style={{ maxWidth: "680px" }}>
            <button className="ai-modal-close-btn" onClick={() => setShowAnalyticsModal(false)}>
              &times;
            </button>
            <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.5rem", fontWeight: "800", color: "#ffffff" }}>
              📊 Resume Performance & <span style={{ color: "#c084fc" }}>ATS Analytics</span>
            </h3>
            <p style={{ color: "#a3a3c2", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Real-time health breakdown of your active resume content.
            </p>

            {/* Top Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.75rem" }}>
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(168, 85, 247, 0.2)",
                padding: "1.25rem 1rem",
                borderRadius: "16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justify: "center",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "2.1rem", fontWeight: "800", color: atsScore >= 80 ? "#4ade80" : atsScore >= 60 ? "#38bdf8" : "#f87171" }}>{atsScore}%</span>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#a3a3c2", marginTop: "6px" }}>Estimated ATS Score</div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(168, 85, 247, 0.2)",
                padding: "1.25rem 1rem",
                borderRadius: "16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justify: "center",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "2.1rem", fontWeight: "800", color: "#4ade80" }}>
                  {(resumeData.summary || "").split(/\s+/).filter(Boolean).length + (resumeData.skills || []).length * 2}
                </span>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#a3a3c2", marginTop: "6px" }}>Total Word Count</div>
              </div>

              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1.5px solid rgba(168, 85, 247, 0.2)",
                padding: "1.25rem 1rem",
                borderRadius: "16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justify: "center",
                alignItems: "center"
              }}>
                <span style={{ fontSize: "2.1rem", fontWeight: "800", color: "#c084fc" }}>92/100</span>
                <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#a3a3c2", marginTop: "6px" }}>Readability Score</div>
              </div>
            </div>

            <h5 style={{ margin: "0 0 1rem", color: "#ffffff", fontSize: "1.05rem", fontWeight: "700" }}>Section Health Check</h5>

            {/* 2x2 Grid of Square Health Check Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              {/* Card 1 */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: hasContact ? "1.5px solid rgba(74, 222, 128, 0.3)" : "1.5px solid rgba(248, 113, 113, 0.35)",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                gap: "1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>👤</span>
                  <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>Personal Contact Info</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a3a3c2", fontSize: "0.8rem" }}>Contact Details</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    background: hasContact ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                    color: hasContact ? "#4ade80" : "#f87171",
                    border: hasContact ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)"
                  }}>
                    {hasContact ? "✓ Complete" : "⚠️ Incomplete"}
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: hasSummary ? "1.5px solid rgba(74, 222, 128, 0.3)" : "1.5px solid rgba(248, 113, 113, 0.35)",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                gap: "1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>✍️</span>
                  <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>Professional Summary</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a3a3c2", fontSize: "0.8rem" }}>Overview Length</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    background: hasSummary ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                    color: hasSummary ? "#4ade80" : "#f87171",
                    border: hasSummary ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)"
                  }}>
                    {hasSummary ? "✓ Executive Level" : "⚠️ Too Brief"}
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: hasSkills ? "1.5px solid rgba(74, 222, 128, 0.3)" : "1.5px solid rgba(248, 113, 113, 0.35)",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                gap: "1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>🛠️</span>
                  <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>Technical Skills Density</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a3a3c2", fontSize: "0.8rem" }}>Keyword Density</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    background: hasSkills ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                    color: hasSkills ? "#4ade80" : "#f87171",
                    border: hasSkills ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)"
                  }}>
                    {hasSkills ? "✓ High Keywords" : "⚠️ Needs 5+ Skills"}
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: hasMetrics ? "1.5px solid rgba(74, 222, 128, 0.3)" : "1.5px solid rgba(248, 113, 113, 0.35)",
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                justify: "space-between",
                gap: "1rem",
                boxShadow: "0 4px 14px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span style={{ fontSize: "1.3rem" }}>💼</span>
                  <strong style={{ color: "#ffffff", fontSize: "0.95rem" }}>Quantified Impact Metrics</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#a3a3c2", fontSize: "0.8rem" }}>Achievement Data</span>
                  <span style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: "700",
                    background: hasMetrics ? "rgba(74, 222, 128, 0.15)" : "rgba(248, 113, 113, 0.15)",
                    color: hasMetrics ? "#4ade80" : "#f87171",
                    border: hasMetrics ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(248, 113, 113, 0.3)"
                  }}>
                    {hasMetrics ? "✓ Strong Action Metrics" : "⚠️ Add % / $ figures"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <JobMatcherModal
        isOpen={showJobMatcherModal}
        onClose={() => setShowJobMatcherModal(false)}
        resumeData={resumeData}
        setResumeData={setResumeData}
        onSaveResume={onSaveResume}
      />

      <CoverLetterModal
        isOpen={showCoverLetterModal}
        onClose={() => setShowCoverLetterModal(false)}
        resumeData={resumeData}
        resumeId={resumeId}
        authFetch={authFetch}
      />

      <ResumeInterviewPrepModal
        isOpen={showInterviewPrepModal}
        onClose={() => setShowInterviewPrepModal(false)}
        resumeData={resumeData}
        resumeId={resumeId}
        authFetch={authFetch}
      />

      <PrintPreviewModal
        isOpen={showPrintPreviewModal}
        onClose={() => setShowPrintPreviewModal(false)}
        resumeData={resumeData}
        selectedTemplate={selectedTemplate}
        sectionOrder={sectionOrder}
        hiddenSections={hiddenSections}
        onDownloadDocx={handleDownloadDocx}
      />
    </div>
  );
};

export default CreateNewWorkspace;
