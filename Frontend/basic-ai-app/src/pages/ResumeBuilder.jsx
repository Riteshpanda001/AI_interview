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

import "./ResumeBuilder.css";

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState("tech");
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

  const handleScrollToTemplates = () => {
    const section = document.getElementById("resume-templates-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="resume-page">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <ResumeHero onBuildClick={handleScrollToTemplates} />

      {/* Features */}
      <ResumeFeatures />

      {/* How It Works */}
      <ResumeHowItWorks />

      {/* Resume Templates */}
      <ResumeTemplates 
        selectedTemplate={selectedTemplate} 
        setSelectedTemplate={setSelectedTemplate} 
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

      {/* Footer */}
      <Footer />

    </div>
  );
};

export default ResumeBuilder;