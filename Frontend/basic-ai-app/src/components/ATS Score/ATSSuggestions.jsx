import React, { useState } from "react";
import "./ATSSuggestions.css";

const ATSSuggestions = () => {
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      title: "Use action verbs to describe experience",
      impact: "High",
      desc: "Begin your experience bullet points with strong, varied action verbs (e.g., 'Implemented', 'Led', 'Optimized') rather than passive phrases.",
      before: "Responsible for managing the software development lifecycle and team operations.",
      after: "Spearheaded the software development lifecycle, improving delivery velocity by 25%.",
      expanded: false
    },
    {
      id: 2,
      title: "Quantify your achievements and results",
      impact: "High",
      desc: "ATS algorithms and recruiters value measurable impact. Provide percentages, dollar amounts, and hours saved.",
      before: "Worked on reducing page load times and code cleaning.",
      after: "Optimized critical frontend assets to reduce page load time by 42% for over 100k daily users.",
      expanded: false
    },
    {
      id: 3,
      title: "Simplify section headings for readability",
      impact: "Medium",
      desc: "Use standard headings like 'Work Experience' or 'Employment History' instead of creative names like 'Where I've Been' or 'Career Journey'.",
      before: "My Coding Adventures",
      after: "Technical Experience",
      expanded: false
    }
  ]);

  const toggleExpand = (id) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, expanded: !s.expanded } : s));
  };

  return (
    <div className="ats-suggestions-container">
      <div className="suggestions-header">
        <h2>AI Optimization Suggestions</h2>
        <p>Follow these specific, personalized recommendations to improve ATS compatibility and readability.</p>
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
