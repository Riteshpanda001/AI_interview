import React from "react";
import "./ResumeTemplates.css";
import useRequireAuth from "../../hooks/useRequireAuth";

const templatesList = [
  {
    id: "london",
    name: "London Modern Classic",
    tag: "London Style",
    desc: "A clean, modern single-column design with elegant spacing and a crisp blue professional touch.",
    previewBg: "linear-gradient(to right, #1e3a8a, #3b82f6)",
    accentColor: "#2563eb"
  },
  {
    id: "santiago",
    name: "Santiago Bold Mint",
    tag: "Santiago Style",
    desc: "A structured, bold format featuring strong emerald accents and modern professional dividers.",
    previewBg: "linear-gradient(to right, #064e3b, #10b981)",
    accentColor: "#10b981"
  },
  {
    id: "dublin",
    name: "Dublin Split Teal",
    tag: "Dublin Style",
    desc: "A stunning two-column split layout with a full-height teal sidebar for contacts and skills.",
    previewBg: "linear-gradient(to right, #0f766e, #14b8a6)",
    accentColor: "#0d9488"
  },
  {
    id: "helsinki",
    name: "Helsinki Nordic Minimal",
    tag: "Helsinki Style",
    desc: "A ultra-clean, minimalist Nordic style with charcoal tones, thin lines, and heavy emphasis on whitespace.",
    previewBg: "linear-gradient(to right, #1f2937, #4b5563)",
    accentColor: "#1e293b"
  },
  {
    id: "milan",
    name: "Milan Elegant Serif",
    tag: "Milan Style",
    desc: "High-end fashion inspired serif typography with centered header elements and elegant double dividers.",
    previewBg: "linear-gradient(to right, #7f1d1d, #b91c1c)",
    accentColor: "#991b1b"
  },
  {
    id: "stockholm",
    name: "Stockholm Royal Banner",
    tag: "Stockholm Style",
    desc: "Features a beautiful deep purple gradient top header banner, separating personal info from the corporate content.",
    previewBg: "linear-gradient(to right, #4c1d95, #7c3aed)",
    accentColor: "#6d28d9"
  },
  {
    id: "brussels",
    name: "Brussels Slate Sidebar",
    tag: "Brussels Style",
    desc: "A premium split-pane design utilizing a subtle grey left sidebar and deep indigo headings.",
    previewBg: "linear-gradient(to right, #312e81, #4f46e5)",
    accentColor: "#4338ca"
  },
  {
    id: "prague",
    name: "Prague Amber Grid",
    tag: "Prague Style",
    desc: "A creative, contemporary grid layout grouping skills and education inside modern amber-bordered block containers.",
    previewBg: "linear-gradient(to right, #78350f, #d97706)",
    accentColor: "#d97706"
  }
];

const ResumeTemplates = ({ selectedTemplate, setSelectedTemplate }) => {
  const { requireAuth } = useRequireAuth();

  const handleTemplateClick = (tplId) => {
    requireAuth(() => {
      if (setSelectedTemplate) {
        setSelectedTemplate(tplId);
      }
    }, "/resume-builder");
  };

  return (
    <section id="resume-templates-section" className="templates-section">
      <div className="section-header">
        <span className="templates-badge">🎨 CHOOSE YOUR FORMAT</span>
        <h2 className="templates-section-title">
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
            onClick={() => handleTemplateClick(tpl.id)}
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
