import React, { useState } from "react";
import "./ResumeFAQ.css";

const faqData = [
  {
    question: "What is an ATS and why is ATS optimization important?",
    answer: "An Applicant Tracking System (ATS) is software employers use to filter and sort resumes. Optimization ensures your resume contains the right keywords, headings, and structures so it doesn't get automatically rejected before reaching a human recruiter."
  },
  {
    question: "How does the AI Resume Builder optimize my content?",
    answer: "Our AI scans your text fields in real time to suggest powerful action verbs, quantitative metrics, and industry-standard formatting. It also detects missing technical keywords based on common job descriptions in your domain."
  },
  {
    question: "Can I download my resume as a PDF or DOCX file?",
    answer: "Yes, you can instantly export your finalized resume as a polished PDF using our high-fidelity layout engine. The PDF is structured dynamically so text remains readable and indexable by all ATS parsers."
  },
  {
    question: "Are these templates free to use?",
    answer: "Absolutely. All resume templates offered in our builder (Silicon Valley Tech, Creative Modern, Executive Minimal, and Academic Classic) are fully open and free for you to customize, edit, and export."
  }
];

const ResumeFAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="section-header">
        <span className="faq-badge">❓ HELP & DOCUMENTATION</span>
        <h2 className="section-title">
          Frequently Asked <span>Questions</span>
        </h2>
        <p className="section-subtitle">
          Got questions about ATS optimization, layout formats, or AI scanning? We have answers.
        </p>
      </div>

      <div className="faq-container">
        {faqData.map((faq, idx) => (
          <div
            key={idx}
            className={`faq-item-card ${activeIndex === idx ? "active" : ""}`}
            onClick={() => toggleFAQ(idx)}
          >
            <div className="faq-question-box">
              <h4>{faq.question}</h4>
              <span className="faq-toggle-arrow">{activeIndex === idx ? "▲" : "▼"}</span>
            </div>
            <div className="faq-answer-box">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeFAQ;
