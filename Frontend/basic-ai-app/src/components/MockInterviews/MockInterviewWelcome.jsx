import React from "react";
import {
  FaRocket,
  FaHistory,
  FaMicrophone,
  FaBullseye,
  FaChartLine,
  FaLightbulb,
  FaArrowRight,
  FaCheckCircle,
  FaRobot,
  FaFileCode,
  FaBrain,
  FaUserTie,
  FaRegSmile
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./MockInterviewWelcome.css";

const MockInterviewWelcome = ({ onStartInterview, onViewHistory, onQuickPreset }) => {
  const { user } = useAuth();
  const userName = user?.full_name?.split(" ")[0] || "Candidate";

  const PRESETS = [
    {
      id: "fullstack",
      title: "Full Stack Engineer",
      category: "technical",
      role_target: "Fullstack Developer",
      difficulty: "Medium",
      duration: 45,
      icon: <FaFileCode />,
      desc: "React, Node.js, System Architecture & Databases",
      color: "#8b5cf6"
    },
    {
      id: "aiml",
      title: "AI / ML Engineer",
      category: "technical",
      role_target: "AI-ML Engineer",
      difficulty: "Medium",
      duration: 45,
      icon: <FaBrain />,
      desc: "PyTorch, Model Deployment, Math & LLM Tuning",
      color: "#ec4899"
    },
    {
      id: "behavioral",
      title: "Behavioral STAR Round",
      category: "behavioral",
      role_target: "Software Engineer",
      difficulty: "Medium",
      duration: 30,
      icon: <FaUserTie />,
      desc: "Conflict resolution, teamwork & leadership stories",
      color: "#3b82f6"
    },
    {
      id: "resume",
      title: "Resume-Based Screen",
      category: "technical",
      role_target: "Resume Based Candidate",
      difficulty: "Medium",
      duration: 45,
      prep_mode: "resume",
      icon: <FaRobot />,
      desc: "Tailored directly to your uploaded CV skills & projects",
      color: "#10b981"
    }
  ];

  return (
    <div className="welcome-container">
      {/* ── HERO BANNER ── */}
      <div className="welcome-hero">
        <div className="welcome-hero-content">
          <div className="welcome-badge">
            <FaRobot />
            <span>AI Mock Interview Assistant</span>
          </div>
          <h1>Welcome, {userName}! 👋</h1>
          <p>
            Master your upcoming tech interviews with realistic AI-driven mock sessions. Receive real-time voice evaluation, instant scoring, and personalized feedback.
          </p>
          <div className="welcome-actions">
            <button className="welcome-btn-primary" onClick={onStartInterview}>
              <FaRocket />
              <span>Start New Interview</span>
            </button>
            <button className="welcome-btn-secondary" onClick={onViewHistory}>
              <FaHistory />
              <span>View Past History</span>
            </button>
          </div>
        </div>
        <div className="welcome-hero-illustration">
          <div className="hero-floating-card card-1">
            <FaMicrophone className="hero-icon mic" />
            <div>
              <strong>Voice & Text Q&A</strong>
              <span>Interactive real-time audio</span>
            </div>
          </div>
          <div className="hero-floating-card card-2">
            <FaChartLine className="hero-icon chart" />
            <div>
              <strong>Real-Time Scoring</strong>
              <span>Technical & Communication metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── QUICK START PRESETS ── */}
      <div className="welcome-section">
        <div className="section-header">
          <h2>Popular Interview Presets</h2>
          <p>Launch a quick mock interview in one click with pre-configured settings</p>
        </div>
        <div className="presets-grid">
          {PRESETS.map((preset) => {
            const handleLaunch = () => {
              const presetData = {
                role_target: preset.role_target,
                interview_type: preset.category,
                experience_level: "Mid Level",
                language: "English",
                duration: preset.duration,
                difficulty: preset.difficulty,
                prep_mode: preset.prep_mode || "role"
              };
              if (onQuickPreset) {
                onQuickPreset(presetData);
              } else {
                onStartInterview(presetData);
              }
            };

            return (
              <div
                key={preset.id}
                className="preset-card"
                style={{ "--accent-color": preset.color }}
                onClick={handleLaunch}
              >
                <div className="preset-icon" style={{ background: `${preset.color}20`, color: preset.color }}>
                  {preset.icon}
                </div>
                <div className="preset-info">
                  <h3>{preset.title}</h3>
                  <p>{preset.desc}</p>
                  <div className="preset-meta">
                    <span className="preset-tag">{preset.category.toUpperCase()}</span>
                    <span className="preset-duration">{preset.duration} Mins</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="preset-launch-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLaunch();
                  }}
                >
                  <span>Start</span>
                  <FaArrowRight />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CORE CAPABILITIES ── */}
      <div className="welcome-section">
        <div className="section-header">
          <h2>Why Practice With PrepNova AI?</h2>
          <p>Supercharge your interview performance with state-of-the-art AI technology</p>
        </div>
        <div className="welcome-features-grid">
          <div className="welcome-feature-card">
            <div className="feature-icon-box purple">
              <FaMicrophone />
            </div>
            <h3>Interactive Voice & Text</h3>
            <p>Speak naturally using AI voice recognition or type your code answers in an interactive workspace.</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-box pink">
              <FaBullseye />
            </div>
            <h3>Role & Resume Tailored</h3>
            <p>Dynamic questions generated specifically for your target job description or uploaded resume skills.</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-box blue">
              <FaChartLine />
            </div>
            <h3>Multi-Metric Scoring</h3>
            <p>Evaluates Technical Accuracy, Problem Solving, Communication Depth, and Confidence in real time.</p>
          </div>

          <div className="welcome-feature-card">
            <div className="feature-icon-box green">
              <FaLightbulb />
            </div>
            <h3>Ideal Answer Feedback</h3>
            <p>Get model answers, missing technical keywords, and actionable tips for every question answered.</p>
          </div>
        </div>
      </div>



      {/* ── INTERVIEW TIPS ── */}
      <div className="welcome-tips-card">
        <div className="tips-header">
          <FaRegSmile className="tips-icon" />
          <div>
            <h3>Pro Tips For Your AI Interview</h3>
            <span>Follow these practices to score 90%+ in your sessions</span>
          </div>
        </div>
        <ul className="tips-list">
          <li>
            <FaCheckCircle className="check-icon" />
            <span><strong>Behavioral Questions:</strong> Use the <em>STAR Method</em> (Situation, Task, Action, Result).</span>
          </li>
          <li>
            <FaCheckCircle className="check-icon" />
            <span><strong>Technical Questions:</strong> Explain your thought process step-by-step before diving into the answer.</span>
          </li>
          <li>
            <FaCheckCircle className="check-icon" />
            <span><strong>Voice Mode:</strong> Speak clearly into your microphone and take a brief pause before responding.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MockInterviewWelcome;
