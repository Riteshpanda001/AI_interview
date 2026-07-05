import React from "react";
import "./ResumeHowItWorks.css";

const steps = [
  {
    number: "01",
    icon: "👤",
    title: "Enter Your Details",
    description:
      "Fill in your personal information, education, work experience, projects, certifications, and technical skills using our easy-to-use AI Resume Builder."
  },

  {
    number: "02",
    icon: "🎨",
    title: "Choose Resume Template",
    description:
      "Select from modern, professional, and ATS-friendly resume templates designed for top product-based and service-based companies."
  },

  {
    number: "03",
    icon: "🤖",
    title: "AI Optimizes Your Resume",
    description:
      "Our AI improves grammar, rewrites bullet points, enhances achievements, suggests keywords, and increases your ATS score automatically."
  },

  {
    number: "04",
    icon: "📄",
    title: "Download & Apply",
    description:
      "Preview your resume, download it as a PDF or DOCX, and confidently apply to your dream companies."
  }
];

const ResumeHowItWorks = () => {
  return (
    <section className="resume-work">

      <div className="resume-work-header">

        <span>HOW IT WORKS</span>

        <h2>
          Build Your Resume in
          <span> 4 Easy Steps</span>
        </h2>

        <p>
          Our AI-powered Resume Builder simplifies the entire
          resume creation process. Create a professional,
          ATS-friendly resume within minutes.
        </p>

      </div>

      <div className="resume-work-grid">

        {steps.map((step, index) => (

          <div className="work-card" key={index}>

            <div className="step-number">
              {step.number}
            </div>

            <div className="step-icon">
              {step.icon}
            </div>

            <h3>{step.title}</h3>

            <p>{step.description}</p>

          </div>

        ))}

      </div>

      {/* Bottom Timeline */}

      <div className="resume-timeline">

        <div className="timeline-item">

          <div className="timeline-circle">1</div>

          <p>Enter Details</p>

        </div>

        <div className="timeline-line"></div>

        <div className="timeline-item">

          <div className="timeline-circle">2</div>

          <p>Select Template</p>

        </div>

        <div className="timeline-line"></div>

        <div className="timeline-item">

          <div className="timeline-circle">3</div>

          <p>AI Optimization</p>

        </div>

        <div className="timeline-line"></div>

        <div className="timeline-item">

          <div className="timeline-circle">4</div>

          <p>Download Resume</p>

        </div>

      </div>

    </section>
  );
};

export default ResumeHowItWorks;