import React from "react";
import "./ResumeTemplates.css";

const templatesList = [
  {
    id: "tech",
    name: "Silicon Valley Tech",
    tag: "Most Popular",
    desc: "Clean, linear design emphasizing technical skills, systems, and measurable metrics. ATS optimized.",
    previewBg: "linear-gradient(to right, #0d0822, #1b0f3a)",
    accentColor: "#7c3aed"
  },
  {
    id: "modern",
    name: "Creative Modern",
    tag: "Trending",
    desc: "Elegant layout with gradient dividers, bold subheadings, and a highly polished professional flow.",
    previewBg: "linear-gradient(to right, #001f3f, #0056b3)",
    accentColor: "#06b6d4"
  },
  {
    id: "minimal",
    name: "Executive Minimalist",
    tag: "Corporate",
    desc: "High-contrast, sleek typography focusing on readability, hierarchy, and experience.",
    previewBg: "linear-gradient(to right, #1a1a1a, #333333)",
    accentColor: "#10b981"
  },
  {
    id: "academic",
    name: "Academic Classic",
    tag: "Scientific",
    desc: "Traditional serif styling, ideal for detailed publications, research work, and academic projects.",
    previewBg: "linear-gradient(to right, #2b1f1d, #4a3532)",
    accentColor: "#f59e0b"
  }
];

const ResumeTemplates = ({ selectedTemplate, setSelectedTemplate }) => {
  return (
    <section id="resume-templates-section" className="templates-section">
      <div className="section-header">
        <span className="templates-badge">🎨 CHOOSE YOUR FORMAT</span>
        <h2 className="section-title">
          Professional <span>Resume Templates</span>
        </h2>
        <p className="section-subtitle">
          Select from our list of expert-designed and ATS-friendly templates. 
          Your resume dynamically reformats instantly based on your selection.
        </p>
      </div>

      <div className="templates-grid">
        {templatesList.map((tpl) => (
          <div
            key={tpl.id}
            className={`template-card ${selectedTemplate === tpl.id ? "selected" : ""}`}
            onClick={() => setSelectedTemplate(tpl.id)}
          >
            {tpl.tag && <span className="tpl-tag">{tpl.tag}</span>}
            <div className="tpl-preview-box" style={{ background: tpl.previewBg }}>
              <div className="tpl-simulated-doc">
                <div className="sim-header" style={{ borderColor: tpl.accentColor }}></div>
                <div className="sim-row long"></div>
                <div className="sim-row medium"></div>
                <div className="sim-row-grid">
                  <div className="sim-col"></div>
                  <div className="sim-col"></div>
                </div>
                <div className="sim-row short"></div>
              </div>
            </div>

            <div className="tpl-info">
              <h3>{tpl.name}</h3>
              <p>{tpl.desc}</p>
              <button
                className="select-tpl-btn"
                style={{
                  backgroundColor: selectedTemplate === tpl.id ? tpl.accentColor : "transparent",
                  borderColor: tpl.accentColor,
                  color: selectedTemplate === tpl.id ? "#ffffff" : tpl.accentColor
                }}
              >
                {selectedTemplate === tpl.id ? "✓ Template Active" : "Select Template"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeTemplates;
