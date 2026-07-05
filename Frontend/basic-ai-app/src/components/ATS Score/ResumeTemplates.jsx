import React, { useState } from "react";
import "./ResumeTemplates.css";

const ResumeTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const templates = [
    {
      id: 1,
      name: "Modern Minimalist",
      category: "minimal",
      score: "99% ATS Friendly",
      desc: "Clean layout emphasizing readable sections, standard fonts, and simple tables.",
      image: "📂"
    },
    {
      id: 2,
      name: "Professional Executive",
      category: "classic",
      score: "98% ATS Friendly",
      desc: "A timeless chronological layout favored by recruiters in finance and engineering.",
      image: "💼"
    },
    {
      id: 3,
      name: "Tech Innovator",
      category: "modern",
      score: "95% ATS Friendly",
      desc: "Features a modern layout with subtle sidebar and high-density tech skill list.",
      image: "💻"
    },
    {
      id: 4,
      name: "Creative Narrative",
      category: "creative",
      score: "88% ATS Friendly",
      desc: "Best for design role submissions where visual branding is prioritized over pure formatting.",
      image: "🎨"
    }
  ];

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="resume-templates-container">
      <div className="templates-header">
        <h2>ATS-Optimized Resume Templates</h2>
        <p>Choose from our pre-validated templates specifically designed to bypass ATS parsers.</p>
        
        <div className="category-tabs">
          <button className={selectedCategory === "all" ? "active" : ""} onClick={() => setSelectedCategory("all")}>All Styles</button>
          <button className={selectedCategory === "minimal" ? "active" : ""} onClick={() => setSelectedCategory("minimal")}>Minimal</button>
          <button className={selectedCategory === "classic" ? "active" : ""} onClick={() => setSelectedCategory("classic")}>Classic</button>
          <button className={selectedCategory === "modern" ? "active" : ""} onClick={() => setSelectedCategory("modern")}>Modern</button>
        </div>
      </div>

      <div className="templates-grid">
        {filteredTemplates.map(t => (
          <div key={t.id} className="template-card">
            <div className="template-preview-mock">
              <span className="template-emoji">{t.image}</span>
              <span className="compatibility-badge">{t.score}</span>
            </div>
            
            <div className="template-info">
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
              
              <div className="template-actions">
                <button className="preview-template-btn">Live Preview</button>
                <button className="use-template-btn">Use Template</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeTemplates;
