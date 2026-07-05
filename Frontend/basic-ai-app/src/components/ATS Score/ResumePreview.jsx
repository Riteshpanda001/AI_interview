import React, { useState } from "react";
import "./ResumePreview.css";

const ResumePreview = () => {
  const [highlightMode, setHighlightMode] = useState("all");

  return (
    <div className="resume-preview-container">
      <div className="preview-header">
        <h2>Interactive Resume Preview</h2>
        <p>See exactly where ATS systems flag and identify terms in your uploaded document.</p>
        
        <div className="highlight-controls">
          <button className={highlightMode === "all" ? "active" : ""} onClick={() => setHighlightMode("all")}>Show All</button>
          <button className={highlightMode === "keyword" ? "active" : ""} onClick={() => setHighlightMode("keyword")}>Keywords</button>
          <button className={highlightMode === "heading" ? "active" : ""} onClick={() => setHighlightMode("heading")}>Headings</button>
          <button className={highlightMode === "warning" ? "active" : ""} onClick={() => setHighlightMode("warning")}>Warnings</button>
        </div>
      </div>

      <div className="resume-paper">
        <div className="resume-header-mock">
          <h1 className="name">John Doe</h1>
          <p className="contact">
            john.doe@email.com | (123) 456-7890 | linkedin.com/in/johndoe
          </p>
        </div>

        <div className="resume-section-mock">
          <h2 className={`section-title-mock ${highlightMode === "all" || highlightMode === "heading" ? "highlight-heading" : ""}`}>
            Technical Experience
          </h2>
          
          <div className="job-mock">
            <div className="job-header-mock">
              <strong>Software Engineer</strong>
              <span>TechCorp | 2024 - Present</span>
            </div>
            <ul>
              <li>
                Built responsive user interfaces utilizing{" "}
                <span className={`word-mock ${highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : ""}`}>
                  React.js
                </span>{" "}
                and state management with{" "}
                <span className={`word-mock ${highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : ""}`}>
                  Redux
                </span>
                .
              </li>
              <li>
                Designed and maintained microservices using Node.js and{" "}
                <span className={`word-mock ${highlightMode === "all" || highlightMode === "warning" ? "highlight-warning" : ""}`}>
                  REST APIs
                </span>{" "}
                backends.
              </li>
            </ul>
          </div>
        </div>

        <div className="resume-section-mock">
          <h2 className={`section-title-mock ${highlightMode === "all" || highlightMode === "heading" ? "highlight-heading" : ""}`}>
            Skills
          </h2>
          <p className="skills-list-mock">
            <span className={`word-mock ${highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : ""}`}>JavaScript</span>,{" "}
            <span className={`word-mock ${highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : ""}`}>HTML5</span>,{" "}
            <span className={`word-mock ${highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : ""}`}>CSS3</span>,{" "}
            Webpack, Git, Docker (Basic)
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
