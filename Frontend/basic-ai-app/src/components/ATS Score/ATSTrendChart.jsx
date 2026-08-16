import React from "react";
import "./ATSTrendChart.css";

const ATSTrendChart = ({ history = [], onSelectHistoricalScan }) => {
  // Sort history chronologically
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  // If no history, render empty state
  if (sortedHistory.length === 0) {
    return (
      <div className="ats-trend-container empty">
        <h4>📈 Score Trajectory & Improvement Trend</h4>
        <p>No past scan history found. Run multiple job match scans to track your score trajectory!</p>
      </div>
    );
  }

  const scores = sortedHistory.map((item) => item.score || 0);
  const maxScore = 100;
  
  // SVG Dimensions
  const width = 500;
  const height = 150;
  const padding = 20;

  // Calculate coordinates for the SVG path
  const points = sortedHistory.map((item, index) => {
    const x = padding + (index / Math.max(1, sortedHistory.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((item.score || 0) / maxScore) * (height - 2 * padding);
    return { x, y, score: item.score, date: new Date(item.created_at).toLocaleDateString(), role: item.job_title, raw: item };
  });

  // Create SVG path string
  let pathD = "";
  if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  // Create area path for the gradient fill under the line
  let areaD = "";
  if (points.length > 1) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="ats-trend-container">
      <div className="trend-header">
        <h4>📈 Score Trajectory & ATS Trend</h4>
        <span className="trend-subtitle">Track your resume optimizations over time</span>
      </div>

      {points.length < 2 ? (
        <div className="trend-empty-state">
          <div className="single-score-badge">
            <span className="sc-val">{scores[0]}%</span>
            <span className="sc-lbl">Initial Scan</span>
          </div>
          <p>Scan your resume again after applying recommendations to unlock the visual trend chart!</p>
        </div>
      ) : (
        <div className="svg-chart-wrapper">
          <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

            {/* Area Path */}
            {areaD && <path d={areaD} fill="url(#chartGrad)" />}

            {/* Line Path */}
            {pathD && <path d={pathD} fill="none" stroke="#a855f7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Point circles */}
            {points.map((p, i) => (
              <g key={i} className="chart-point-group">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill="#ffffff"
                  stroke="#7c3aed"
                  strokeWidth="3"
                  style={{ cursor: "pointer" }}
                  onClick={() => onSelectHistoricalScan && onSelectHistoricalScan(p.raw)}
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="point-text"
                >
                  {p.score}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* History List */}
      <div className="trend-history-list">
        <h5>📜 Scan History ({sortedHistory.length})</h5>
        <div className="history-scroll-grid">
          {sortedHistory.map((item, i) => {
            const scanDate = new Date(item.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
            return (
              <div
                key={i}
                className="history-list-item"
                onClick={() => onSelectHistoricalScan && onSelectHistoricalScan(item)}
              >
                <div className="hi-left">
                  <span className={`hi-score-indicator ${item.score >= 80 ? "green" : item.score >= 60 ? "yellow" : "red"}`}>
                    {item.score}%
                  </span>
                  <div>
                    <strong className="hi-role">{item.job_title || "Target Role"}</strong>
                    <span className="hi-company">{item.target_company || "General Scan"}</span>
                  </div>
                </div>
                <div className="hi-right">
                  <span className="hi-date">{scanDate}</span>
                  <span className="hi-action">Load ↺</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ATSTrendChart;
