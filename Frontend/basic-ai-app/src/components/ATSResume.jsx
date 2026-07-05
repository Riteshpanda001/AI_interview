import React from "react";
import "./ATSResume.css";
import { useNavigate } from "react-router-dom";

const ATSResume = () => {
  const navigate = useNavigate();

  return (
    <section className="ats-section">

      <div className="ats-left">

        <span className="ats-tag">
          📄 ATS Resume Analyzer
        </span>

        <h2>
          Optimize Your Resume for
          <span> ATS Success</span>
        </h2>

        <p>
          Upload your resume and get an instant ATS score,
          identify missing skills, and receive personalized
          suggestions to improve your chances of getting shortlisted.
        </p>

        <div className="ats-features">

          <div className="ats-item">
            <span className="check-circle">✓</span>
            ATS Compatibility Score
          </div>

          <div className="ats-item">
            <span className="check-circle">✓</span>
            Missing Skills Detection
          </div>

          <div className="ats-item">
            <span className="check-circle">✓</span>
            Resume Improvement Tips
          </div>

          <div className="ats-item">
            <span className="check-circle">✓</span>
            Industry Keyword Analysis
          </div>

        </div>

        <button className="upload-btn" onClick={() => navigate("/ats-score")}>
          Upload Resume
        </button>

      </div>

      <div className="ats-right">

        <div className="ats-card">

          <div className="score-header">
            <h3>ATS Score</h3>
            <span className="score">92%</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <div className="analysis-box">

            <h4>Missing Skills</h4>

            <ul>
              <li>AWS</li>
              <li>Docker</li>
              <li>Kubernetes</li>
            </ul>

          </div>

          <div className="analysis-box">

            <h4>Suggestions</h4>

            <ul>
              <li>Add more projects</li>
              <li>Use measurable achievements</li>
              <li>Improve keywords</li>
            </ul>

          </div>

        </div>

      </div>

    </section>
  );
};

export default ATSResume;