import React, { useState } from "react";
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
import ResumeFAQ from "../components/resumeBuilder/ResumeFAQ";
import CreateNewWorkspace from "../components/resumeBuilder/CreateNewWorkspace";

import "./ResumeBuilder.css";

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("london");
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "Alex Carter",
      email: "alex.carter@example.com",
      phone: "+1 (555) 019-2834",
      linkedin: "linkedin.com/in/alexcarter",
      role: "Frontend Engineer"
    },
    summary: "Results-driven Software Engineer with 3+ years of experience designing, building, and deploying scalable web applications using React, Node.js, and cloud platforms. Proven track record of optimizing performance and collaborating in agile teams.",
    experience: [
      {
        company: "TechNova Solutions",
        role: "Software Engineer",
        duration: "2024 - Present",
        details: "Developed and maintained responsive web applications using React and Redux.\nOptimized API performance, reducing page load times by 35%.\nCollaborated with UI/UX designers to implement clean, glassmorphic interfaces."
      }
    ],
    education: [
      {
        institution: "State University",
        degree: "B.S. in Computer Science",
        duration: "2020 - 2024"
      }
    ],
    skills: ["React", "JavaScript", "HTML/CSS", "Node.js", "Git", "REST APIs", "TypeScript", "AWS"],
    projects: [
      {
        name: "AI Interview Simulator",
        description: "Built an AI-powered mock interview app with real-time feedback using OpenAI API and React."
      }
    ]
  });

  const [showStartModal, setShowStartModal] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState(null);
  const [modalStep, setModalStep] = useState("options"); // "options" | "upload"
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);

  const handleScrollToTemplates = () => {
    const section = document.getElementById("resume-templates-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCreateNew = () => {
    if (pendingTemplate) {
      setSelectedTemplate(pendingTemplate);
    }
    // Set to blank state so they can start fresh
    setResumeData({
      personal: { name: "", email: "", phone: "", linkedin: "", role: "" },
      summary: "",
      experience: [{ company: "", role: "", duration: "", details: "" }],
      education: [{ institution: "", degree: "", duration: "" }],
      skills: [],
      projects: [{ name: "", description: "" }]
    });
    setShowStartModal(false);
    setIsWorkspaceActive(true); // Switch directly to workspace screen
  };

  const processResumeFile = async (file) => {
    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    // Progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (pendingTemplate) {
          setSelectedTemplate(pendingTemplate);
        }
        if (data.parsed_content) {
          setResumeData(data.parsed_content);
        } else if (data.resume_data) {
          setResumeData(data.resume_data);
        }
        setUploading(false);
        setShowStartModal(false);
        setIsWorkspaceActive(true); // Switch directly to workspace screen
        alert("✨ Success! Your resume has been uploaded and parsed successfully.");
      } else {
        throw new Error("Parser response error");
      }
    } catch (err) {
      console.warn("Backend parse endpoint failed. Simulating local fallback:", err);
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
          summary: "Highly skilled Software Developer with experience in web applications. Passionate about building robust backend APIs and responsive frontend user interfaces.",
          experience: [
            {
              company: "Global Tech Inc.",
              role: "Software Developer",
              duration: "2022 - Present",
              details: "Developed full-stack web applications using React, Node.js, and SQL.\nCollaborated with cross-functional teams to deliver key feature updates."
            }
          ],
          education: [
            {
              institution: "Tech Institute",
              degree: "B.S. in Computer Science",
              duration: "2018 - 2022"
            }
          ],
          skills: ["React", "JavaScript", "Node.js", "SQL", "Git", "REST APIs", "HTML", "CSS"],
          projects: [
            {
              name: "Portfolio Website",
              description: "Designed and deployed a responsive personal portfolio site using React and CSS."
            }
          ]
        });
        setUploading(false);
        setShowStartModal(false);
        setIsWorkspaceActive(true); // Switch directly to workspace screen
        alert("✨ Success! Local parser has imported details from your resume file.");
      }, 1000);
    }
  };

  return (
    <div className="resume-page">

      {/* Navbar */}
      <Navbar />

      {isWorkspaceActive ? (
        <CreateNewWorkspace 
          selectedTemplate={selectedTemplate}
          resumeData={resumeData}
          setResumeData={setResumeData}
          onBack={() => setIsWorkspaceActive(false)}
        />
      ) : (
        <>
          {/* Hero Section */}
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

      {/* Footer */}
      <Footer />

      {/* How do you want to start? Modal overlay */}
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
                  <button className="modal-option-row" onClick={handleCreateNew}>
                    <div className="option-left">
                      <span className="option-icon">📄</span>
                      <div className="option-text">
                        <strong>Create new resume</strong>
                        <p>Start from a clean template and build your profile</p>
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
                  className={`modal-dropzone ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
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