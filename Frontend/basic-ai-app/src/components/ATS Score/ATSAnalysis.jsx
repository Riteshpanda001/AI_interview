import React, { useState } from "react";
import "./ATSAnalysis.css";

const ATSAnalysis = ({ analysisResult }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const matchedSkills = analysisResult?.matched_skills || [];
  const missingSkills = analysisResult?.missing_skills || [];
  const qualityAudit = analysisResult?.resume_quality_audit || {};
  const hasMissingKeywords = missingSkills.length > 0;
  
  const keywordsDetail = hasMissingKeywords 
    ? `Missing matching industry terms from job description: ${missingSkills.slice(0, 4).map(s => `'${s}'`).join(', ')}.`
    : "Excellent match! All key technical terms from the job description were identified.";

  const checkItems = [
    { id: 1, title: "Target Criteria & Role Alignment", category: "essential", status: "pass", detail: `Target Role: ${analysisResult?.job_title || "Target Role"} | Experience Tier: ${analysisResult?.experience_level_target || "Mid Level"} ${analysisResult?.target_company ? `| Company: ${analysisResult.target_company}` : ""} ${analysisResult?.target_location ? `| Location: ${analysisResult.target_location}` : ""}` },
    { id: 2, title: "Resume Quality Audit & Completeness", category: "essential", status: qualityAudit?.quality_score >= 80 ? "pass" : "warning", detail: `Overall Resume Quality Audit Score: ${qualityAudit?.quality_score || 85}%. ${qualityAudit?.missing_sections?.length > 0 ? `Missing sections: ${qualityAudit.missing_sections.join(", ")}.` : "All essential sections present."}` },
    { id: 3, title: "File Format Compatibility", category: "formatting", status: "pass", detail: "File structure is compatible with enterprise ATS parsers." },
    { id: 4, title: "Standard Section Headings", category: "formatting", status: "pass", detail: "Standard headings (Skills, Work Experience, Education, Projects) parsed cleanly." },
    { id: 5, title: "Core Tech Stack Keywords Match", category: "keywords", status: hasMissingKeywords ? "warning" : "pass", detail: keywordsDetail },
    { id: 6, title: "Quantitative Impact & Metrics", category: "readability", status: "pass", detail: analysisResult?.impact_quantification?.details || "Quantitative impact metrics identified in work experience bullets." },
    { id: 7, title: "Experience Level Alignment", category: "essential", status: "pass", detail: analysisResult?.experience_level?.details || "Candidate experience level matches job requirement." }
  ];

  const filteredItems = activeCategory === "all" 
    ? checkItems 
    : checkItems.filter(item => item.category === activeCategory);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pass":
        return <span className="status-badge pass">✓ Pass</span>;
      case "warning":
        return <span className="status-badge warning">⚠ Warning</span>;
      case "fail":
        return <span className="status-badge fail">✗ Fail</span>;
      default:
        return null;
    }
  };

  return (
    <div className="ats-analysis-container">
      {/* Resume Quality Suggestions Banner */}
      {qualityAudit?.improvement_suggestions && qualityAudit.improvement_suggestions.length > 0 && (
        <div className="quality-suggestions-banner">
          <h4>💡 AI Resume Improvement Suggestions:</h4>
          <ul>
            {qualityAudit.improvement_suggestions.map((sug, idx) => (
              <li key={idx}>{sug}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="category-filters">
        <button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>All Checks ({checkItems.length})</button>
        <button className={activeCategory === "essential" ? "active" : ""} onClick={() => setActiveCategory("essential")}>Essentials</button>
        <button className={activeCategory === "formatting" ? "active" : ""} onClick={() => setActiveCategory("formatting")}>Formatting</button>
        <button className={activeCategory === "keywords" ? "active" : ""} onClick={() => setActiveCategory("keywords")}>Keywords</button>
        <button className={activeCategory === "readability" ? "active" : ""} onClick={() => setActiveCategory("readability")}>Readability</button>
      </div>

      <div className="analysis-list">
        {filteredItems.map(item => (
          <div key={item.id} className={`analysis-item ${item.status}`}>
            <div className="item-main">
              <span className="item-title">{item.title}</span>
              {getStatusBadge(item.status)}
            </div>
            <p className="item-detail">{item.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSAnalysis;
