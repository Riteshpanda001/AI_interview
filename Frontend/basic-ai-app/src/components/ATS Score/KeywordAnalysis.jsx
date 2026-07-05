import React, { useState } from "react";
import "./KeywordAnalysis.css";

const KeywordAnalysis = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const keywords = [
    { word: "React.js", status: "match", count: 4, density: "2.8%" },
    { word: "JavaScript", status: "match", count: 6, density: "4.2%" },
    { word: "Redux", status: "match", count: 1, density: "0.7%" },
    { word: "Node.js", status: "missing", count: 0, density: "0%" },
    { word: "REST APIs", status: "match", count: 3, density: "2.1%" },
    { word: "TypeScript", status: "missing", count: 0, density: "0%" },
    { word: "CI/CD", status: "missing", count: 0, density: "0%" },
    { word: "Webpack", status: "match", count: 1, density: "0.7%" }
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
    }, 1500);
  };

  const matches = keywords.filter(k => k.status === "match");
  const missing = keywords.filter(k => k.status === "missing");

  return (
    <div className="keyword-analysis-container">
      <div className="section-title">
        <h2>Keyword Matching Analysis</h2>
        <p>Optimize your resume with key terms from the job description.</p>
      </div>

      <div className="job-desc-input-wrapper">
        <textarea
          placeholder="Paste the target job description here to run a real-time keyword match comparison..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <button 
          className="analyze-jd-btn" 
          onClick={handleAnalyze}
          disabled={!jobDescription.trim() || analyzing}
        >
          {analyzing ? "Analyzing..." : "Compare Keywords"}
        </button>
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
