import React, { useState } from "react";
import "./CodingStatistics.css";

const CodingStatistics = () => {
  // Mock data for git contribution map (84 squares for 12 weeks of historical commits)
  const [weeks] = useState(() => {
    const data = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 83);
    for (let i = 0; i < 84; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i);
      const count = Math.floor(Math.random() * 5); // 0 to 4 commits
      data.push({ date: date.toDateString(), count });
    }
    return data;
  });

  return (
    <section className="coding-stats-section">
      <div className="coding-stats-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">📊 Profile Performance</span>
          <h2>Your Practice <span>Analytics</span></h2>
          <p>Track your level, progress by difficulty, and daily coding activity over the past 12 weeks.</p>
        </div>

        <div className="stats-dashboard-grid">
          
          {/* Card 1: Experience & Level */}
          <div className="stats-card card rank-card">
            <h3>Dev Rank & Level</h3>
            <div className="level-badge-container">
              <div className="level-hexagon">
                <span>LVL</span>
                <strong>12</strong>
              </div>
              <div className="rank-details">
                <h4>Elite Algorithmatist</h4>
                <p>3,640 XP / 4,000 XP to next level</p>
                <div className="rank-progress-bar">
                  <div className="rank-progress-fill" style={{ width: "91%" }}></div>
                </div>
              </div>
            </div>
            <div className="badge-grid">
              <span className="badge-chip">🚀 Fast Solver</span>
              <span className="badge-chip">🔥 7-Day Flame</span>
              <span className="badge-chip">🧠 Recursion Guru</span>
            </div>
          </div>

          {/* Card 2: Solve Progress Breakdown */}
          <div className="stats-card card solve-breakdown-card">
            <h3>Solve Progression</h3>
            <div className="solve-ratio-summary">
              <strong>48 <span>/ 150 Solved</span></strong>
              <span className="acceptance-rate">Avg. Accuracy: 94.2%</span>
            </div>

            <div className="progress-bars-container">
              {/* Easy */}
              <div className="difficulty-progress-row">
                <div className="row-labels">
                  <span className="dif-label easy">Easy</span>
                  <span className="dif-fraction">24/50</span>
                </div>
                <div className="bar-outer">
                  <div className="bar-fill easy" style={{ width: "48%" }}></div>
                </div>
              </div>

              {/* Medium */}
              <div className="difficulty-progress-row">
                <div className="row-labels">
                  <span className="dif-label medium">Medium</span>
                  <span className="dif-fraction">18/60</span>
                </div>
                <div className="bar-outer">
                  <div className="bar-fill medium" style={{ width: "30%" }}></div>
                </div>
              </div>

              {/* Hard */}
              <div className="difficulty-progress-row">
                <div className="row-labels">
                  <span className="dif-label hard">Hard</span>
                  <span className="dif-fraction">6/40</span>
                </div>
                <div className="bar-outer">
                  <div className="bar-fill hard" style={{ width: "15%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Activity Heatmap */}
          <div className="stats-card card heatmap-card">
            <div className="heatmap-header">
              <h3>Submission Activity</h3>
              <span className="total-submissions">142 submissions this year</span>
            </div>

            {/* Grid wrapper */}
            <div className="git-grid-wrapper">
              <div className="git-grid">
                {weeks.map((day, idx) => (
                  <div 
                    key={idx} 
                    className={`git-cell lvl-${day.count}`}
                    title={`${day.count === 0 ? "No" : day.count} submissions on ${day.date}`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-grid">
                <div className="git-cell lvl-0"></div>
                <div className="git-cell lvl-1"></div>
                <div className="git-cell lvl-2"></div>
                <div className="git-cell lvl-3"></div>
                <div className="git-cell lvl-4"></div>
              </div>
              <span>More</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default CodingStatistics;
