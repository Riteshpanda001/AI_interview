import React from "react";
import { useNavigate } from "react-router-dom";
import "./Features.css";
import useRequireAuth from "../hooks/useRequireAuth";

const Features = () => {
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  const features = [
    {
      icon: "🎤",
      title: "AI Mock Interviews",
      description:
        "Practice realistic interviews with AI and get instant feedback.",
      path: "/mock-interview",
    },
    {
      icon: "📄",
      title: "ATS Resume Analyzer",
      description:
        "Upload your resume and receive ATS scores and improvement suggestions.",
      path: "/ats-score",
    },
    {
      icon: "💻",
      title: "Coding Interview Practice",
      description:
        "Solve coding problems in a real interview environment.",
      path: "/coding-practice",
    },
    {
      icon: "🏢",
      title: "Company-Specific Questions",
      description:
        "Prepare for Google, Microsoft, Amazon, TCS, Infosys, and more.",
      path: "/company-preparation",
    },
    {
      icon: "📊",
      title: "Performance Analytics",
      description:
        "Track communication, confidence, and technical performance.",
      path: "/mock-interviews",
    },
    {
      icon: "🎯",
      title: "Personalized Roadmap",
      description:
        "Get a customized preparation plan based on your goals.",
      path: "/company-preparation",
    },
  ];

  return (
    <section className="features-section" id="features">
      <div className="features-container">

        <div className="features-header">
          <h2>Powerful Features to 
            <span> Ace Every Interview</span>
          </h2>

          <p>
            Everything you need to prepare, practice, and succeed
            in technical, HR, and coding interviews.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              className="feature-card" 
              key={index}
              onClick={() => navigate(feature.path)}
              style={{ cursor: "pointer" }}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;