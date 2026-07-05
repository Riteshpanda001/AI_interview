import React, { useState } from "react";
import "./ATSFAQ.css";

const ATSFAQ = () => {
  const [faqs, setFaqs] = useState([
    {
      question: "What actually is an Applicant Tracking System (ATS)?",
      answer: "An ATS is a software application used by recruiters to collect, sort, scan, and rank job applications. Many companies use them to filter out resumes that don't match the job qualifications before a human ever sees them.",
      open: false
    },
    {
      question: "Can ATS parse PDF files?",
      answer: "Yes, modern ATS systems are highly capable of parsing PDF documents. However, it is essential that the PDF is text-based (not scanned images of text) and doesn't contain complex multi-column tables, graphics, or textboxes.",
      open: false
    },
    {
      question: "How do keywords affect my ATS score?",
      answer: "ATS software counts the frequency and placement of specific job-related keywords in your resume compared to the job description. Matching these exact terms (like 'project management' or 'React') will raise your score.",
      open: false
    },
    {
      question: "Should I include pictures or graphs in my resume?",
      answer: "No. Pictures, graphs, progress bars, and custom diagrams confuse ATS parsers, often causing them to scramble your text or reject your application outright. Stick to clean text layouts.",
      open: false
    }
  ]);

  const toggleFAQ = (idx) => {
    setFaqs(prev => prev.map((f, i) => i === idx ? { ...f, open: !f.open } : f));
  };

  return (
    <div className="ats-faq-container">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know about navigating applicant tracking systems successfully.</p>
      </div>

      <div className="faq-list">
        {faqs.map((faq, idx) => (
          <div key={idx} className={`faq-card ${faq.open ? "open" : ""}`}>
            <div className="faq-question" onClick={() => toggleFAQ(idx)}>
              <h3>{faq.question}</h3>
              <span className="faq-toggle-icon">{faq.open ? "−" : "+"}</span>
            </div>
            {faq.open && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ATSFAQ;
