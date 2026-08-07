import React from "react";
import { useNavigate } from "react-router-dom";
import "./ResumeFeatures.css";

const features = [
  {
    id: "ai-writing",
    icon: "🤖",
    title: "AI Resume Writing",
    description:
      "Generate professional resume content with AI. Improve summaries, experience, projects, and achievements instantly.",
    actionText: "Try AI Generator ➔"
  },
  {
    id: "ats-score",
    icon: "🎯",
    title: "ATS Resume Score",
    description:
      "Analyze your resume against ATS systems and receive an instant compatibility score with improvement suggestions.",
    actionText: "Check ATS Score ➔"
  },
  {
    id: "templates",
    icon: "📄",
    title: "Professional Templates",
    description:
      "Choose from beautifully designed ATS-friendly resume templates used by top professionals worldwide.",
    actionText: "Explore Templates ➔"
  },
  {
    id: "keyword-opt",
    icon: "⚡",
    title: "Keyword Optimization",
    description:
      "Optimize your resume with job-specific keywords to increase your chances of passing recruiter screening.",
    actionText: "Optimize Keywords ➔"
  },
  {
    id: "pdf-export",
    icon: "📥",
    title: "PDF & DOCX Export",
    description:
      "Download your resume instantly in high-quality PDF or DOCX formats with one click.",
    actionText: "Download Resume ➔"
  },
  {
    id: "ai-suggestions",
    icon: "🧠",
    title: "AI Resume Suggestions",
    description:
      "Receive intelligent recommendations to improve grammar, achievements, technical skills, and overall resume quality.",
    actionText: "Get AI Feedback ➔"
  }
];

const ResumeFeatures = ({ onOpenAIGenerator, onScrollToTemplates, onOpenWorkspace }) => {
  const navigate = useNavigate();

  const handleCardClick = (featureId) => {
    if (featureId === "ai-writing") {
      if (onOpenAIGenerator) onOpenAIGenerator();
    } else if (featureId === "ats-score") {
      navigate("/ats-score");
    } else if (featureId === "templates") {
      if (onScrollToTemplates) {
        onScrollToTemplates();
      } else {
        const section = document.getElementById("resume-templates-section") || document.querySelector(".templates-section");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    } else if (featureId === "keyword-opt" || featureId === "pdf-export" || featureId === "ai-suggestions") {
      if (onOpenWorkspace) {
        onOpenWorkspace();
      } else {
        const section = document.getElementById("resume-builder-workspace");
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section className="resume-features-section">
      <div className="resume-features-header">
        <span>WHY CHOOSE US</span>
        <h2>
          Powerful AI Resume <span>Builder Features</span>
        </h2>
        <p>
          Everything you need to build a professional,
          ATS-friendly resume that helps you stand out
          and get shortlisted by top companies.
        </p>
      </div>

      <div className="resume-features-grid">
        {features.map((feature) => (
          <div
            className="resume-feature-card interactive-card"
            key={feature.id}
            onClick={() => handleCardClick(feature.id)}
            title={`Click to open ${feature.title}`}
          >
            <div className="feature-icon">
              {feature.icon}
            </div>
            <h3>
              {feature.title}
            </h3>
            <p>
              {feature.description}
            </p>
            <span className="card-action-link">
              {feature.actionText}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeFeatures;