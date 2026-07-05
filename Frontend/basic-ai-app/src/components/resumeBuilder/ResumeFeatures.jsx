import React from "react";
import "./ResumeFeatures.css";

const features = [
  {
    icon: "🤖",
    title: "AI Resume Writing",
    description:
      "Generate professional resume content with AI. Improve summaries, experience, projects, and achievements instantly."
  },
  {
    icon: "🎯",
    title: "ATS Resume Score",
    description:
      "Analyze your resume against ATS systems and receive an instant compatibility score with improvement suggestions."
  },
  {
    icon: "📄",
    title: "Professional Templates",
    description:
      "Choose from beautifully designed ATS-friendly resume templates used by top professionals worldwide."
  },
  {
    icon: "⚡",
    title: "Keyword Optimization",
    description:
      "Optimize your resume with job-specific keywords to increase your chances of passing recruiter screening."
  },
  {
    icon: "📥",
    title: "PDF & DOCX Export",
    description:
      "Download your resume instantly in high-quality PDF or DOCX formats with one click."
  },
  {
    icon: "🧠",
    title: "AI Resume Suggestions",
    description:
      "Receive intelligent recommendations to improve grammar, achievements, technical skills, and overall resume quality."
  }
];

const ResumeFeatures = () => {
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

        {features.map((feature, index) => (

          <div
            className="resume-feature-card"
            key={index}
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

          </div>

        ))}

      </div>

    </section>
  );
};

export default ResumeFeatures;