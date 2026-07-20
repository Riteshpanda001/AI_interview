import React, { useState, useEffect } from "react";
import "./ATSSuggestions.css";

const ATSSuggestions = ({ recommendations = [], detailedFeedback = "" }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (recommendations.length > 0) {
      setSuggestions(
        recommendations.map((rec, idx) => {
          let title = rec;
          let desc = "Follow this AI recommendation to enhance your ATS score and compatibility.";
          
          if (rec.includes(":")) {
            const parts = rec.split(":");
            title = parts[0].trim();
            desc = parts.slice(1).join(":").trim();
          }

          let before = "Created basic API endpoints and worked on databases.";
          let after = "Architected high-performance REST APIs, optimizing database query response times by 35%.";
          
          if (title.toLowerCase().includes("docker") || title.toLowerCase().includes("container")) {
            before = "Ran the application locally using simple scripts.";
            after = "Containerized application workflows using Docker, ensuring consistent multi-environment deployment.";
          } else if (title.toLowerCase().includes("aws") || title.toLowerCase().includes("cloud")) {
            before = "Deployed codebase to local server settings.";
            after = "Leveraged AWS cloud infrastructure (S3, EC2) to scale storage and server capacity dynamically.";
          } else if (title.toLowerCase().includes("testing") || title.toLowerCase().includes("jest")) {
            before = "Tested the features manually by clicking around.";
            after = "Implemented comprehensive unit testing using Jest/React Testing Library, raising test coverage to 85%.";
          }

          return {
            id: idx + 1,
            title,
            impact: idx === 0 ? "High" : "Medium",
            desc,
            before,
            after,
            expanded: idx === 0
          };
        })
      );
    } else {
      setSuggestions([]);
    }
  }, [recommendations]);

  const toggleExpand = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  return (
    <div className="ats-suggestions-container">
      <div className="suggestions-header">
        <h2>AI Optimization Suggestions</h2>
        <p>Follow these specific, personalized recommendations to improve ATS compatibility and readability.</p>
        {detailedFeedback && (
          <div className="feedback-overview-box">
            <h4>AI Recruiter Summary</h4>
            <p>{detailedFeedback}</p>
          </div>
        )}
      </div>

      <div className="suggestions-list">
        {suggestions.map((s) => (
          <div key={s.id} className={`suggestion-card ${s.expanded ? "expanded" : ""}`}>
            <div className="card-top" onClick={() => toggleExpand(s.id)}>
              <div className="title-area">
                <span className={`impact-indicator ${s.impact.toLowerCase()}`}>
                  {s.impact} Impact
                </span>
                <h3>{s.title}</h3>
              </div>
              <span className="arrow-icon">{s.expanded ? "▲" : "▼"}</span>
            </div>

            {s.expanded && (
              <div className="card-details">
                <p className="description">{s.desc}</p>
                
                <div className="comparison-box">
                  <div className="comparison-col before">
                    <span>❌ Original / Bad Example</span>
                    <p>"{s.before}"</p>
                  </div>
                  <div className="comparison-col after">
                    <span>✨ Suggested / Good Example</span>
                    <p>"{s.after}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSSuggestions;
