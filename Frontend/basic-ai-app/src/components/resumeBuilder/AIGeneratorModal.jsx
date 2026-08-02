import React, { useState } from "react";
import "./AIGeneratorModal.css";

const STEPS = [
  { id: 1, label: "1. Role & Contact", title: "Target Role & Contact Info" },
  { id: 2, label: "2. Summary", title: "Professional Summary" },
  { id: 3, label: "3. Skills", title: "Technical & Soft Skills" },
  { id: 4, label: "4. Experience", title: "Work Experience" },
  { id: 5, label: "5. Projects", title: "Key Projects" },
  { id: 6, label: "6. Education", title: "Education & Degree" },
  { id: 7, label: "7. Certs & ATS", title: "Certifications & Target JD" }
];

const AIGeneratorModal = ({ isOpen, onClose, onGenerate }) => {
  const [activeStep, setActiveStep] = useState(1);

  // Step 1: Role & Contact
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Mid-Level");
  const [industry, setIndustry] = useState("Software & Technology");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Step 2: Summary
  const [summary, setSummary] = useState("");

  // Step 3: Skills
  const [skills, setSkills] = useState("");

  // Step 4: Experience
  const [experience, setExperience] = useState([
    { company: "", role: "", duration: "", details: "" }
  ]);

  // Step 5: Projects
  const [projects, setProjects] = useState([
    { name: "", description: "" }
  ]);

  // Step 6: Education
  const [education, setEducation] = useState([
    { institution: "", degree: "", duration: "" }
  ]);

  // Step 7: Certifications & JD
  const [certifications, setCertifications] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handlers for dynamic list entries
  const handleExpChange = (idx, field, val) => {
    const updated = [...experience];
    updated[idx][field] = val;
    setExperience(updated);
  };
  const addExp = () => setExperience([...experience, { company: "", role: "", duration: "", details: "" }]);
  const removeExp = (idx) => setExperience(experience.filter((_, i) => i !== idx));

  const handleProjChange = (idx, field, val) => {
    const updated = [...projects];
    updated[idx][field] = val;
    setProjects(updated);
  };
  const addProj = () => setProjects([...projects, { name: "", description: "" }]);
  const removeProj = (idx) => setProjects(projects.filter((_, i) => i !== idx));

  const handleEduChange = (idx, field, val) => {
    const updated = [...education];
    updated[idx][field] = val;
    setEducation(updated);
  };
  const addEdu = () => setEducation([...education, { institution: "", degree: "", duration: "" }]);
  const removeEdu = (idx) => setEducation(education.filter((_, i) => i !== idx));

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
        full_name: fullName.trim() || "Candidate Name",
        email: email.trim() || "candidate@example.com",
        phone: phone.trim() || "+1 (555) 019-2834",
        linkedin: linkedin.trim() || "linkedin.com/in/candidate",
        summary: summary.trim(),
        experience: experience,
        projects: projects,
        education: education,
        certifications: certifications,
        job_description: jobDescription.trim(),
        bio_prompt: summary.trim()
      });
    } catch (err) {
      console.error("Failed to generate AI resume:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-card wizard-card-7step">
        <button className="ai-modal-close-btn" onClick={onClose} disabled={loading}>
          &times;
        </button>

        <div className="ai-modal-header">
          <span className="ai-header-sparkle">✨</span>
          <div>
            <h2>AI Resume Generator</h2>
            <p className="ai-modal-sub">
              Enter your resume details step-by-step. Our AI will analyze your inputs, resolve errors, optimize action verbs, and build a high ATS score resume.
            </p>
          </div>
        </div>

        {/* Clean Step Indicator */}
        <div className="step-header-badge">
          <span>Step {activeStep} of 7: {STEPS[activeStep - 1].title}</span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Role & Contact */}
          {activeStep === 1 && (
            <div className="wizard-pane fade-in">
              <div className="ai-form-group">
                <label>Target Job Role / Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer, Product Manager"
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
                    <option value="Finance & Fintech">Finance & Fintech</option>
                    <option value="Healthcare & HealthTech">Healthcare & HealthTech</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Artificial Intelligence / ML">AI / Machine Learning</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                </div>
              </div>

              <div className="ai-form-row">
                <div className="ai-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Mercer"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="ai-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. alex.mercer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="ai-form-row">
                <div className="ai-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="ai-form-group">
                  <label>LinkedIn / Portfolio URL</label>
                  <input
                    type="text"
                    placeholder="e.g. linkedin.com/in/alexmercer"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                  />
                </div>
              </div>

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(2)}>
                  Next: Summary →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Professional Summary */}
          {activeStep === 2 && (
            <div className="wizard-pane fade-in">
              <div className="ai-form-group">
                <label>Professional Summary / Draft Bio</label>
                <textarea
                  rows={5}
                  placeholder="Enter a brief summary of your background, experience, and career goals. AI will polish grammar, tone, and action verbs."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </div>

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(1)}>
                  ← Back
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(3)}>
                  Next: Skills →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Technical & Soft Skills */}
          {activeStep === 3 && (
            <div className="wizard-pane fade-in">
              <div className="ai-form-group">
                <label>Technical Skills & Core Competencies (comma separated)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. React, TypeScript, Node.js, Python, FastAPI, PostgreSQL, Docker, AWS, Git, REST APIs"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(2)}>
                  ← Back
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(4)}>
                  Next: Experience →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Work Experience */}
          {activeStep === 4 && (
            <div className="wizard-pane fade-in">
              <div className="wizard-section-header">
                <h3>Work Experience Entries</h3>
                <button type="button" className="add-entry-btn" onClick={addExp}>+ Add Experience</button>
              </div>

              {experience.map((exp, idx) => (
                <div key={idx} className="entry-card">
                  <div className="entry-header">
                    <span>Experience #{idx + 1}</span>
                    {experience.length > 1 && (
                      <button type="button" className="remove-entry-btn" onClick={() => removeExp(idx)}>Remove</button>
                    )}
                  </div>

                  <div className="ai-form-row">
                    <div className="ai-form-group">
                      <label>Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. TechCorp Solutions"
                        value={exp.company}
                        onChange={(e) => handleExpChange(idx, "company", e.target.value)}
                      />
                    </div>
                    <div className="ai-form-group">
                      <label>Job Title / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Software Engineer"
                        value={exp.role}
                        onChange={(e) => handleExpChange(idx, "role", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ai-form-group">
                    <label>Duration / Dates</label>
                    <input
                      type="text"
                      placeholder="e.g. 2022 - Present"
                      value={exp.duration}
                      onChange={(e) => handleExpChange(idx, "duration", e.target.value)}
                    />
                  </div>

                  <div className="ai-form-group">
                    <label>Key Responsibilities & Achievements</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what you worked on. AI will quantify achievements and add strong action verbs."
                      value={exp.details}
                      onChange={(e) => handleExpChange(idx, "details", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(3)}>
                  ← Back
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(5)}>
                  Next: Projects →
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Key Projects */}
          {activeStep === 5 && (
            <div className="wizard-pane fade-in">
              <div className="wizard-section-header">
                <h3>Key Projects</h3>
                <button type="button" className="add-entry-btn" onClick={addProj}>+ Add Project</button>
              </div>

              {projects.map((proj, idx) => (
                <div key={idx} className="entry-card">
                  <div className="entry-header">
                    <span>Project #{idx + 1}</span>
                    {projects.length > 1 && (
                      <button type="button" className="remove-entry-btn" onClick={() => removeProj(idx)}>Remove</button>
                    )}
                  </div>

                  <div className="ai-form-group">
                    <label>Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AI Resume Builder Platform"
                      value={proj.name}
                      onChange={(e) => handleProjChange(idx, "name", e.target.value)}
                    />
                  </div>

                  <div className="ai-form-group">
                    <label>Project Description & Tech Stack</label>
                    <textarea
                      rows={3}
                      placeholder="Describe project feature and impact. AI will optimize architecture description."
                      value={proj.description}
                      onChange={(e) => handleProjChange(idx, "description", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(4)}>
                  ← Back
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(6)}>
                  Next: Education →
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Education */}
          {activeStep === 6 && (
            <div className="wizard-pane fade-in">
              <div className="wizard-section-header">
                <h3>Education & Degrees</h3>
                <button type="button" className="add-entry-btn" onClick={addEdu}>+ Add Education</button>
              </div>

              {education.map((edu, idx) => (
                <div key={idx} className="entry-card">
                  <div className="entry-header">
                    <span>Education #{idx + 1}</span>
                    {education.length > 1 && (
                      <button type="button" className="remove-entry-btn" onClick={() => removeEdu(idx)}>Remove</button>
                    )}
                  </div>

                  <div className="ai-form-row">
                    <div className="ai-form-group">
                      <label>Institution / University</label>
                      <input
                        type="text"
                        placeholder="e.g. State University"
                        value={edu.institution}
                        onChange={(e) => handleEduChange(idx, "institution", e.target.value)}
                      />
                    </div>
                    <div className="ai-form-group">
                      <label>Degree / Major</label>
                      <input
                        type="text"
                        placeholder="e.g. B.S. in Computer Science"
                        value={edu.degree}
                        onChange={(e) => handleEduChange(idx, "degree", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="ai-form-group">
                    <label>Duration / Graduation Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2019 - 2023"
                      value={edu.duration}
                      onChange={(e) => handleEduChange(idx, "duration", e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(5)}>
                  ← Back
                </button>
                <button type="button" className="btn-ai-submit" onClick={() => setActiveStep(7)}>
                  Next: Certifications & ATS →
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Certifications & Target JD */}
          {activeStep === 7 && (
            <div className="wizard-pane fade-in">
              <div className="ai-form-group">
                <label>Certifications (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. AWS Certified Solutions Architect, Meta Certified Front-End Developer"
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                />
              </div>

              <div className="ai-form-group">
                <label>Target Job Description / Key Keywords (Optional for 95%+ ATS Score)</label>
                <textarea
                  rows={3}
                  placeholder="Paste target job description text here. AI will extract keywords and align your resume."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="ai-modal-footer">
                <button type="button" className="btn-ai-cancel" onClick={() => setActiveStep(6)} disabled={loading}>
                  ← Back
                </button>
                <button type="submit" className="btn-ai-submit" disabled={loading}>
                  {loading ? "⚡ Analyzing Errors & Building ATS Resume..." : "✨ Generate & Optimize Resume with AI"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AIGeneratorModal;
