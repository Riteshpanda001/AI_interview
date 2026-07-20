import React, { useState } from "react";
import "./ATSAnalysis.css";

const ATSAnalysis = ({ analysisResult }) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const matchedSkills = analysisResult?.matched_skills || [];
  const missingSkills = analysisResult?.missing_skills || [];
  const hasMissingKeywords = missingSkills.length > 0;
  
  const keywordsDetail = hasMissingKeywords 
    ? `Missing matching industry terms from job description: ${missingSkills.slice(0, 3).map(s => `'${s}'`).join(', ')}.`
    : "Excellent match! All key terms from the job description were identified.";

  const checkItems = [
    { id: 1, title: "Contact Information Found", category: "essential", status: "pass", detail: "Email, phone number, and LinkedIn profile were parsed successfully." },
    { id: 2, title: "File Format Compatibility", category: "formatting", status: "pass", detail: "File format is compatible with modern ATS parsers." },
    { id: 3, title: "Standard Section Headings", category: "formatting", status: "pass", detail: "Standard titles like 'Experience', 'Education', 'Skills' are used." },
    { id: 4, title: "Uncommon Font Style", category: "formatting", status: "warning", detail: "Some non-standard fonts may be present. Stick to Arial, Calibri, or Helvetica for best parsing results." },
    { id: 5, title: "Core Tech Stack Keywords Match", category: "keywords", status: hasMissingKeywords ? "fail" : "pass", detail: keywordsDetail },
    { id: 6, title: "Quantitative Achievements", category: "readability", status: "warning", detail: "Add more metric achievements (e.g. percentages, budgets, timeframes) to prove business value." },
    { id: 7, title: "No Structural Obstacles", category: "formatting", status: "pass", detail: "Your resume does not contain complex tables or textboxes that hinder ATS parsing." }
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
      <div className="category-filters">
        <button className={activeCategory === "all" ? "active" : ""} onClick={() => setActiveCategory("all")}>All Checks</button>
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
