import React from "react";
import "./CodingHero.css";

const CodingHero = ({ onStartCoding, onExploreRoadmap }) => {
  return (
    <section className="coding-hero">
      <div className="coding-hero-container">
        <div className="coding-left">
          <span className="coding-badge">
            💻 AI Powered Coding Interview Platform
          </span>

          <h1>
            Master
            <span> Coding Interviews </span>
            with AI
          </h1>

          <p>
            Practice coding questions from top companies, improve your
            problem-solving skills, receive AI-powered hints, and prepare
            confidently for technical interviews.
          </p>

          <div className="coding-features">
            <div className="coding-feature">
              ✅ 1000+ Coding Problems
            </div>
            <div className="coding-feature">
              ✅ AI Code Review
            </div>
            <div className="coding-feature">
              ✅ Company Wise Questions
            </div>
            <div className="coding-feature">
              ✅ Live Code Editor
            </div>
          </div>

          <div className="coding-buttons">
            <button
              className="secondary-btn"
              onClick={onExploreRoadmap}
            >
              Explore Roadmap
            </button>
            <button
              className="primary-btn"
              onClick={onStartCoding}
            >
              Start Coding
            </button>
          </div>
        </div>

        <div className="coding-right">
          <div className="coding-image-card">
            <img
              src="/images/coding-hero.png"
              alt="Coding Practice"
              onError={(e) => {
                // Fallback placeholder if the image doesn't exist
                e.target.src = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=650&auto=format&fit=crop";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CodingHero;
