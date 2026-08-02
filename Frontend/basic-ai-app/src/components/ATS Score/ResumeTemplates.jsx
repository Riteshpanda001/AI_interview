import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useRequireAuth from "../../hooks/useRequireAuth";
import "./ResumeTemplates.css";

const ResumeTemplates = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const { requireAuth } = useRequireAuth();

  const templates = [
    {
      id: 1,
      name: "Modern Minimalist",
      category: "minimal",
      score: "99% ATS Score",
      desc: "Clean single-column layout emphasizing readable sections, standard typography, and high keyword density.",
      image: "📂"
    },
    {
      id: 2,
      name: "Professional Executive",
      category: "classic",
      score: "98% ATS Score",
      desc: "A timeless reverse-chronological layout favored by recruiters in finance, management, and enterprise tech.",
      image: "💼"
    },
    {
      id: 3,
      name: "Tech Innovator",
      category: "modern",
      score: "95% ATS Score",
      desc: "Features a modern structured layout with dedicated technical skills matrix and project architecture callouts.",
      image: "💻"
    },
    {
      id: 4,
      name: "Creative Narrative",
      category: "creative",
      score: "88% ATS Score",
      desc: "Best for design and product submissions where project storytelling and portfolio branding are prioritized.",
      image: "🎨"
    }
  ];

  const filteredTemplates = selectedCategory === "all"
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = () => {
    requireAuth(() => {
      navigate("/resume-builder");
    }, "/resume-builder");
  };

  return (
    <section className="ats-templates-section">
      <div className="section-header" style={{ textAlign: "center", marginBottom: "40px" }}>
        <span className="ats-templates-badge">🎨 PRE-VALIDATED TEMPLATES</span>
        <h2 className="section-title" style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "12px", marginBottom: "12px" }}>
          ATS-Optimized <span>Resume Templates</span>
        </h2>
        <p className="section-subtitle" style={{ color: "#6b7280", maxWidth: "680px", margin: "auto" }}>
          Choose from pre-formatted templates specifically engineered to pass ATS parsers and impress recruiters.
        </p>

        <div className="category-pills">
          <button className={selectedCategory === "all" ? "active" : ""} onClick={() => setSelectedCategory("all")}>All Styles</button>
          <button className={selectedCategory === "minimal" ? "active" : ""} onClick={() => setSelectedCategory("minimal")}>Minimal</button>
          <button className={selectedCategory === "classic" ? "active" : ""} onClick={() => setSelectedCategory("classic")}>Classic</button>
          <button className={selectedCategory === "modern" ? "active" : ""} onClick={() => setSelectedCategory("modern")}>Modern</button>
        </div>
      </div>

      <div className="ats-templates-grid">
        {filteredTemplates.map(t => (
          <div key={t.id} className="ats-template-card">
            <div className="ats-template-preview-mock">
              <span className="ats-template-emoji">{t.image}</span>
              <span className="ats-compatibility-badge">{t.score}</span>
            </div>
            
            <div className="ats-template-info">
              <h3>{t.name}</h3>
              <p>{t.desc}</p>
              
              <div className="ats-template-actions">
                <button className="ats-preview-template-btn" onClick={handleUseTemplate}>Live Preview</button>
                <button className="ats-use-template-btn" onClick={handleUseTemplate}>Use Template</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeTemplates;
