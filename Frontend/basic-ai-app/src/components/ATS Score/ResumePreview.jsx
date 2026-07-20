import React, { useState } from "react";
import "./ResumePreview.css";

const ResumePreview = ({ resumeData = null, matchedSkills = [], missingSkills = [] }) => {
  const [highlightMode, setHighlightMode] = useState("all");

  const parsed = resumeData?.parsed_content || {};
  const personal = parsed.personal || {};
  const experiences = parsed.experience || [];
  const education = parsed.education || [];
  const skillsList = parsed.skills || [];

  const candidateName = personal.name || "John Doe";
  const contactText = [
    personal.email,
    personal.phone,
    personal.linkedin
  ].filter(Boolean).join(" | ") || "john.doe@email.com | (123) 456-7890 | linkedin.com/in/johndoe";

  const highlightText = (text) => {
    if (!text) return "";
    
    const allSkills = [...matchedSkills, ...missingSkills].filter(Boolean);
    if (allSkills.length === 0) return text;

    allSkills.sort((a, b) => b.length - a.length);
    const escapedSkills = allSkills.map(s => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`\\b(${escapedSkills.join('|')})\\b`, 'gi');

    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
      const lowerPart = part.toLowerCase();
      const isMatched = matchedSkills.some(s => s.toLowerCase() === lowerPart);
      const isMissing = missingSkills.some(s => s.toLowerCase() === lowerPart);

      if (isMatched) {
        const highlightClass = highlightMode === "all" || highlightMode === "keyword" ? "highlight-keyword" : "";
        return (
          <span key={index} className={`word-mock ${highlightClass}`}>
            {part}
          </span>
        );
      } else if (isMissing) {
        const highlightClass = highlightMode === "all" || highlightMode === "warning" ? "highlight-warning" : "";
        return (
          <span key={index} className={`word-mock ${highlightClass}`}>
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const highlightSkillTag = (skill) => {
    const isMatched = matchedSkills.some(s => s.toLowerCase() === skill.toLowerCase());
    const isMissing = missingSkills.some(s => s.toLowerCase() === skill.toLowerCase());
    
    let highlightClass = "";
    if (isMatched && (highlightMode === "all" || highlightMode === "keyword")) {
      highlightClass = "highlight-keyword";
    } else if (isMissing && (highlightMode === "all" || highlightMode === "warning")) {
      highlightClass = "highlight-warning";
    }

    return (
      <span key={skill} className={`word-mock ${highlightClass}`}>
        {skill}
      </span>
    );
  };

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
          <h1 className="name">{candidateName}</h1>
          <p className="contact">{contactText}</p>
        </div>

        <div className="resume-section-mock">
          <h2 className={`section-title-mock ${highlightMode === "all" || highlightMode === "heading" ? "highlight-heading" : ""}`}>
            Technical Experience
          </h2>
          
          {experiences.map((job, idx) => (
            <div key={idx} className="job-mock">
              <div className="job-header-mock">
                <strong>{job.role || "Software Developer"}</strong>
                <span>{job.company || "Tech Inc."} | {job.duration || "2023 - Present"}</span>
              </div>
              <ul>
                {job.details ? (
                  job.details.split("\n").filter(Boolean).map((bullet, bIdx) => (
                    <li key={bIdx}>{highlightText(bullet)}</li>
                  ))
                ) : (
                  <li>Worked on software development projects and integrated REST endpoints.</li>
                )}
              </ul>
            </div>
          ))}
          {experiences.length === 0 && (
            <p className="no-experience-mock" style={{ padding: "10px 0", color: "#9ca3af", fontSize: "0.9rem" }}>
              No experience details available.
            </p>
          )}
        </div>

        <div className="resume-section-mock">
          <h2 className={`section-title-mock ${highlightMode === "all" || highlightMode === "heading" ? "highlight-heading" : ""}`}>
            Skills
          </h2>
          <p className="skills-list-mock">
            {skillsList.map((skill, idx) => (
              <React.Fragment key={idx}>
                {highlightSkillTag(skill)}
                {idx < skillsList.length - 1 && ", "}
              </React.Fragment>
            ))}
            {skillsList.length === 0 && "No skills listed."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
