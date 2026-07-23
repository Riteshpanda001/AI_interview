import React from "react";
import "./AIMockInterview.css";
import { useNavigate } from "react-router-dom";

const AIMockInterview = () => {
  const navigate = useNavigate();
  return (
    <section className="mock-section">

      <div className="mock-left">

        <span className="mock-tag">
          🎤 AI Mock Interview
        </span>

        <h2>
          Practice Real Interviews with
          <span> AI Feedback</span>
        </h2>

        <p>
          Experience realistic mock interviews powered by AI.
          Get instant feedback on communication, confidence,
          technical skills, and overall performance.
        </p>

        <div className="mock-features">

          <div className="mock-item">
            <span className="check-circle">✓</span>
            Real-Time AI Interviewer
          </div>

          <div className="mock-item">
            <span className="check-circle">✓</span>
            Instant Performance Feedback
          </div>

          <div className="mock-item">
            <span className="check-circle">✓</span>
            Communication Analysis
          </div>

          <div className="mock-item">
            <span className="check-circle">✓</span>
            Confidence Score Tracking
          </div>

        </div>

        <button 
          className="mock-btn" 
          onClick={() => {
            if (window.location.pathname === "/mock-interview") {
              navigate("/mock-interviews");
            } else {
              navigate("/mock-interview");
            }
          }}
        >
          Start Mock Interview
        </button>

      </div>

      <div className="mock-right">

        <div className="interview-card">

          <div className="chat ai">
            <strong>🤖 AI Interviewer</strong>
            <p>
              Tell me about yourself and your background.
            </p>
          </div>

          <div className="chat user">
            <strong>👨 Candidate</strong>
            <p>
              I am a Computer Science student passionate
              about software development and AI technologies.
            </p>
          </div>

          <div className="feedback-card">

            <h3>Interview Feedback</h3>

            <div className="feedback-item">
              <span>Communication</span>
              <strong>9/10</strong>
            </div>

            <div className="feedback-item">
              <span>Confidence</span>
              <strong>8/10</strong>
            </div>

            <div className="feedback-item">
              <span>Technical Skills</span>
              <strong>8/10</strong>
            </div>

            <div className="feedback-item">
              <span>Overall Score</span>
              <strong>92%</strong>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};

export default AIMockInterview;