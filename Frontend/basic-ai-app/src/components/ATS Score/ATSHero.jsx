import React from "react";
import "./ATSHero.css";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../../hooks/useRequireAuth";
import heroImage from "../../assets/resume/ats-hero-image.jpg";

const ATSHero = () => {

  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  const features = [
    "AI Resume Analysis",
    "ATS Score Report",
    "Keyword Matching",
    "Resume Optimization"
  ];

  const stats = [
    {
      number: "250K+",
      title: "Resumes Analyzed"
    },
    {
      number: "98%",
      title: "ATS Accuracy"
    },
    {
      number: "500+",
      title: "Companies"
    }
  ];

  return (

    <section className="ats-hero">

      {/* Left Side */}

      <div className="ats-hero-left">

        <div className="ats-badge">
          🚀 AI Powered ATS Resume Checker
        </div>

        <h2>

          Improve Your

          <span> ATS Score </span>

          & Get More Interviews

        </h2>

        <p>

          Upload your resume and receive an instant ATS score,
          keyword analysis, AI suggestions, recruiter insights,
          and resume optimization tips to maximize your chances
          of getting shortlisted.

        </p>

        {/* Features */}

        <div className="ats-feature-list">

          {features.map((item, index) => (

            <div
              className="ats-feature"
              key={index}
            >

              <span className="feature-check">
                ✓
              </span>

              {item}

            </div>

          ))}

        </div>

        {/* Buttons */}

        <div className="ats-buttons">

          <button
            className="ats-primary-btn"
            onClick={() => requireAuth(() => navigate("/resume-upload"), "/resume-upload")}
          >
            Upload Resume
          </button>

          <button
            className="ats-secondary-btn"
            onClick={() => requireAuth(() => navigate("/resume-builder"), "/resume-builder")}
          >
            Build Resume
          </button>

        </div>

        {/* Statistics */}

        <div className="ats-statistics">

          {stats.map((item, index) => (

            <div
              className="ats-stat-card"
              key={index}
            >

              <h2>{item.number}</h2>

              <p>{item.title}</p>

            </div>

          ))}

        </div>

      </div>

      {/* Right Side */}

      <div className="ats-hero-right">

        <div className="ats-image-card">
          <img
            src={heroImage}
            alt="ATS Resume Analysis"
            className="ats-hero-image"
          />
        </div>

      </div>

    </section>

  );

};

export default ATSHero;