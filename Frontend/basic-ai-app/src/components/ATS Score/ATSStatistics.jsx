import React from "react";
import "./ATSStatistics.css";

const ATSStatistics = () => {
  const statsData = [
    { label: "Under 50% Score", rate: 8, color: "#ef4444", response: "Very Low Response" },
    { label: "50% - 70% Score", rate: 24, color: "#f59e0b", response: "Average Response" },
    { label: "70% - 85% Score", rate: 68, color: "#3b82f6", response: "Strong Response" },
    { label: "Over 85% Score", rate: 93, color: "#10b981", response: "Elite Response" }
  ];

  return (
    <div className="ats-statistics-container">
      <div className="stats-header">
        <h2>ATS Performance Statistics</h2>
        <p>Analyze how score brackets correlate directly to job interview callback rates.</p>
      </div>

      <div className="stats-insights">
        <div className="insight-card">
          <h3>3.2x</h3>
          <p>More recruiter callback responses when score is above 80%.</p>
        </div>
        <div className="insight-card">
          <h3>74%</h3>
          <p>Of resumes are filtered out immediately by low ATS matching scores.</p>
        </div>
      </div>

      <div className="stats-chart">
        <h3>Interview Callbacks by ATS Score Bracket</h3>
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
                  style={{ width: `${data.rate}%`, backgroundColor: data.color }}
                >
                  <span className="percentage-text">{data.rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ATSStatistics;
