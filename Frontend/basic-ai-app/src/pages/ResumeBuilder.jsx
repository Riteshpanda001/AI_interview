import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import ResumeHero from "../components/resumeBuilder/ResumeHero";
import ResumeFeatures from "../components/resumeBuilder/ResumeFeatures";
import ResumeHowItWorks from "../components/resumeBuilder/ResumeHowItWorks";
import ResumeTemplates from "../components/resumeBuilder/ResumeTemplates";
import ResumeRoleTemplates from "../components/resumeBuilder/ResumeRoleTemplates";
import ResumeForm from "../components/resumeBuilder/ResumeForm";
import ResumePreview from "../components/resumeBuilder/ResumePreview";
import AIResumeSuggestions from "../components/resumeBuilder/AIResumeSuggestions";
import ATSResumeScore from "../components/resumeBuilder/ATSResumeScore";
import CreateNewWorkspace from "../components/resumeBuilder/CreateNewWorkspace";
import AIGeneratorModal from "../components/resumeBuilder/AIGeneratorModal";
import ResumeFAQ from "../components/resumeBuilder/ResumeFAQ";

import "./ResumeBuilder.css";

import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

const ResumeBuilder = () => {
  const { authFetch } = useAuth();
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("london");
  const [currentResumeId, setCurrentResumeId] = useState(null);
  
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "Alex Carter",
      email: "alex.carter@example.com",
      phone: "+1 (555) 019-2834",
      linkedin: "linkedin.com/in/alexcarter",
      role: "Frontend Engineer"
    },
    summary: "Results-driven Software Engineer with 3+ years of experience designing, building, and deploying scalable web applications using React, Node.js, and cloud platforms.",
    experience: [
      {
        company: "TechNova Solutions",
        role: "Software Engineer",
        duration: "2024 - Present",
        details: "Developed responsive web applications using React and Redux.\nOptimized API performance, reducing page load times by 35%."
      }
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S. in Computer Science",
        duration: "2020 - 2024"
      }
    ],
    skills: ["React", "JavaScript", "Node.js", "Python", "Git", "REST APIs"],
    projects: [
      {
        name: "PrepNova AI Platform",
        description: "Built an AI-powered mock interview simulator with real-time feedback."
      }
    ]
  });

  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showAIGeneratorModal, setShowAIGeneratorModal] = useState(false);
  const [modalStep, setModalStep] = useState("options"); // "options" | "upload"
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const handleScrollToTemplates = () => {
    const section = document.getElementById("resume-templates-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleStartBuildingClick = () => {
    setPendingTemplate(selectedTemplate);
    setShowStartModal(true);
  };

  const handleSelectRoleTemplate = (roleData) => {
    setResumeData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        role: roleData.title
      },
      skills: roleData.skills,
      summary: roleData.summary
    }));
    setIsWorkspaceActive(true);
    const section = document.getElementById("resume-builder-workspace");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSaveResume = async (updatedData, template) => {
    const payload = {
      id: currentResumeId,
      title: updatedData.personal?.name ? `${updatedData.personal.name}'s Resume` : "Untitled Resume",
      selected_template: template || selectedTemplate,
      resume_data: updatedData,
      ats_score: 85
    };

    try {
      const res = await authFetch(`${API_BASE_URL}/resume/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        if (saved.id) setCurrentResumeId(saved.id);
      }
    } catch (err) {
      console.warn("Error auto-saving to server:", err);
    }
  };

  const handleCreateBlank = () => {
    if (pendingTemplate) {
      setSelectedTemplate(pendingTemplate);
    }
    setCurrentResumeId(null);
    setResumeData({
      personal: { name: "", email: "", phone: "", linkedin: "", role: "" },
      summary: "",
      experience: [{ company: "", role: "", duration: "", details: "" }],
      education: [{ institution: "", degree: "", duration: "" }],
      skills: [],
      projects: [{ name: "", description: "" }]
    });
    setShowStartModal(false);
    setIsWorkspaceActive(true);
  };

  const handleAIGeneratedSubmit = async (params) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/resume/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const generated = await res.json();
        setResumeData(generated);
        setShowAIGeneratorModal(false);
        setIsWorkspaceActive(true);
        alert("✨ AI Resume generated successfully!");
      } else {
        throw new Error("AI Generator endpoint error");
      }
    } catch (err) {
      console.warn("AI generator server offline, running fallback generator:", err);
      setResumeData({
        personal: {
          name: "Jordan Lee",
          email: "jordan.lee@example.com",
          phone: "+1 (555) 789-0123",
          linkedin: "linkedin.com/in/jordanlee",
          role: params.role || "Software Specialist"
        },
        summary: `Accomplished ${params.experience_level || "Mid-Level"} ${params.role} in ${params.industry || "Technology"} with hands-on experience building scalable applications and optimizing workflows.`,
        experience: [
          {
            company: "Tech Corp",
            role: params.role || "Developer",
            duration: "2022 - Present",
            details: `Spearheaded engineering initiatives for high-traffic web apps.\nOptimized API query performance by 35% and introduced automated CI/CD.`
          }
        ],
        education: [
          {
            institution: "State University",
            degree: "B.S. in Computer Science",
            duration: "2018 - 2022"
          }
        ],
        skills: params.key_skills ? params.key_skills.split(",").map(s=>s.trim()) : ["React", "JavaScript", "Python", "Node.js", "AWS", "Git"],
        projects: [
          {
            name: `${params.role} Platform`,
            description: "Designed high performance cloud platform with real-time feedback."
          }
        ]
      });
      setShowAIGeneratorModal(false);
      setIsWorkspaceActive(true);
    }
  };

  const processResumeFile = async (file) => {
    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 80);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await authFetch(`${API_BASE_URL}/resume/upload`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (pendingTemplate) {
          setSelectedTemplate(pendingTemplate);
        }
        if (data.parsed_content) {
          setResumeData(data.parsed_content);
        }
        if (data.id) setCurrentResumeId(data.id);
        setUploading(false);
        setShowStartModal(false);
        setIsWorkspaceActive(true);
        alert("✨ Success! Resume uploaded & parsed successfully.");
      } else {
        throw new Error("Upload error");
      }
    } catch (err) {
      console.warn("Upload endpoint failed. Using fallback:", err);
      setTimeout(() => {
        if (pendingTemplate) {
          setSelectedTemplate(pendingTemplate);
        }
        setResumeData({
          personal: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+1 (555) 123-4567",
            linkedin: "linkedin.com/in/johndoe",
            role: "Software Developer"
          },
          summary: "Highly skilled Software Developer with experience in web applications and backend APIs.",
          experience: [
            {
              company: "Global Tech Inc.",
              role: "Software Developer",
              duration: "2022 - Present",
              details: "Developed full-stack web applications using React, Node.js, and SQL."
            }
          ],
          education: [
            {
              institution: "Tech Institute",
              degree: "B.S. in Computer Science",
              duration: "2018 - 2022"
            }
          ],
          skills: ["React", "JavaScript", "Node.js", "SQL", "Git", "REST APIs"],
          projects: [
            {
              name: "Portfolio Website",
              description: "Designed and deployed a responsive personal portfolio site."
            }
          ]
        });
        setUploading(false);
        setShowStartModal(false);
        setIsWorkspaceActive(true);
      }, 800);
    }
  };

  return (
    <div className="resume-page">
      <Navbar />

      {isWorkspaceActive ? (
        <CreateNewWorkspace
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          resumeData={resumeData}
          setResumeData={setResumeData}
          currentResumeId={currentResumeId}
          onSaveResume={handleSaveResume}
          onBack={() => setIsWorkspaceActive(false)}
        />
      ) : (
        <>
          {/* Landing Hero Section */}
          <ResumeHero onBuildClick={handleScrollToTemplates} />
          
          {/* Features */}
          <ResumeFeatures />

          {/* How It Works */}
          <ResumeHowItWorks />

          {/* Resume Templates */}
          <ResumeTemplates
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={(tplId) => {
              setPendingTemplate(tplId);
              setModalStep("options");
              setShowStartModal(true);
            }}
          />

          {/* Role Templates Pre-fill */}
          <ResumeRoleTemplates
            onSelectRole={(roleData) => {
              setResumeData(roleData);
              setIsWorkspaceActive(true);
            }}
          />

          {/* Resume Form */}
          <ResumeForm
            resumeData={resumeData}
            setResumeData={setResumeData}
          />

          {/* Live Resume Preview */}
          <ResumePreview
            resumeData={resumeData}
            selectedTemplate={selectedTemplate}
            setResumeData={setResumeData}
          />

          {/* AI Suggestions */}
          <AIResumeSuggestions
            setResumeData={setResumeData}
          />

          {/* ATS Resume Score */}
          <ATSResumeScore
            resumeData={resumeData}
          />

          {/* FAQ */}
          <ResumeFAQ />
        </>
      )}

      <Footer />

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={showAIGeneratorModal}
        onClose={() => setShowAIGeneratorModal(false)}
        onGenerate={handleAIGeneratedSubmit}
      />

      {/* Start Modal Overlay */}
      {showStartModal && (
        <div className="modal-overlay select-modal">
          <div className="modal-card">
            <button className="modal-close-btn" onClick={() => setShowStartModal(false)}>
              &times;
            </button>

            {modalStep === "options" ? (
              <div className="modal-content select-start">
                <h2>How do you want to start?</h2>
                <div className="modal-options">
                  <button className="modal-option-row" onClick={handleCreateBlank}>
                    <div className="option-left">
                      <span className="option-icon">📄</span>
                      <div className="option-text">
                        <strong>Create new blank resume</strong>
                        <p>Start fresh from a clean template</p>
                      </div>
                    </div>
                    <span className="option-arrow">➔</span>
                  </button>

                  <button className="modal-option-row" onClick={() => { setShowStartModal(false); setShowAIGeneratorModal(true); }}>
                    <div className="option-left">
                      <span className="option-icon">✨</span>
                      <div className="option-text">
                        <strong>Generate with AI</strong>
                        <p>Build a tailored resume from your target job title</p>
                      </div>
                    </div>
                    <span className="option-arrow">➔</span>
                  </button>

                  <button className="modal-option-row" onClick={() => setModalStep("upload")}>
                    <div className="option-left">
                      <span className="option-icon">📤</span>
                      <div className="option-text">
                        <strong>Upload existing resume</strong>
                        <p>Import and pre-fill details from PDF or DOCX</p>
                      </div>
                    </div>
                    <span className="option-arrow">➔</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="modal-content select-upload">
                <h2>Upload your resume</h2>
                <p className="modal-sub">Import details automatically from PDF or DOCX</p>
                <div
                  className="modal-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      processResumeFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    type="file"
                    id="modalFileInput"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processResumeFile(e.target.files[0]);
                      }
                    }}
                    hidden
                  />
                  {!uploading ? (
                    <label htmlFor="modalFileInput" className="dropzone-label">
                      <span className="drop-icon">📁</span>
                      <strong>Drag & Drop file here</strong>
                      <span>or click to browse</span>
                      <small>Supports PDF, DOCX up to 5MB</small>
                    </label>
                  ) : (
                    <div className="upload-progress-wrapper">
                      <div className="progress-bar-bg">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span>{progress}% Uploading & Parsing...</span>
                      <small>{fileName}</small>
                    </div>
                  )}
                </div>
                <button className="modal-back-btn" onClick={() => setModalStep("options")} disabled={uploading}>
                  ← Back to options
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;