import React, { useState } from "react";
import "./ATSFAQ.css";

const ATSFAQ = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "What actually is an Applicant Tracking System (ATS)?",
      answer: "An ATS is a software application used by recruiters to collect, sort, scan, and rank job applications. Many companies use them to filter out resumes that don't match the job qualifications before a human recruiter ever sees them.",
      open: false
    },
    {
      question: "Can ATS parse PDF files?",
      answer: "Yes, modern ATS systems are highly capable of parsing PDF documents. However, it is essential that the PDF is text-based (not scanned image PDFs) and avoids multi-column tables, floating text boxes, or graphics.",
      open: false
    },
    {
      question: "How do keywords affect my ATS score?",
      answer: "ATS software counts the frequency and placement of specific job-related hard and soft keywords in your resume compared to the target job description. Matching these exact terms (such as 'React', 'Python', or 'CI/CD') raises your score.",
      open: false
    },
    {
      question: "Should I include pictures or graphs in my resume?",
      answer: "No. Pictures, graphs, progress bars, and custom diagrams confuse ATS parsers, often causing them to scramble your text or reject your application outright. Stick to clean, single-column text layouts.",
      open: false
    }
  ]);

  const toggleFAQ = (idx) => {
    setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, open: !f.open } : f));
  };

  return (
    <section className="ats-faq-section">
      <div className="section-header" style={{ textAlign: "center", marginBottom: "50px" }}>
        <span className="ats-faq-badge">❓ ATS HELP CENTER</span>
        <h2 className="section-title" style={{ fontSize: "2.5rem", fontWeight: "700", marginTop: "12px", marginBottom: "12px" }}>
          Frequently Asked <span>Questions</span>
        </h2>
        <p className="section-subtitle" style={{ color: "#6b7280", maxWidth: "680px", margin: "auto" }}>
          Everything you need to know about navigating applicant tracking systems successfully and boosting your match score.
        </p>
      </div>

      <div className="ats-faq-list-container">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className={`ats-faq-item-card ${faq.open ? "active" : ""}`}
            onClick={() => toggleFAQ(idx)}
          >
            <div className="ats-faq-question-box">
              <h4>{faq.question}</h4>
              <span className="ats-faq-toggle-icon">{faq.open ? "−" : "+"}</span>
            </div>
            {faq.open && (
              <div className="ats-faq-answer-box">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ATSFAQ;
