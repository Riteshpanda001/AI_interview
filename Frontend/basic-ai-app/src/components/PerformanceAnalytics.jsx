import React from "react";
import "./PerformanceAnalytics.css";

const PerformanceAnalytics = () => {
  return (
    <section className="analytics-section">

      <div className="analytics-header">
        <span className="analytics-tag">
          📊 Performance Analytics
        </span>

        <h2>
          Track Your Interview
          <span> Performance Growth</span>
        </h2>

        <p>
          Monitor communication skills, confidence, technical
          expertise, and problem-solving ability with detailed
          AI-powered performance analytics.
        </p>
      </div>

      <div className="analytics-container">

        {/* Left Side */}

        <div className="analytics-card">

          <h3>Interview Performance</h3>

          <div className="skill">

            <div className="skill-info">
              <span>Communication</span>
              <span>90%</span>
            </div>

            <div className="progress">
              <div className="progress-fill communication"></div>
            </div>

          </div>

          <div className="skill">

            <div className="skill-info">
              <span>Confidence</span>
              <span>85%</span>
            </div>

            <div className="progress">
              <div className="progress-fill confidence"></div>
            </div>

          </div>

          <div className="skill">

            <div className="skill-info">
              <span>Technical Skills</span>
              <span>88%</span>
            </div>

            <div className="progress">
              <div className="progress-fill technical"></div>
            </div>

          </div>

          <div className="skill">

            <div className="skill-info">
              <span>Problem Solving</span>
              <span>82%</span>
            </div>

            <div className="progress">
              <div className="progress-fill problem"></div>
            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="score-card">

          <div className="circle">

            <div className="inner-circle">
              <h1>91%</h1>
              <p>Overall Score</p>
            </div>

          </div>

          <div className="recommendation">

            <h4>AI Recommendation</h4>

            <p>
              Improve technical explanations and provide
              more real-world project examples during interviews.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
};

export default PerformanceAnalytics;