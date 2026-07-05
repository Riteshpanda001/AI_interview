import React from "react";
import "./Features.css";

const Features = () => {
  const features = [
    {
      icon: "🎤",
      title: "AI Mock Interviews",
      description:
        "Practice realistic interviews with AI and get instant feedback.",
    },
    {
      icon: "📄",
      title: "ATS Resume Analyzer",
      description:
        "Upload your resume and receive ATS scores and improvement suggestions.",
    },
    {
      icon: "💻",
      title: "Coding Interview Practice",
      description:
        "Solve coding problems in a real interview environment.",
    },
    {
      icon: "🏢",
      title: "Company-Specific Questions",
      description:
        "Prepare for Google, Microsoft, Amazon, TCS, Infosys, and more.",
    },
    {
      icon: "📊",
      title: "Performance Analytics",
      description:
        "Track communication, confidence, and technical performance.",
    },
    {
      icon: "🎯",
      title: "Personalized Roadmap",
      description:
        "Get a customized preparation plan based on your goals.",
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
            <div className="feature-card" key={index}>
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