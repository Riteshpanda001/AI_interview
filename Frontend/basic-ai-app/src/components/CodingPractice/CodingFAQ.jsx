import React, { useState } from "react";
import "./CodingFAQ.css";

const FAQS = [
  {
    q: "How many questions should I practice to crack top product companies?",
    a: "Quality matters more than quantity. Focus on mastering the top 150 patterns (like dynamic programming, sliding window, prefix sum). Solving 200-300 selected problems is generally sufficient if you explain your logic well."
  },
  {
    q: "Which language is best for coding interviews?",
    a: "Use the language you are most comfortable with. Java, C++, and Python are widely supported and have rich standard collections. Python is often preferred for speed and readability."
  },
  {
    q: "How does the AI Assistant analyze code complexity?",
    a: "The evaluator performs a static and dynamic trace of your code loops, array dimensions, recursion trees, and variable memory. It then derives exact big-O runtimes and space limits."
  }
];

const CodingFAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="coding-faq-section">
      <div className="coding-faq-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">💬 FAQ Help</span>
          <h2>Practice FAQ</h2>
          <p>Get answers to common queries about compilers, programming languages, and AI scoring metrics.</p>
        </div>

        <div className="faq-accordion-list">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                className={`company-faq-item card ${isOpen ? "open" : ""}`}
                key={idx}
                onClick={() => setOpenIdx(isOpen ? null : idx)}
              >
                <div className="faq-question-row">
                  <h3>{faq.q}</h3>
                  <span className={`faq-arrow ${isOpen ? "rotate" : ""}`}>▼</span>
                </div>
                {isOpen && (
                  <div className="faq-answer-row">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CodingFAQ;
