import React, { useState } from "react";
import "./ResumeForm.css";

const ResumeForm = ({ resumeData, setResumeData, isDemoMode = false }) => {
  const [activeTab, setActiveTab] = useState("personal");

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

  const handleCertChange = (index, field, val) => {
    const newCerts = [...(resumeData.certifications || [])];
    if (!newCerts[index]) newCerts[index] = { title: "", issuer: "", year: "" };
    newCerts[index][field] = val;
    setResumeData({
      ...resumeData,
      certifications: newCerts
    });
  };

  const addCert = () => {
    setResumeData({
      ...resumeData,
      certifications: [...(resumeData.certifications || []), { title: "", issuer: "", year: "" }]
    });
  };

  const removeCert = (index) => {
    const newCerts = (resumeData.certifications || []).filter((_, i) => i !== index);
    setResumeData({
      ...resumeData,
      certifications: newCerts
    });
  };

  const handleSkillsChange = (val) => {
    const list = val.split(",").map((s) => s.trim());
    setResumeData({
      ...resumeData,
      skills: list
    });
  };

  return (
    <section id="resume-form-section" className="form-section">
      <div className="section-header">
        <span className="form-badge">{isDemoMode ? "💡 INTERACTIVE DEMO INPUT" : "✏️ DATA INPUT"}</span>
        <h2 className="section-title">
          Build Your <span>Resume Details</span>
        </h2>
        <p className="section-subtitle">
          {isDemoMode
            ? "Test entering your information below to see how your ATS score (90-100) and Live Preview update in real time. Log in & launch full workspace to save and download."
            : "Fill out the sections below. Our AI suggestions engine and ATS checker will analyze your inputs in real time."}
        </p>
      </div>

      <div className="form-container">
        {/* Navigation Tabs */}
        <div className="form-tabs">
          <button
            className={`tab-btn ${activeTab === "personal" ? "active" : ""}`}
            onClick={() => setActiveTab("personal")}
          >
            👤 Personal Info
          </button>
          <button
            className={`tab-btn ${activeTab === "experience" ? "active" : ""}`}
            onClick={() => setActiveTab("experience")}
          >
            💼 Experience
          </button>
          <button
            className={`tab-btn ${activeTab === "education" ? "active" : ""}`}
            onClick={() => setActiveTab("education")}
          >
            🎓 Education
          </button>
          <button
            className={`tab-btn ${activeTab === "projects" ? "active" : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            🚀 Projects
          </button>
          <button
            className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
            onClick={() => setActiveTab("skills")}
          >
            🛠️ Skills
          </button>
          <button
            className={`tab-btn ${activeTab === "certifications" ? "active" : ""}`}
            onClick={() => setActiveTab("certifications")}
          >
            📜 Certifications
          </button>
        </div>

        {/* Tab Contents */}
        <div className="form-content-box">
          {activeTab === "personal" && (
            <div className="form-pane fade-in">
              <h3>Personal Details & Summary</h3>
              <div className="input-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personal.name}
                    onChange={(e) => handlePersonalChange("name", e.target.value)}
                    placeholder="e.g. Alex Carter"
                  />
                </div>
                <div className="input-group">
                  <label>Professional Role</label>
                  <input
                    type="text"
                    value={resumeData.personal.role}
                    onChange={(e) => handlePersonalChange("role", e.target.value)}
                    placeholder="e.g. Frontend Engineer"
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={resumeData.personal.email}
                    onChange={(e) => handlePersonalChange("email", e.target.value)}
                    placeholder="e.g. alex@example.com"
                  />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.personal.phone}
                    onChange={(e) => handlePersonalChange("phone", e.target.value)}
                    placeholder="e.g. +1 (555) 019-2834"
                  />
                </div>
                <div className="input-group full-width">
                  <label>LinkedIn / Portfolio URL</label>
                  <input
                    type="text"
                    value={resumeData.personal.linkedin}
                    onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                    placeholder="e.g. linkedin.com/in/alexcarter"
                  />
                </div>
                <div className="input-group full-width">
                  <label>Professional Summary</label>
                  <textarea
                    rows={4}
                    value={resumeData.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    placeholder="Briefly describe your career achievements, skills, and values..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "experience" && (
            <div className="form-pane fade-in">
              <div className="pane-header">
                <h3>Work Experience</h3>
                <button className="add-btn" onClick={addExperience}>
                  + Add Experience
                </button>
              </div>

              {resumeData.experience.map((exp, idx) => (
                <div className="nested-item-card" key={idx}>
                  <div className="item-header">
                    <h4>Experience #{idx + 1}</h4>
                    {resumeData.experience.length > 1 && (
                      <button className="remove-btn" onClick={() => removeExperience(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="input-grid">
                    <div className="input-group">
                      <label>Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(idx, "company", e.target.value)}
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div className="input-group">
                      <label>Role</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(idx, "role", e.target.value)}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    <div className="input-group full-width">
                      <label>Duration / Dates</label>
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleExperienceChange(idx, "duration", e.target.value)}
                        placeholder="e.g. Jan 2022 - Present"
                      />
                    </div>
                    <div className="input-group full-width">
                      <label>Job Description / Responsibilities</label>
                      <textarea
                        rows={4}
                        value={exp.details}
                        onChange={(e) => handleExperienceChange(idx, "details", e.target.value)}
                        placeholder="List your key contributions and achievements..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "education" && (
            <div className="form-pane fade-in">
              <div className="pane-header">
                <h3>Education History</h3>
                <button className="add-btn" onClick={addEducation}>
                  + Add Education
                </button>
              </div>

              {resumeData.education.map((edu, idx) => (
                <div className="nested-item-card" key={idx}>
                  <div className="item-header">
                    <h4>Education #{idx + 1}</h4>
                    {resumeData.education.length > 1 && (
                      <button className="remove-btn" onClick={() => removeEducation(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="input-grid">
                    <div className="input-group">
                      <label>Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleEducationChange(idx, "institution", e.target.value)}
                        placeholder="e.g. Stanford University"
                      />
                    </div>
                    <div className="input-group">
                      <label>Degree / Major</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(idx, "degree", e.target.value)}
                        placeholder="e.g. B.S. in Computer Science"
                      />
                    </div>
                    <div className="input-group full-width">
                      <label>Duration / Dates</label>
                      <input
                        type="text"
                        value={edu.duration}
                        onChange={(e) => handleEducationChange(idx, "duration", e.target.value)}
                        placeholder="e.g. 2018 - 2022"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "projects" && (
            <div className="form-pane fade-in">
              <div className="pane-header">
                <h3>Projects</h3>
                <button className="add-btn" onClick={addProject}>
                  + Add Project
                </button>
              </div>

              {resumeData.projects.map((proj, idx) => (
                <div className="nested-item-card" key={idx}>
                  <div className="item-header">
                    <h4>Project #{idx + 1}</h4>
                    {resumeData.projects.length > 1 && (
                      <button className="remove-btn" onClick={() => removeProject(idx)}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="input-grid">
                    <div className="input-group full-width">
                      <label>Project Title</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleProjectChange(idx, "name", e.target.value)}
                        placeholder="e.g. E-Commerce Backend"
                      />
                    </div>
                    <div className="input-group full-width">
                      <label>Description / Technical Details</label>
                      <textarea
                        rows={4}
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                        placeholder="Briefly describe what you built, technologies used, and outcomes..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="form-pane fade-in">
              <h3>Technical Skills</h3>
              <div className="input-grid">
                <div className="input-group full-width">
                  <label>Skills List (separated by commas)</label>
                  <input
                    type="text"
                    value={resumeData.skills.join(", ")}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="e.g. React, TypeScript, Node.js, AWS, Python, Kubernetes"
                  />
                  <small style={{ color: "#6b7280", marginTop: "8px", display: "block" }}>
                    Tip: Separate skills with commas. Our ATS scanner compares these keywords with standard job requirements.
                  </small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "certifications" && (
            <div className="form-pane fade-in">
              <div className="pane-header">
                <h3>Certifications & Credentials</h3>
                <button type="button" className="add-btn" onClick={addCert}>
                  + Add Certification
                </button>
              </div>

              {(resumeData.certifications || []).length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No certifications added yet. Click above to add your certifications.</p>
              ) : (
                (resumeData.certifications || []).map((cert, index) => (
                  <div key={index} className="form-card">
                    <div className="card-header">
                      <h4>Certification #{index + 1}</h4>
                      <button type="button" className="remove-btn" onClick={() => removeCert(index)}>
                        Remove
                      </button>
                    </div>
                    <div className="input-grid">
                      <div className="input-group">
                        <label>Certification Name / Title</label>
                        <input
                          type="text"
                          value={cert.title || ""}
                          onChange={(e) => handleCertChange(index, "title", e.target.value)}
                          placeholder="e.g. AWS Certified Solutions Architect"
                        />
                      </div>
                      <div className="input-group">
                        <label>Issuing Organization</label>
                        <input
                          type="text"
                          value={cert.issuer || ""}
                          onChange={(e) => handleCertChange(index, "issuer", e.target.value)}
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                      <div className="input-group">
                        <label>Year / Date</label>
                        <input
                          type="text"
                          value={cert.year || ""}
                          onChange={(e) => handleCertChange(index, "year", e.target.value)}
                          placeholder="e.g. 2024"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResumeForm;
