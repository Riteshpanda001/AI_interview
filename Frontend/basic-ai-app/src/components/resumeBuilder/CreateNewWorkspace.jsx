import React, { useState } from "react";
import ResumePreview from "./ResumePreview";
import "./CreateNewWorkspace.css";

const ACTION_VERBS = {
  technical: ["Architected", "Spearheaded", "Programmed", "Optimized", "Refactored", "Deployed", "Integrated", "Debugged", "Automated"],
  leadership: ["Led", "Managed", "Coordinated", "Directed", "Mentored", "Facilitated", "Organized", "Established", "Delegated"],
  impact: ["Increased", "Decreased", "Boosted", "Accelerated", "Generated", "Saved", "Expanded", "Reduced", "Maximised"]
};

const CreateNewWorkspace = ({ selectedTemplate, resumeData, setResumeData, onBack }) => {
  const [activeVerbTab, setActiveVerbTab] = useState("technical");
  const [copiedVerb, setCopiedVerb] = useState("");

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
        ...resumeData.education,
        { institution: "", degree: "", duration: "" }
      ]
    });
  };

  const removeEducation = (index) => {
    const newEdu = resumeData.education.filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      education: newEdu
    });
  };

  const handleProjectChange = (index, field, val) => {
    const newProj = [...resumeData.projects];
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
        ...resumeData.projects,
        { name: "", description: "" }
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVerb(text);
    setTimeout(() => setCopiedVerb(""), 1500);
  };

  // Real-time ATS checklists & scoring logic for 90+ Target
  const hasSummary = resumeData.summary && resumeData.summary.length >= 60;
  const hasContact = resumeData.personal?.name && resumeData.personal?.email && resumeData.personal?.phone && resumeData.personal?.linkedin;
  const hasSkills = resumeData.skills && resumeData.skills.length >= 5;
  const hasProjects = resumeData.projects && resumeData.projects.length >= 1 && resumeData.projects[0].name !== "";
  
  // Checking for metric presence in experience details (e.g. %, $, numbers, or increase/decrease words)
  const hasMetrics = resumeData.experience && resumeData.experience.some(exp => {
    const details = exp.details || "";
    return /[%$]|\b\d+\b/g.test(details);
  });

  // Checklist score calculation out of 100
  let atsScore = 40; // Base score
  if (hasSummary) atsScore += 15;
  if (hasContact) atsScore += 10;
  if (hasSkills) atsScore += 15;
  if (hasProjects) atsScore += 10;
  if (hasMetrics) atsScore += 10;

  // Render Left side guide content
  const renderATSGuide = () => {
    return (
      <div className="ats-guide-panel">
        <div className="score-header-box">
          <div className="score-ring-outer">
            <svg viewBox="0 0 100 100" className="score-circle-svg">
              <circle className="ring-bg" cx="50" cy="50" r="42"></circle>
              <circle
                className="ring-fill"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * atsScore) / 100}
                style={{
                  stroke: atsScore >= 90 ? "#10b981" : atsScore >= 75 ? "#6366f1" : "#f59e0b"
                }}
              ></circle>
            </svg>
            <div className="ring-text-block">
              <h3>{atsScore}%</h3>
              <span>ATS Score</span>
            </div>
          </div>
          <div className="target-badge-block">
            {atsScore >= 90 ? (
              <span className="badge target-hit">🚀 90+ Score Achieved!</span>
            ) : (
              <span className="badge target-miss">🎯 Target: 90% Score</span>
            )}
            <p>Ensure your resume details pass standard digital screening parsers.</p>
          </div>
        </div>

        {/* ATS Requirement Checklist */}
        <div className="guide-card requirements-card">
          <h4>📋 ATS Checklist</h4>
          <ul className="guide-checklist">
            <li className={hasContact ? "done" : ""}>
              <span className="check-bullet"></span>
              <div className="chk-desc">
                <strong>Full Contact Information</strong>
                <p>Include Email, Phone, and LinkedIn link.</p>
              </div>
            </li>
            <li className={hasSummary ? "done" : ""}>
              <span className="check-bullet"></span>
              <div className="chk-desc">
                <strong>Summary Optimization</strong>
                <p>Ensure summary is 60+ chars emphasizing core value.</p>
              </div>
            </li>
            <li className={hasSkills ? "done" : ""}>
              <span className="check-bullet"></span>
              <div className="chk-desc">
                <strong>Categorized Tech Skills (5+)</strong>
                <p>Add at least 5 tech terms or framework keywords.</p>
              </div>
            </li>
            <li className={hasMetrics ? "done" : ""}>
              <span className="check-bullet"></span>
              <div className="chk-desc">
                <strong>Measurable Metrics (%)</strong>
                <p>Add numbers, percentages, or dollar metrics to experiences.</p>
              </div>
            </li>
            <li className={hasProjects ? "done" : ""}>
              <span className="check-bullet"></span>
              <div className="chk-desc">
                <strong>Active Projects list</strong>
                <p>Include at least one project title and details.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Bullet point metric formula */}
        <div className="guide-card metric-formula-card">
          <h4>💡 Google XYZ Metric Formula</h4>
          <p className="formula-desc">
            Structure your achievement bullets to follow: <strong>Accomplished [X], measured by [Y], by doing [Z]</strong>.
          </p>
          <div className="formula-example">
            <em>Example:</em> "Optimized page load speed by 35% (Y) by implementing React Lazy Loading and Webpack compression (Z) across 15+ pages (X)."
          </div>
        </div>

        {/* Action Verbs library */}
        <div className="guide-card action-verbs-card">
          <h4>⚡ Action Verbs Reference</h4>
          <div className="verb-tabs">
            {Object.keys(ACTION_VERBS).map((tab) => (
              <button
                key={tab}
                className={`verb-tab-btn ${activeVerbTab === tab ? "active" : ""}`}
                onClick={() => setActiveVerbTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="verbs-grid">
            {ACTION_VERBS[activeVerbTab].map((verb) => (
              <button
                key={verb}
                className="verb-badge-btn"
                onClick={() => copyToClipboard(verb)}
                title="Click to copy"
              >
                {verb}
              </button>
            ))}
          </div>
          {copiedVerb && <div className="toast-verb">Copied "{copiedVerb}"!</div>}
        </div>
      </div>
    );
  };

  // Render Right side form structured exactly like selected template
  const renderStructuredForm = () => {
    const isSplitLayout = ["dublin", "brussels", "creative_sidebar"].includes(selectedTemplate);

    // Sidebar fields block (for contact info, skills, education)
    const renderSidebarFields = () => (
      <div className="workspace-sub-panel sidebar-fields">
        <div className="panel-section-title">Sidebar Details</div>
        
        {/* Personal Details */}
        <div className="field-group-box">
          <h5>👤 Personal Info</h5>
          <div className="flex-fields">
            <input
              type="text"
              placeholder="Full Name"
              value={resumeData.personal.name || ""}
              onChange={(e) => handlePersonalChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Target Role"
              value={resumeData.personal.role || ""}
              onChange={(e) => handlePersonalChange("role", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={resumeData.personal.email || ""}
              onChange={(e) => handlePersonalChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={resumeData.personal.phone || ""}
              onChange={(e) => handlePersonalChange("phone", e.target.value)}
            />
            <input
              type="text"
              placeholder="LinkedIn / URL"
              className="full-width-field"
              value={resumeData.personal.linkedin || ""}
              onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="field-group-box">
          <h5>🛠️ Technical Skills</h5>
          <input
            type="text"
            className="full-width-field"
            placeholder="React, TypeScript, CSS, Node.js (separated by commas)"
            value={resumeData.skills.join(", ")}
            onChange={(e) => handleSkillsChange(e.target.value)}
          />
        </div>

        {/* Education */}
        <div className="field-group-box">
          <div className="section-inline-title">
            <h5>🎓 Education</h5>
            <button className="small-add-btn" onClick={addEducation}>+ Add</button>
          </div>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="nested-field-card">
              <div className="nested-header">
                <span>Education #{idx + 1}</span>
                {resumeData.education.length > 1 && (
                  <button className="small-del-btn" onClick={() => removeEducation(idx)}>Remove</button>
                )}
              </div>
              <input
                type="text"
                placeholder="Institution"
                value={edu.institution || ""}
                onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
              />
              <input
                type="text"
                placeholder="Degree / Major"
                value={edu.degree || ""}
                onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2020 - 2024)"
                value={edu.duration || ""}
                onChange={(e) => handleEducationChange(idx, "duration", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );

    // Main Content fields block (for summary, experience, projects)
    const renderMainContentFields = () => (
      <div className="workspace-sub-panel main-fields">
        <div className="panel-section-title">Main Content Details</div>

        {/* Summary */}
        <div className="field-group-box">
          <h5>✍️ Professional Summary</h5>
          <textarea
            rows={4}
            placeholder="Briefly describe your career achievements, skills, and values. Keep it above 60 characters for a solid ATS score..."
            value={resumeData.summary || ""}
            onChange={(e) => handleSummaryChange(e.target.value)}
          />
        </div>

        {/* Experience */}
        <div className="field-group-box">
          <div className="section-inline-title">
            <h5>💼 Work Experience</h5>
            <button className="small-add-btn" onClick={addExperience}>+ Add Experience</button>
          </div>
          {resumeData.experience.map((exp, idx) => (
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
                  placeholder="Company"
                  value={exp.company || ""}
                  onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={exp.role || ""}
                  onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Duration (e.g. Jan 2023 - Present)"
                value={exp.duration || ""}
                onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
              />
              <textarea
                rows={3}
                placeholder="List achievements using verbs (e.g. Optimized, Led) and metric percentages (e.g. 35%)..."
                value={exp.details || ""}
                onChange={(e) => handleExperienceChange(idx, "details", e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="field-group-box">
          <div className="section-inline-title">
            <h5>🚀 Projects</h5>
            <button className="small-add-btn" onClick={addProject}>+ Add Project</button>
          </div>
          {resumeData.projects.map((proj, idx) => (
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
              <textarea
                rows={3}
                placeholder="Describe what you built, technologies used, and performance metrics..."
                value={proj.description || ""}
                onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    );

    // Stockholm Header Banner block
    const renderStockholmHeaderFields = () => (
      <div className="stockholm-banner-fields">
        <div className="panel-section-title">Stockholm Top Banner Details</div>
        <div className="field-group-box banner-box">
          <h5>👑 Top Header Info</h5>
          <div className="banner-fields-grid">
            <input
              type="text"
              placeholder="Full Name"
              value={resumeData.personal.name || ""}
              onChange={(e) => handlePersonalChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Professional Role"
              value={resumeData.personal.role || ""}
              onChange={(e) => handlePersonalChange("role", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email Address"
              value={resumeData.personal.email || ""}
              onChange={(e) => handlePersonalChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={resumeData.personal.phone || ""}
              onChange={(e) => handlePersonalChange("phone", e.target.value)}
            />
            <input
              type="text"
              placeholder="LinkedIn / URL"
              className="full-width-field"
              value={resumeData.personal.linkedin || ""}
              onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
            />
          </div>
        </div>
      </div>
    );

    // If Stockholm style:
    if (selectedTemplate === "stockholm") {
      return (
        <div className="structured-form-stockholm">
          {renderStockholmHeaderFields()}
          <div className="stockholm-bottom-workspace">
            {/* Split remaining fields */}
            {renderSidebarFields()}
            {renderMainContentFields()}
          </div>
        </div>
      );
    }

    // If Dublin/Brussels/Creative Sidebar split style:
    if (isSplitLayout) {
      return (
        <div className="structured-form-split">
          {renderSidebarFields()}
          {renderMainContentFields()}
        </div>
      );
    }

    // Default Stacked Style (London, Santiago, Helsinki, Milan, Prague)
    return (
      <div className="structured-form-stacked">
        {/* Render Sidebar fields then Main Content fields stacked nicely */}
        {renderSidebarFields()}
        {renderMainContentFields()}
      </div>
    );
  };

  return (
    <div className="create-workspace-overlay">
      {/* Top Toolbar */}
      <div className="workspace-toolbar">
        <div className="toolbar-left">
          <button className="exit-workspace-btn" onClick={onBack}>
            ← Exit Workspace
          </button>
          <span className="template-badge-label">
            Active Format: <span>{selectedTemplate.toUpperCase()} Layout</span>
          </span>
        </div>
        <div className="toolbar-right">
          <span className="autosave-status">● Auto-saved to Cloud</span>
          <button className="toolbar-btn primary-download" onClick={() => {
            const paper = document.querySelector(".resume-paper");
            if (paper) {
              window.print();
            } else {
              alert("Please preview your resume below to print or download PDF.");
            }
          }}>
            📥 Download PDF
          </button>
        </div>
      </div>

      {/* Editor Body: 2-pane workspace (Inputs & ATS Hub on Left, Visual Preview on Right) */}
      <div className="workspace-editor-body two-pane">
        
        {/* Left Column: Form inputs at the top, ATS Guide checklist at the bottom */}
        <div className="workspace-pane left-form-pane">
          <div className="pane-scroll-area">
            
            {/* Section 1: Structured Form Inputs */}
            <div className="pane-title-header form-header-embedded">
              <h3>✍️ Structure Details</h3>
              <p>Add details arranged in the structure of the selected template.</p>
            </div>
            <div className="form-content-area">
              {renderStructuredForm()}
            </div>

            {/* Divider */}
            <div className="workspace-section-divider"></div>

            {/* Section 2: ATS Guide and Checklist */}
            <div className="pane-title-header guide-header-embedded">
              <h3>📈 ATS Optimization Hub</h3>
              <p>Refine content metrics & checklist items to hit a 90% score.</p>
            </div>
            <div className="guide-content-area">
              {renderATSGuide()}
            </div>

          </div>
        </div>

        {/* Right Column: Visual Resume Template Preview */}
        <div className="workspace-pane right-preview-pane">
          <div className="pane-title-header">
            <h3>👁️ Live Visual Preview</h3>
            <p>Observe edits update dynamically on your A4 document sheet.</p>
          </div>
          <div className="pane-scroll-area preview-sheet-area">
            <ResumePreview 
              resumeData={resumeData}
              selectedTemplate={selectedTemplate}
              setResumeData={setResumeData}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateNewWorkspace;
