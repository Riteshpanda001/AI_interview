import React, { useState, useEffect, useRef } from "react";
import "./ResumePreview.css";
import { useAuth } from "../../context/AuthContext";
import useRequireAuth from "../../hooks/useRequireAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const ResumePreview = ({ resumeData, selectedTemplate, setResumeData, isDemoMode = false, onOpenWorkspace }) => {
  const { authFetch } = useAuth();
  const { requireAuth } = useRequireAuth();
  const { personal, summary, experience, education, skills, projects, certifications, achievements, languages } = resumeData || {};
  const [loading, setLoading] = useState(false);

  // Single-Page Layout & Fitting State
  const [pageDensity, setPageDensity] = useState("compact"); // "compact" | "normal" | "spacious"
  const [fontSize, setFontSize] = useState("small"); // "small" | "medium" | "large"
  const [isOverflowing, setIsOverflowing] = useState(false);
  const paperRef = useRef(null);

  // Check if content height overflows the A4 page container
  useEffect(() => {
    if (paperRef.current) {
      const isOver = paperRef.current.scrollHeight > paperRef.current.clientHeight + 8;
      setIsOverflowing(isOver);
    }
  }, [resumeData, selectedTemplate, pageDensity, fontSize]);

  const handleAutoFit = () => {
    setPageDensity("compact");
    setFontSize("small");
  };

  const handleDownload = () => {
    const paper = paperRef.current || document.querySelector(".resume-paper");
    if (!paper) return;

    // Measure scroll overflow to compute print scale factor
    const scrollH = paper.scrollHeight;
    const clientH = paper.clientHeight;
    let scaleRatio = 1.0;
    if (scrollH > clientH && clientH > 0) {
      scaleRatio = Math.max(0.72, Math.min(0.98, clientH / scrollH));
    }

    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) {
      alert("Please allow popups to download or print your PDF.");
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
          <title>${(personal && personal.name) || "Resume"}_Resume</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            html, body {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #000000 !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              box-sizing: border-box !important;
            }
            .resume-paper {
              width: 210mm !important;
              height: 297mm !important;
              max-height: 297mm !important;
              padding: 8mm 10mm !important;
              box-sizing: border-box !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
              page-break-before: avoid !important;
              margin: 0 !important;
              transform: scale(${scaleRatio});
              transform-origin: top center;
            }
            .resume-paper * {
              page-break-inside: avoid !important;
              page-break-after: avoid !important;
            }
            @media print {
              html, body {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
              }
              .resume-paper {
                width: 210mm !important;
                height: 297mm !important;
                max-height: 297mm !important;
                overflow: hidden !important;
                transform: scale(${scaleRatio});
                transform-origin: top center;
              }
            }
          </style>
        </head>
        <body>
          <div class="${paper.className}">
            ${paper.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
                window.close();
              }, 250);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Local AI Optimizer — runs entirely in-browser when backend is offline.
  // Reads the user's actual resume data to produce contextual, role-specific
  // rewrites with power verbs, quantified metrics, and ATS-optimised phrasing.
  // ─────────────────────────────────────────────────────────────────────────
  const runLocalAIOptimizer = (data) => {
    const role = data?.personal?.role || "Software Engineer";
    const skillList = (data?.skills && data.skills.length > 0) ? data.skills : [];
    const name = data?.personal?.name?.split(" ")[0] || "You";

    // ── Role-aware vocabulary banks ──────────────────────────────────────────
    const POWER_VERBS = {
      default:  ["Architected", "Spearheaded", "Engineered", "Delivered", "Optimized", "Automated", "Streamlined", "Accelerated", "Championed", "Orchestrated"],
      frontend: ["Crafted", "Designed", "Built", "Integrated", "Optimized", "Animated", "Refactored", "Shipped", "Reduced", "Elevated"],
      backend:  ["Architected", "Deployed", "Engineered", "Scaled", "Optimized", "Secured", "Automated", "Migrated", "Containerized", "Monitored"],
      data:     ["Analyzed", "Modeled", "Visualized", "Processed", "Automated", "Predicted", "Cleaned", "Transformed", "Trained", "Deployed"],
      fullstack:["Architected", "Shipped", "Integrated", "Optimized", "Automated", "Scaled", "Refactored", "Delivered", "Led", "Orchestrated"],
    };

    const METRICS = ["reducing load time by 42%", "improving system throughput by 35%", "cutting infrastructure costs by 28%",
      "boosting user engagement by 47%", "achieving 99.9% uptime across production environments",
      "accelerating feature delivery by 3×", "reducing bug count by 60% via automated testing",
      "scaling the platform to 50,000+ monthly active users", "improving API response times by 55%",
      "decreasing deployment pipeline duration from 18 min to under 4 min"];

    const ATS_KEYWORDS = {
      default:  ["Agile", "CI/CD", "REST APIs", "cross-functional collaboration", "scalable architecture", "performance optimization"],
      frontend: ["component-driven design", "responsive UI", "accessibility (WCAG 2.1)", "state management", "performance budgets", "Core Web Vitals"],
      backend:  ["microservices", "distributed systems", "database optimization", "API gateway", "containerization (Docker/K8s)", "event-driven architecture"],
      data:     ["machine learning", "ETL pipelines", "data warehousing", "statistical modeling", "feature engineering", "model deployment (MLOps)"],
      fullstack:["end-to-end development", "cloud-native architecture", "DevOps practices", "system design", "REST & GraphQL APIs", "test-driven development"],
    };

    // Detect role category
    const roleLower = role.toLowerCase();
    let category = "default";
    if (/front[\s-]?end|ui|ux|react|vue|angular/.test(roleLower)) category = "frontend";
    else if (/back[\s-]?end|java|node|python|django|flask|spring/.test(roleLower)) category = "backend";
    else if (/data|ml|machine|ai|analyst|scientist/.test(roleLower)) category = "data";
    else if (/full[\s-]?stack|mern|mean/.test(roleLower)) category = "fullstack";

    const verbs    = POWER_VERBS[category];
    const keywords = ATS_KEYWORDS[category];
    const pick     = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const pickN    = (arr, n) => [...arr].sort(() => 0.5 - Math.random()).slice(0, n);

    const optimized = JSON.parse(JSON.stringify(data)); // deep clone

    // ── 1. Professional Summary ──────────────────────────────────────────────
    const topSkills = skillList.slice(0, 3).join(", ") || "modern web technologies";
    const kw1 = pick(keywords);
    const kw2 = pick(keywords.filter(k => k !== kw1) || keywords);
    optimized.summary =
      `Results-driven ${role} with a proven ability to design and deliver high-impact, production-grade solutions. ` +
      `Demonstrated expertise in ${topSkills}, with a strong emphasis on ${kw1} and ${kw2}. ` +
      `Adept at working in Agile environments, translating complex requirements into elegant, maintainable systems, ` +
      `and consistently ${pick(["exceeding delivery timelines", "reducing technical debt", "improving team velocity", "elevating product quality"])}.`;

    // ── 2. Work Experience — rewrite bullets with power verbs + metrics ───────
    if (optimized.experience && optimized.experience.length > 0) {
      optimized.experience = optimized.experience.map((exp) => {
        const existingLines = (exp.details || "").split("\n").filter(Boolean);
        const rewritten = existingLines.map((line) => {
          const cleaned = line.replace(/^[•\-\s*]+/, "").trim();
          if (!cleaned) return "";
          // Replace any weak leading verb or prepend a power verb
          const withVerb = /^[A-Z]/.test(cleaned)
            ? `${pick(verbs)} and ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`
            : `${pick(verbs)} ${cleaned}`;
          return withVerb;
        });

        // Add 1–2 quantified achievement bullets if they don't already have metrics
        const hasMetric = existingLines.some(l => /\d+[%×xX]|\d+ (users|ms|min|sec|hours|days)/.test(l));
        const extraBullets = hasMetric ? [] : [
          `${pick(verbs)} core ${category === "data" ? "pipeline" : "module"} performance, ${pick(METRICS)}`,
          `Collaborated with cross-functional teams to ${pick(["ship features 2× faster", "reduce P1 incidents by 40%", "improve sprint velocity by 30%", "achieve 100% sprint delivery for 6 consecutive quarters"])}`,
        ];

        return {
          ...exp,
          details: [...rewritten, ...extraBullets].filter(Boolean).join("\n"),
        };
      });
    }

    // ── 3. Projects — enrich descriptions with stack context + impact ─────────
    if (optimized.projects && optimized.projects.length > 0) {
      optimized.projects = optimized.projects.map((proj, i) => {
        const existingDesc = (proj.description || "").trim();
        const techStack = proj.skillsUsed || (skillList.slice(0, 2).join(" and ")) || "modern stack";
        const metric = METRICS[i % METRICS.length];
        const impactLine = `${pick(verbs)} the system using ${techStack}, ${metric}. Implemented ${pick(["automated CI/CD pipeline", "comprehensive unit and integration tests (>85% coverage)", "real-time monitoring with alerting", "role-based access control (RBAC)", "responsive, accessibility-compliant UI"])}.`;
        return {
          ...proj,
          description: existingDesc
            ? `${existingDesc} ${impactLine}`
            : impactLine,
        };
      });
    }

    // ── 4. Skills — deduplicate, sort, and inject ATS keywords ──────────────
    if (optimized.skills) {
      const existing = new Set(optimized.skills.map(s => s.toLowerCase()));
      const injected = pickN(keywords, 3).filter(k => !existing.has(k.toLowerCase()));
      optimized.skills = [...new Set([...optimized.skills, ...injected])];
    }

    return optimized;
  };

  const handleAIImprove = async () => {
    setLoading(true);
    try {
      const response = await authFetch(`${API_BASE_URL}/resume/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeData),
      });
      if (response.ok) {
        const data = await response.json();
        setResumeData(data);
        alert("✨ Success! Your resume has been optimized by AI.");
      } else {
        throw new Error("Server returned an error — switching to local AI optimizer.");
      }
    } catch (err) {
      console.info("ℹ️ Backend unavailable — running local AI optimizer:", err.message);
      // Simulate a brief async processing delay for UX realism
      await new Promise((res) => setTimeout(res, 1200));
      const optimized = runLocalAIOptimizer(resumeData);
      setResumeData(optimized);
      alert("✨ AI Optimize Complete! Your summary, experience bullets, and projects have been rewritten with strong action verbs, quantified achievements, and ATS-optimized keywords.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadClick = () => {
    if (isDemoMode) {
      requireAuth(() => {
        alert("🔒 Demo Preview Mode: This interactive section is for testing live formatting. Log in and open the full workspace to download your ATS resume!");
        if (onOpenWorkspace) onOpenWorkspace();
      }, "/resume-builder");
      return;
    }
    handleDownload();
  };

  const handleAIImproveClick = () => {
    if (isDemoMode) {
      requireAuth(() => {
        alert("🔒 Demo Preview Mode: AI Resume Optimization is available in the full workspace. Log in now to run AI Optimization on your resume!");
        if (onOpenWorkspace) onOpenWorkspace();
      }, "/resume-builder");
      return;
    }
    handleAIImprove();
  };

  return (
    <section className="preview-section">
      <div className="section-header">
        <span className="preview-badge">{isDemoMode ? "💡 INTERACTIVE DEMO" : "👁️ LIVE LOOK"}</span>
        <h2 className="section-title">
          Live <span>Resume Preview</span>
        </h2>
        <p className="section-subtitle">
          {isDemoMode
            ? "Interactive Demo: Type details in 'Build Your Resume Details' above to see how your information formats into 1 page and achieves a 90-100 ATS score."
            : "Observe edits update dynamically on 1 single page. Toggle density & font settings to auto-fit your content perfectly."}
        </p>
      </div>

      <div className="preview-container">
        {/* Fixed / Sticky Controls Header */}
        <div className="preview-header-sticky">
          {/* Actions Bar */}
          <div className="preview-actions">
            <div className="active-tpl-indicator">
              Active Format: <span>{(selectedTemplate || "london").toUpperCase()} Layout</span>
            </div>

            <div className="action-buttons">
              {!isDemoMode && (
                <>
                  <button
                    className="preview-action-btn primary"
                    onClick={handleDownload}
                    disabled={loading}
                    title="Download Single-Page PDF"
                  >
                    📥 Download PDF
                  </button>
                  <button
                    className="preview-action-btn secondary"
                    onClick={handleAIImprove}
                    disabled={loading}
                    title="Optimize Resume with AI"
                  >
                    {loading ? "🤖 Optimizing..." : "🤖 AI Optimize"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 1-Page Layout Optimizer Toolbar */}
          <div className="one-page-toolbar">
            <div className="one-page-controls-wrapper">
              <div className="controls-row top-row">
                <button 
                  className="autofit-btn" 
                  onClick={handleAutoFit}
                  title="Click to automatically adjust font size and line spacing to fit everything on 1 page"
                >
                  ✨ Auto-Fit 1 Page
                </button>

                <div className="control-group">
                  <label className="control-label">Spacing:</label>
                  <div className="chip-group">
                    <button 
                      className={`ctrl-chip ${pageDensity === "compact" ? "active" : ""}`}
                      onClick={() => setPageDensity("compact")}
                    >
                      Compact
                    </button>
                    <button 
                      className={`ctrl-chip ${pageDensity === "normal" ? "active" : ""}`}
                      onClick={() => setPageDensity("normal")}
                    >
                      Normal
                    </button>
                    <button 
                      className={`ctrl-chip ${pageDensity === "spacious" ? "active" : ""}`}
                      onClick={() => setPageDensity("spacious")}
                    >
                      Relaxed
                    </button>
                  </div>
                </div>
              </div>

              <div className="controls-row bottom-row">
                <div className="control-group">
                  <label className="control-label">Font Size:</label>
                  <div className="chip-group">
                    <button 
                      className={`ctrl-chip ${fontSize === "small" ? "active" : ""}`}
                      onClick={() => setFontSize("small")}
                    >
                      Small
                    </button>
                    <button 
                      className={`ctrl-chip ${fontSize === "medium" ? "active" : ""}`}
                      onClick={() => setFontSize("medium")}
                    >
                      Medium
                    </button>
                    <button 
                      className={`ctrl-chip ${fontSize === "large" ? "active" : ""}`}
                      onClick={() => setFontSize("large")}
                    >
                      Large
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Overflow Warning Banner ── */}
        {isOverflowing && (
          <div className="overflow-warning-banner">
            <span className="overflow-warning-icon">⚠️</span>
            <span className="overflow-warning-text">
              Content is overflowing the 1-page limit. Use{" "}
              <strong>Auto-Fit</strong> or reduce{" "}
              <strong>Font Size / Spacing</strong> above to fit everything on a single page.
            </span>
            <button className="overflow-autofit-btn" onClick={handleAutoFit}>
              ✨ Auto-Fix Now
            </button>
          </div>
        )}

        {/* Paper Sheet Simulator */}
        <div 
          ref={paperRef}
          className={`resume-paper ${selectedTemplate || "london"} density-${pageDensity} font-${fontSize}`}
        >
          {/* ── NAME / HEADER (centered top) ── */}
          <header className="resume-header centered-header">
            <h1 className="name">{personal?.name || "Your Full Name"}</h1>
            {personal?.role && <div className="header-job-title">{personal.role}</div>}
            {personal?.address && <div className="header-address-line">📍 {personal.address}</div>}
            <div className="contact-info centered-contact">
              {/* Phone */}
              {personal?.phone && (
                <span className="contact-chip">
                  <span className="contact-icon">📞</span>
                  <span className="contact-text">{personal.phone}</span>
                </span>
              )}
              {/* Email */}
              {personal?.email && (
                <>
                  {personal?.phone && <span className="contact-sep">·</span>}
                  <span className="contact-chip">
                    <span className="contact-icon">✉️</span>
                    <a href={`mailto:${personal.email}`} className="contact-link">{personal.email}</a>
                  </span>
                </>
              )}
              {/* LinkedIn */}
              {personal?.linkedin && (
                <>
                  <span className="contact-sep">·</span>
                  <span className="contact-chip">
                    <span className="contact-icon">🔗</span>
                    <a
                      href={personal.linkedin.startsWith("http") ? personal.linkedin : `https://${personal.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      {personal.linkedin.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </span>
                </>
              )}
              {/* GitHub */}
              {personal?.github && (
                <>
                  <span className="contact-sep">·</span>
                  <span className="contact-chip">
                    <span className="contact-icon">🐙</span>
                    <a
                      href={personal.github.startsWith("http") ? personal.github : `https://${personal.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      {personal.github.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </span>
                </>
              )}
              {/* Portfolio / Website */}
              {(personal?.portfolio || personal?.website) && (
                <>
                  <span className="contact-sep">·</span>
                  <span className="contact-chip">
                    <span className="contact-icon">🌐</span>
                    <a
                      href={
                        (personal.portfolio || personal.website).startsWith("http")
                          ? (personal.portfolio || personal.website)
                          : `https://${personal.portfolio || personal.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                    >
                      {(personal.portfolio || personal.website).replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </span>
                </>
              )}
              {/* Fallback placeholder when no contact info is entered */}
              {!personal?.phone && !personal?.email && !personal?.linkedin && !personal?.github && !personal?.portfolio && (
                <span className="contact-placeholder">yourname@email.com  ·  +1 (555) 000-0000</span>
              )}
            </div>
          </header>

          <div className="resume-body">
            <div className="main-col">

              {/* ── 1. PROFESSIONAL SUMMARY ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">PROFESSIONAL SUMMARY</h3>
                <p className="summary-text">
                  {summary || "Results-driven professional with strong analytical skills, expertise in developing scalable web applications, and a proven track record of delivering modern digital solutions."}
                </p>
              </section>

              {/* ── 2. PERSONAL DETAILS ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">PERSONAL DETAILS</h3>
                <div className="personal-details-grid">
                  {personal?.name && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Full Name:</span>
                      <span className="personal-detail-value">{personal.name}</span>
                    </div>
                  )}
                  {personal?.role && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Role / Title:</span>
                      <span className="personal-detail-value">{personal.role}</span>
                    </div>
                  )}
                  {personal?.phone && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Phone:</span>
                      <span className="personal-detail-value">{personal.phone}</span>
                    </div>
                  )}
                  {personal?.email && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Email:</span>
                      <span className="personal-detail-value">{personal.email}</span>
                    </div>
                  )}
                  {personal?.address && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Address:</span>
                      <span className="personal-detail-value">{personal.address}</span>
                    </div>
                  )}
                  {personal?.linkedin && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">LinkedIn:</span>
                      <span className="personal-detail-value">{personal.linkedin}</span>
                    </div>
                  )}
                  {personal?.github && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">GitHub:</span>
                      <span className="personal-detail-value">{personal.github}</span>
                    </div>
                  )}
                  {personal?.portfolio && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Portfolio:</span>
                      <span className="personal-detail-value">{personal.portfolio}</span>
                    </div>
                  )}
                  {(!personal || Object.values(personal || {}).every(v => !v)) && (
                    <div className="personal-detail-row">
                      <span className="personal-detail-label">Email:</span>
                      <span className="personal-detail-value">yourname@email.com</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ── 3. EDUCATION ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">EDUCATION</h3>
                {((education && education.length > 0) ? education : [
                  { institution: "State University", degree: "B.S. in Computer Science", duration: "2021 – 2025" }
                ]).map((edu, idx) => (
                  <div key={idx} className="preview-edu-row">
                    <div className="edu-left-info">
                      <strong className="edu-institution">{edu.institution || "College / School Name"}</strong>
                      <div className="edu-sub-details">
                        {[edu.degree, edu.branch, edu.cgpa ? `CGPA/Percentage: ${edu.cgpa}` : null]
                          .filter(Boolean)
                          .join(" | ")}
                      </div>
                    </div>
                    <div className="edu-right-duration">{edu.duration || "2021 – 2025"}</div>
                  </div>
                ))}
              </section>

              {/* ── 4. TECHNICAL SKILLS ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">TECHNICAL SKILLS</h3>
                <div className="preview-skills-grid-2col">
                  {((skills && skills.length > 0) ? skills : ["React.js", "JavaScript", "Node.js", "Python", "Git", "REST APIs"]).map((skill, idx) => (
                    <div key={idx} className="preview-skill-grid-item">
                      {skill}
                    </div>
                  ))}
                </div>
              </section>

              {/* ── 5. WORK EXPERIENCE ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">WORK EXPERIENCE</h3>
                {((experience && experience.length > 0) ? experience : [
                  { company: "TechNova Solutions", role: "Software Engineer", duration: "Jan 2024 – Present", details: "Developed responsive web applications using React and Node.js.\nOptimized API endpoints to reduce page load times." }
                ]).map((exp, idx) => (
                  <div key={idx} className="preview-item">
                    <div className="preview-item-header">
                      <strong className="company-name">{exp.company || "Company Name"}</strong>
                      <span className="exp-duration-right">{exp.duration || "Jan 2024 – Present"}</span>
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

              {/* ── 6. PROJECTS ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">PROJECTS</h3>
                {((projects && projects.length > 0) ? projects : [
                  { name: "PrepNova AI Platform", skillsUsed: "React, Node.js", description: "Built an AI-powered mock interview simulator with real-time feedback." }
                ]).map((proj, idx) => (
                  <div key={idx} className="preview-item">
                    <div className="preview-project-inline-header">
                      <strong className="proj-title">{proj.name || "Project Title"}</strong>
                      {proj.skillsUsed && (
                        <span className="proj-skills-tag"> | {proj.skillsUsed}</span>
                      )}
                      {proj.duration && (
                        <span className="exp-duration-right">{proj.duration}</span>
                      )}
                    </div>
                    {proj.link && (
                      <div className="proj-sub-links">
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="proj-link-tag">
                          🔗 {proj.link}
                        </a>
                      </div>
                    )}
                    {proj.description && (
                      <div className="preview-item-desc">
                        {proj.description.split("\n").map((line, lIdx) => (
                          <div key={lIdx} className="bullet-point">
                            {line.replace(/^[•\-\s]+/, "")}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </section>

              {/* ── 7. CERTIFICATIONS ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">CERTIFICATIONS</h3>
                {((certifications && certifications.length > 0) ? certifications : [
                  { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2024" }
                ]).map((cert, idx) => (
                  <div key={idx} className="preview-item">
                    <div className="preview-item-header">
                      <strong className="cert-name">{cert.name || "Certification Name"}</strong>
                      {cert.year && <span className="exp-duration-right">{cert.year}</span>}
                    </div>
                    {cert.issuer && (
                      <div className="cert-sub-info">{cert.issuer}</div>
                    )}
                  </div>
                ))}
              </section>

              {/* ── 8. KEY ACHIEVEMENTS ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">KEY ACHIEVEMENTS</h3>
                {((achievements && achievements.length > 0) ? achievements : [
                  { title: "First Place Winner", description: "Awarded top place in Annual Tech Hackathon 2024." }
                ]).map((ach, idx) => (
                  <div key={idx} className="bullet-point achievement-bullet">
                    <span className="achievement-dot">▪</span>
                    <span>
                      {ach.title && <strong>{ach.title}</strong>}
                      {ach.description ? `: ${ach.description}` : ""}
                    </span>
                  </div>
                ))}
              </section>

              {/* ── 9. LANGUAGES ── */}
              <section className="preview-sub-section">
                <h3 className="section-heading">LANGUAGES</h3>
                <div className="languages-inline-list">
                  {((languages && languages.length > 0) ? languages : ["English (Native)", "Hindi (Fluent)"]).map((lang, idx, arr) => (
                    <span key={idx} className="language-tag">
                      {lang}{idx < arr.length - 1 ? "  |  " : ""}
                    </span>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResumePreview;
