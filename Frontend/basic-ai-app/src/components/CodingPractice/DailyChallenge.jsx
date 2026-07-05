import React from "react";
import "./DailyChallenge.css";

const DailyChallenge = ({ onSolve }) => {
  return (
    <section className="daily-challenge-section">
      <div className="daily-challenge-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🔥 Streak Challenge</span>
          <h2>Daily Coding Challenge</h2>
          <p>Solve today's selected problem to level up your streak, earn dynamic rank points, and test your speed limits.</p>
        </div>

        <div className="challenge-hero-card card">
          <div className="challenge-card-badge">
            <span className="live-dot">●</span> LIVE CHALLENGE
          </div>

          <div className="challenge-details">
            <div className="challenge-meta">
              <span className="challenge-difficulty medium">Medium</span>
              <span className="challenge-acceptance">📂 String / Sliding Window</span>
              <span className="challenge-score">Points: +50 XP</span>
            </div>

            <h3>Longest Substring Without Repeating Characters</h3>
            <p className="challenge-desc">
              Given a string <code>s</code>, find the length of the longest substring without repeating characters. You must optimize for <code>O(N)</code> runtime execution using sliding window protocols.
            </p>

            <div className="streak-stats-row">
              <div className="streak-stat">
                <strong>7 Days</strong>
                <span>Current Streak</span>
              </div>
              <div className="streak-stat">
                <strong>92%</strong>
                <span>Success Rate</span>
              </div>
              <div className="streak-stat">
                <strong>1,245</strong>
                <span>Developers Solved</span>
              </div>
            </div>

            <div className="challenge-action-row">
              <button 
                className="challenge-solve-btn" 
                onClick={onSolve || (() => alert("Launching compiler workspace for Daily Challenge: 'Longest Substring'"))}
              >
                Start Solving Now →
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DailyChallenge;
