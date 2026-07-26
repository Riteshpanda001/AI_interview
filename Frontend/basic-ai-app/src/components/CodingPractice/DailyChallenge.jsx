import React from "react";
import "./DailyChallenge.css";
import useRequireAuth from "../../hooks/useRequireAuth";

const DailyChallenge = ({ onSolve }) => {
  const { requireAuth } = useRequireAuth();

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
              <span className="challenge-difficulty easy">Easy</span>
              <span className="challenge-acceptance">📂 Array / Searching</span>
              <span className="challenge-score">Points: +30 XP</span>
            </div>

            <h3>Binary Search</h3>
            <p className="challenge-desc">
              Given a sorted array of integers <code>arr</code> and a target value <code>k</code>, return its index. If target is not found, return <code>-1</code> using <code>O(log N)</code> search logic.
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
                onClick={() => requireAuth(() => { if (onSolve) onSolve(); }, "/coding-practice")}
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
