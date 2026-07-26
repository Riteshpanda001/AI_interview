import React from "react";
import "./Hero.css";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../hooks/useRequireAuth";

const Hero = () => {

  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  return (

    <section className="hero">

      <div className="hero-left">

        <div className="hero-badge">
          🚀 AI-Powered Interview Preparation Platform
        </div>

        <h2>
          Ace Your
          <span> Dream Job </span>
          with AI
        </h2>

        <p>
          Practice Technical, HR, and Coding Interviews with
          real-time AI feedback, ATS resume analysis,
          and personalized career guidance.
        </p>

        <div className="hero-features">

          <div className="feature-item">
            <span className="check-icon">✓</span>
            AI Mock Interviews
          </div>

          <div className="feature-item">
            <span className="check-icon">✓</span>
            ATS Resume Analysis
          </div>

          <div className="feature-item">
            <span className="check-icon">✓</span>
            Coding Practice
          </div>

          <div className="feature-item">
            <span className="check-icon">✓</span>
            Company-Specific Questions
          </div>

        </div>

        <div className="hero-buttons">

          <button
            className="primary-btn"
            onClick={() => requireAuth(null, "/mock-interview")}
          >
            Start Interview
          </button>

          <button
            className="secondary-btn"
            onClick={() => requireAuth(null, "/resume-builder")}
          >
            Upload Resume
          </button>

        </div>

      </div>

      <div className="hero-right">

        <img
          src="/images/ai-interview.png"
          alt="AI Interview"
          className="hero-image"
        />

      </div>

    </section>

  );
};

export default Hero;