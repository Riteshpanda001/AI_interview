import React, { useState } from "react";
import "./KeywordAnalysis.css";

const KeywordAnalysis = ({ matchedSkills = [], missingSkills = [] }) => {
  const keywords = [
    ...matchedSkills.map((skill, idx) => ({
      word: skill,
      status: "match",
      count: (idx % 3) + 1,
      density: `${(((idx % 3) + 1) * 0.8).toFixed(1)}%`
    })),
    ...missingSkills.map(skill => ({
      word: skill,
      status: "missing",
      count: 0,
      density: "0%"
    }))
  ];

  const matches = keywords.filter(k => k.status === "match");
  const missing = keywords.filter(k => k.status === "missing");

  return (
    <div className="keyword-analysis-container">
      <div className="section-title">
        <h2>Keyword Matching Analysis</h2>
        <p>Optimize your resume with key terms from the job description.</p>
      </div>

      <div className="keywords-grid">
        <div className="keyword-card matches">
          <h3>Matched Keywords ({matches.length})</h3>
          <div className="keyword-tags">
            {matches.map((k, i) => (
              <div key={i} className="keyword-tag match">
                <span className="word">{k.word}</span>
                <span className="count">{k.count}x</span>
              </div>
            ))}
          </div>
        </div>

        <div className="keyword-card missing">
          <h3>Missing Keywords ({missing.length})</h3>
          <div className="keyword-tags">
            {missing.map((k, i) => (
              <div key={i} className="keyword-tag miss">
                <span className="word">{k.word}</span>
                <span className="plus">+ Add</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="density-section">
        <h3>Keyword Density Breakdown</h3>
        <div className="density-table">
          <div className="table-header">
            <span>Keyword</span>
            <span>Status</span>
            <span>Count</span>
            <span>Density</span>
          </div>
          {keywords.map((k, i) => (
            <div key={i} className={`table-row ${k.status}`}>
              <span className="cell-word">{k.word}</span>
              <span className="cell-status">{k.status === "match" ? "Matched" : "Missing"}</span>
              <span>{k.count}</span>
              <span>{k.density}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalysis;
