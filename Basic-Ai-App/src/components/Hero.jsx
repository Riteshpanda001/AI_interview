import React from "react";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">

      <div className="hero-left">
        <div className="hero-badge">
          🚀 AI-Powered Interview Preparation Platform
        </div>

        <h1>
          Ace Your
          <span> Dream Job </span>
          with AI
        </h1>

        <p>
          Practice Technical, HR, and Coding Interviews with
          real-time AI feedback, ATS resume analysis, and
          personalized career guidance.
        </p>

        <div className="hero-features">
          <div>✅ AI Mock Interviews</div>
          <div>✅ ATS Resume Analysis</div>
          <div>✅ Coding Practice</div>
          <div>✅ Company-Specific Questions</div>
        </div>

        <div className="hero-buttons">
          <button className="primary-btn">
            Start Interview
          </button>

          <button className="secondary-btn">
            Upload Resume
          </button>
        </div>
      </div>
      <div className="hero-right">
          <img src="/images/ai-interview.png" alt="AI Interview Practice" className="hero-image"/>
        </div>
    </section>
  );
};

export default Hero;