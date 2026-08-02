import React from "react";
import "./ATSStatistics.css";

const ATSStatistics = () => {
  const statsData = [
    { label: "Under 50% Score", rate: 8, color: "linear-gradient(90deg, #ef4444, #f87171)", response: "Very Low Response" },
    { label: "50% - 70% Score", rate: 24, color: "linear-gradient(90deg, #f59e0b, #fbbf24)", response: "Average Response" },
    { label: "70% - 85% Score", rate: 68, color: "linear-gradient(90deg, #3b82f6, #60a5fa)", response: "Strong Response" },
    { label: "Over 85% Score", rate: 93, color: "linear-gradient(90deg, #10b981, #34d399)", response: "Elite Response" }
  ];

  return (
    <section className="ats-stats-section">
      <div className="section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
        <span className="ats-stats-badge">📊 RECRUITER METRICS</span>
        <h2 className="section-title" style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "12px", marginBottom: "12px" }}>
          ATS Performance <span>Statistics</span>
        </h2>
        <p className="section-subtitle" style={{ color: "#6b7280", maxWidth: "680px", margin: "auto" }}>
          Analyze how ATS matching score brackets correlate directly to recruiter callback rates and interview invitations.
        </p>
      </div>

      <div className="ats-stats-wrapper">
        <div className="stats-insights-grid">
          <div className="insight-card">
            <h3>3.2x</h3>
            <p>More recruiter callback responses when ATS matching score is above 80%.</p>
          </div>
          <div className="insight-card">
            <h3>74%</h3>
            <p>Of resumes are filtered out automatically before human recruiters review them.</p>
          </div>
        </div>

        <div className="stats-chart-card">
          <h3 className="chart-card-title">Interview Callbacks by ATS Score Bracket</h3>
          <div className="chart-rows">
            {statsData.map((data, idx) => (
              <div key={idx} className="chart-row">
                <div className="row-labels">
                  <span className="bracket">{data.label}</span>
                  <span className="response-type">{data.response}</span>
                </div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${data.rate}%`, background: data.color }}
                  >
                    <span className="percentage-text">{data.rate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ATSStatistics;
