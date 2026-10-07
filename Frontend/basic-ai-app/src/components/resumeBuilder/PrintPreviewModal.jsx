import React, { useState } from "react";
import "./PrintPreviewModal.css";

const PrintPreviewModal = ({ isOpen, onClose, resumeData, selectedTemplate, onDownloadPdf, onDownloadDocx }) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);

  if (!isOpen) return null;

  const candidateName = resumeData?.personal?.name || "Resume";

  const handlePrint = () => {
    const paper = document.querySelector(".print-paper-content");
    if (!paper) {
      window.print();
      return;
    }

    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) {
      window.print();
      return;
    }

    let stylesHtml = "";
    for (const styleSheet of document.styleSheets) {
      try {
        let rulesHtml = "";
        for (const rule of styleSheet.cssRules) {
          rulesHtml += rule.cssText;
        }
        stylesHtml += `<style>${rulesHtml}</style>`;
      } catch (e) {
        if (styleSheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${styleSheet.href}">`;
        }
      }
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${candidateName}_Resume</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm !important;
            }
            html, body {
              width: 100% !important;
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .resume-paper {
              width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .preview-sub-section, .preview-item, .preview-edu-row {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            @media print {
              .section-heading {
                break-after: avoid !important;
                page-break-after: avoid !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="resume-paper ${selectedTemplate || "london"}">
            ${paper.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            });
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const { personal, summary, experience, education, skills, projects, certifications, achievements, languages } = resumeData || {};

  return (
    <div className="print-preview-overlay" onClick={onClose}>
      <div className="print-preview-card" onClick={(e) => e.stopPropagation()}>
        {/* Top Action Bar */}
        <div className="print-preview-topbar">
          <div className="topbar-left">
            <span className="print-badge">🖨️ PRINT & PDF PREVIEW</span>
            <h3>{candidateName} — Print Ready Preview</h3>
          </div>

          <div className="topbar-controls">
            {/* Zoom Controls */}
            <div className="zoom-chip-group">
              <button
                className={`zoom-chip ${zoomLevel === 0.8 ? "active" : ""}`}
                onClick={() => setZoomLevel(0.8)}
              >
                80%
              </button>
              <button
                className={`zoom-chip ${zoomLevel === 1.0 ? "active" : ""}`}
                onClick={() => setZoomLevel(1.0)}
              >
                100%
              </button>
              <button
                className={`zoom-chip ${zoomLevel === 1.15 ? "active" : ""}`}
                onClick={() => setZoomLevel(1.15)}
              >
                115%
              </button>
            </div>

            <button className="btn-print-action primary" onClick={handlePrint}>
              🖨️ Print / Save as PDF
            </button>

            {onDownloadDocx && (
              <button className="btn-print-action secondary" onClick={onDownloadDocx}>
                📝 Export DOCX
              </button>
            )}

            <button className="print-modal-close" onClick={onClose} title="Close Preview">
              ✕
            </button>
          </div>
        </div>

        {/* Paginated Sheet View */}
        <div className="print-preview-stage">
          <div
            className="print-page-wrapper"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
          >
            <div className="print-page-frame">
              <div className="page-header-tag">Page 1 — Standard A4</div>
              
              <div className={`resume-paper print-paper-content ${selectedTemplate || "london"}`}>
                {/* Header */}
                <header className="resume-header centered-header">
                  <h1 className="name">{personal?.name || "Your Full Name"}</h1>
                  {personal?.role && <div className="header-job-title">{personal.role}</div>}
                  {personal?.address && <div className="header-address-line">📍 {personal.address}</div>}
                  <div className="contact-info centered-contact">
                    {personal?.phone && <span className="contact-chip">📞 {personal.phone}</span>}
                    {personal?.email && <span className="contact-chip">✉️ {personal.email}</span>}
                    {personal?.linkedin && <span className="contact-chip">🔗 {personal.linkedin}</span>}
                    {personal?.github && <span className="contact-chip">🐙 {personal.github}</span>}
                  </div>
                </header>

                <div className="resume-body">
                  <div className="main-col">
                    {/* Summary */}
                    {summary && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">PROFESSIONAL SUMMARY</h3>
                        <p className="summary-text">{summary}</p>
                      </section>
                    )}

                    {/* Skills */}
                    {skills && skills.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">TECHNICAL SKILLS</h3>
                        <div className="preview-skills-grid-2col">
                          {skills.map((s, i) => (
                            <div key={i} className="preview-skill-grid-item">{s}</div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Experience */}
                    {experience && experience.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">WORK EXPERIENCE</h3>
                        {experience.map((exp, idx) => (
                          <div key={idx} className="preview-item">
                            <div className="preview-item-header">
                              <strong className="company-name">{exp.company || "Company"}</strong>
                              <span className="exp-duration-right">{exp.duration}</span>
                            </div>
                            {exp.role && <div className="exp-job-title">{exp.role}</div>}
                            {exp.details && (
                              <div className="preview-item-desc">
                                {exp.details.split("\n").map((line, lIdx) => (
                                  <div key={lIdx} className="bullet-point">
                                    {line.replace(/^[•\-\s]+/, "")}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Projects */}
                    {projects && projects.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">PROJECTS</h3>
                        {projects.map((proj, idx) => (
                          <div key={idx} className="preview-item">
                            <div className="preview-project-inline-header">
                              <strong className="proj-title">{proj.name || "Project"}</strong>
                              {proj.skillsUsed && <span className="proj-skills-tag"> | {proj.skillsUsed}</span>}
                            </div>
                            {proj.description && (
                              <div className="preview-item-desc">
                                {proj.description.split("\n").map((line, lIdx) => (
                                  <div key={lIdx} className="bullet-point">{line.replace(/^[•\-\s]+/, "")}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Education */}
                    {education && education.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">EDUCATION</h3>
                        {education.map((edu, idx) => (
                          <div key={idx} className="preview-edu-row">
                            <div className="edu-left-info">
                              <strong className="edu-institution">{edu.institution}</strong>
                              <div className="edu-sub-details">
                                {[edu.degree, edu.branch, edu.cgpa ? `CGPA: ${edu.cgpa}` : null].filter(Boolean).join(" | ")}
                              </div>
                            </div>
                            <div className="edu-right-duration">{edu.duration}</div>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Certifications */}
                    {certifications && certifications.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">CERTIFICATIONS</h3>
                        {certifications.map((c, i) => (
                          <div key={i} className="preview-item">
                            <div className="preview-item-header">
                              <strong>{c.name}</strong>
                              <span>{c.year}</span>
                            </div>
                            {c.issuer && <div className="cert-sub-info">{c.issuer}</div>}
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Achievements */}
                    {achievements && achievements.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">KEY ACHIEVEMENTS</h3>
                        {achievements.map((ach, i) => (
                          <div key={i} className="bullet-point achievement-bullet">
                            <span className="achievement-dot">▪</span>
                            <span>
                              {ach.title && <strong>{ach.title}: </strong>}
                              {ach.description}
                            </span>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Languages */}
                    {languages && languages.length > 0 && (
                      <section className="preview-sub-section">
                        <h3 className="section-heading">LANGUAGES</h3>
                        <div className="languages-inline-list">
                          {languages.map((l, i) => (
                            <span key={i} className="language-tag">
                              {l}{i < languages.length - 1 ? "  |  " : ""}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintPreviewModal;
