import React from "react";
import "./ResumeHero.css";
import useRequireAuth from "../../hooks/useRequireAuth";

import heroImage from "../../assets/resume/resume-hero.png";

const ResumeHero = ({ onBuildClick }) => {
  const { requireAuth } = useRequireAuth();

  return (
    <section className="resume-hero">

      <div className="resume-hero-container">

        {/* LEFT SIDE */}

        <div className="resume-hero-left">

          <div className="resume-badge">
            ⚡ AI-Powered • ATS Optimized • Free PDF + DOCX
          </div>

          <h2>
            Free AI Resume Builder:
            <br />
            <span>Build, Score & Tailor</span>
            <br />
            ATS Resumes
          </h2>
          <p>
            Create a professional ATS-friendly resume in minutes.
            Our AI helps you generate powerful summaries,
            improve projects, optimize keywords, rewrite bullet
            points, and increase your chances of getting selected
            by top companies.
          </p>
          <div className="resume-features">

            <span>✓ ATS Optimized</span>

            <span>✓ Live ATS Score</span>

            <span>✓ Powered by AI</span>

            <span>✓ Professional Templates</span>

          </div>

          <div className="resume-buttons">

            <button className="build-btn" onClick={() => requireAuth(onBuildClick, "/resume-builder")}>
              Build Resume
            </button>

            <button className="demo-btn">
              Watch Demo
            </button>

          </div>

          <div className="resume-stats">

            <div className="stat-card">
              <h3>250K+</h3>
              <p>Resumes Created</p>
            </div>

            <div className="stat-card">
              <h3>95%</h3>
              <p>ATS Success Rate</p>
            </div>

            <div className="stat-card">
              <h3>100+</h3>
              <p>Resume Templates</p>
            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="resume-hero-right">

          <img
            src={heroImage}
            alt="AI Resume Builder"
            className="resume-main-image"
          />
        </div>

      </div>

    </section>
  );
};

export default ResumeHero;