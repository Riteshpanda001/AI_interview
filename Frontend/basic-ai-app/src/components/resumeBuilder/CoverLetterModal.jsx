import React, { useState } from "react";
import { API_BASE_URL } from "../../utils/apiConfig";
import "./CoverLetterModal.css";

const TONE_OPTIONS = [
  { id: "Professional", label: "Professional", desc: "Balanced, executive, and polished" },
  { id: "Confident", label: "Confident", desc: "Bold, achievement-oriented, and decisive" },
  { id: "Concise", label: "Concise", desc: "Direct, high-impact, and to-the-point" },
  { id: "Technical", label: "Technical", desc: "Engineering-focused with tech stack depth" },
  { id: "Friendly", label: "Friendly", desc: "Warm, culturally-aligned, and collaborative" }
];

const CoverLetterModal = ({ isOpen, onClose, resumeData, authFetch }) => {
  const [targetRole, setTargetRole] = useState(resumeData?.personal?.role || "");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState("Professional");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const candidateName = resumeData?.personal?.name || "Candidate Name";
  const candidateEmail = resumeData?.personal?.email || "candidate@example.com";
  const candidatePhone = resumeData?.personal?.phone || "";

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        resume_data: resumeData,
        target_role: targetRole || resumeData?.personal?.role || "Software Engineer",
        company: company || "Hiring Team",
        job_description: jobDescription,
        tone: tone,
        additional_instructions: additionalInstructions
      };

      const res = await authFetch(`${API_BASE_URL}/resumes/cover-letter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Authentication required. Please log in.");
        if (res.status === 403) throw new Error("Access forbidden to this resource.");
        if (res.status === 429) throw new Error("Rate limit exceeded. Please wait a moment and try again.");
        if (res.status === 422) throw new Error("Validation error with the submitted resume details.");
        if (res.status >= 500) throw new Error("AI service temporarily busy. Please retry.");
        throw new Error(`Server returned error (${res.status})`);
      }

      const data = await res.json();
      if (data && data.cover_letter) {
        setCoverLetterText(data.cover_letter);
      } else {
        throw new Error("Received empty response from cover letter generator.");
      }
    } catch (err) {
      console.error("Cover letter generation error:", err);
      setErrorMsg(err.message || "Network error. Please ensure backend is reachable.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetterText) return;
    navigator.clipboard.writeText(coverLetterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDocx = () => {
    if (!coverLetterText) return;
    const formattedHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Cover Letter - ${candidateName}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #111; margin: 1in; }
        h1 { font-size: 18pt; margin-bottom: 2pt; color: #1e3a8a; }
        .meta { color: #555; font-size: 10pt; margin-bottom: 18pt; }
        .body-p { margin-bottom: 12pt; white-space: pre-wrap; }
      </style>
      </head>
      <body>
        <h1>${candidateName}</h1>
        <div class="meta">${candidateEmail} ${candidatePhone ? `| ${candidatePhone}` : ""}</div>
        <div class="body-p">${coverLetterText.replace(/\n\n/g, "<br/><br/>")}</div>
      </body>
      </html>
    `;
    const blob = new Blob(["\ufeff" + formattedHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${candidateName.replace(/\s+/g, "_")}_Cover_Letter.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (!coverLetterText) return;
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) {
      alert("Please allow popups to preview and print your Cover Letter.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cover Letter - ${candidateName}</title>
          <style>
            @page { size: A4 portrait; margin: 20mm; }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #1e293b;
              line-height: 1.65;
              padding: 0;
              margin: 0;
              background: #fff;
            }
            .header-block {
              border-bottom: 2px solid #2563eb;
              padding-bottom: 12px;
              margin-bottom: 24px;
            }
            .header-name {
              font-size: 22pt;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 4px 0;
            }
            .header-contact {
              font-size: 10pt;
              color: #475569;
            }
            .date-line {
              font-size: 10pt;
              color: #64748b;
              margin-bottom: 18px;
            }
            .letter-content {
              font-size: 11pt;
              white-space: pre-wrap;
              color: #1e293b;
            }
          </style>
        </head>
        <body>
          <div class="header-block">
            <h1 class="header-name">${candidateName}</h1>
            <div class="header-contact">${candidateEmail} ${candidatePhone ? `· ${candidatePhone}` : ""}</div>
          </div>
          <div class="date-line">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
          <div class="letter-content">${coverLetterText}</div>
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

  return (
    <div className="cover-letter-overlay" onClick={onClose}>
      <div className="cover-letter-card" onClick={(e) => e.stopPropagation()}>
        <button className="cover-letter-close" onClick={onClose} title="Close">
          ✕
        </button>

        <div className="cover-letter-header">
          <div className="cover-letter-badge">📝 AI COVER LETTER ENGINE</div>
          <h2>
            Tailored <span>Cover Letter</span>
          </h2>
          <p className="cover-letter-sub">
            Generate an executive-grade, role-aligned cover letter extracted directly from your current resume.
          </p>
        </div>

        {errorMsg && (
          <div className="cover-letter-error-box">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        <div className="cover-letter-body-grid">
          {/* Left Column: Form Settings */}
          <div className="cover-letter-form-pane">
            <h4 className="pane-section-title">🎯 Job Target & Parameters</h4>

            <div className="cl-form-group">
              <label>Target Job Role *</label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Engineer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="cl-form-group">
              <label>Company / Hiring Organization</label>
              <input
                type="text"
                placeholder="e.g. Google, Stripe, TechCorp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="cl-form-group">
              <label>Writing Tone</label>
              <div className="cl-tone-grid">
                {TONE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`cl-tone-chip ${tone === t.id ? "active" : ""}`}
                    onClick={() => setTone(t.id)}
                  >
                    <strong>{t.label}</strong>
                    <span>{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cl-form-group">
              <label>Job Description (Optional)</label>
              <textarea
                rows={4}
                placeholder="Paste key responsibilities or qualifications to tailor keywords..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="cl-form-group">
              <label>Additional Custom Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Emphasize AWS certification and cloud migration experience"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
              />
            </div>

            <button
              className="btn-generate-cover-letter"
              disabled={loading}
              onClick={handleGenerate}
            >
              {loading ? (
                <>
                  <span className="cl-spinner"></span> Generating your cover letter...
                </>
              ) : coverLetterText ? (
                "🔄 Regenerate Cover Letter"
              ) : (
                "✨ Generate Cover Letter"
              )}
            </button>
          </div>

          {/* Right Column: Output & Actions */}
          <div className="cover-letter-preview-pane">
            <div className="cl-preview-top-bar">
              <span className="cl-preview-status">
                {coverLetterText ? "📄 Generated Result" : "⚡ Ready to Generate"}
              </span>

              {coverLetterText && (
                <div className="cl-preview-actions">
                  <button
                    className={`cl-act-btn ${isEditing ? "active" : ""}`}
                    onClick={() => setIsEditing(!isEditing)}
                    title="Toggle editing"
                  >
                    {isEditing ? "✓ Save Edit" : "✏️ Edit"}
                  </button>
                  <button
                    className="cl-act-btn"
                    onClick={handleCopy}
                    title="Copy to clipboard"
                  >
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </button>
                  <button
                    className="cl-act-btn"
                    onClick={handleDownloadPdf}
                    title="Print or Save PDF"
                  >
                    📥 PDF
                  </button>
                  <button
                    className="cl-act-btn"
                    onClick={handleDownloadDocx}
                    title="Download Word Document"
                  >
                    📝 DOCX
                  </button>
                </div>
              )}
            </div>

            <div className="cl-document-wrapper">
              {loading ? (
                <div className="cl-loading-state">
                  <div className="cl-big-spinner"></div>
                  <h3>Generating your personalized cover letter...</h3>
                  <p>Synthesizing resume experience with target role qualifications</p>
                </div>
              ) : coverLetterText ? (
                <div className="cl-paper-sheet">
                  <div className="cl-letter-meta">
                    <strong>{candidateName}</strong>
                    <span>{candidateEmail} {candidatePhone ? `| ${candidatePhone}` : ""}</span>
                    <span className="cl-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>

                  {isEditing ? (
                    <textarea
                      className="cl-editor-textarea"
                      value={coverLetterText}
                      onChange={(e) => setCoverLetterText(e.target.value)}
                    />
                  ) : (
                    <div className="cl-formatted-content">
                      {coverLetterText.split("\n\n").map((p, idx) => (
                        <p key={idx}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="cl-empty-state">
                  <div className="cl-empty-icon">✉️</div>
                  <h4>No Cover Letter Generated Yet</h4>
                  <p>
                    Select your target role and tone on the left, then click <strong>Generate Cover Letter</strong> to create a personalized letter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterModal;
