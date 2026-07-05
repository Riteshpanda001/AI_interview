import React, { useState } from "react";
import "./CompanyFAQ.css";

const FAQ_DATA = {
  Google: [
    { q: "Does Google still ask hard Dynamic Programming questions?", a: "Yes, though less frequent than graph traversal or heap puzzles, Google still asks DP optimization and memoization questions, especially for SDE II/III tracks." },
    { q: "How long does the team-matching phase typically take?", a: "Team matching can take anywhere from 2 weeks to 2 months. You will talk with various engineering managers to align projects before the official offer is compiled." },
    { q: "What is the passing score for the Google hiring committee?", a: "The committee evaluates the consensus of your onsite feedback sheets. Generally, receiving at least 3 'Lean Hires' and no 'Strong No Hires' is required." }
  ],
  Microsoft: [
    { q: "How important is OOP design patterns in Microsoft onsite rounds?", a: "Extremely important. Microsoft values modular, maintainable code. Expect rounds dedicated specifically to Low-Level Object-Oriented Design (LLD) patterns." },
    { q: "Can I choose my programming language for the coding screen?", a: "Yes, you can write solutions in C++, Java, Python, C#, or JavaScript. Make sure you are fluent in your chosen language's standard libraries." }
  ],
  Amazon: [
    { q: "How are the Amazon Leadership Principles evaluated?", a: "Every single round features 2 behavioral questions evaluating specific principles (e.g., Customer Obsession, Ownership, Bias for Action). You must answer using the STAR methodology." },
    { q: "Is the System Design round required for SDE I roles?", a: "No, SDE I rounds focus almost entirely on DSA and basic LLD design. SDE II and above rounds include mandatory HLD design sessions." }
  ],
  Meta: [
    { q: "What is the coding speed expected in Meta coding interviews?", a: "You must solve two medium DSA problems in 40-45 minutes. This includes explaining the approach, dry running with custom inputs, and stating complexities." },
    { q: "Does Meta allow compile-time checks in coding screens?", a: "Usually no. Coding screens are conducted on a plain text editor without compilation or auto-completion. Practice writing syntactic code without compile checks!" }
  ],
  Netflix: [
    { q: "Why is Netflix culture fit considered a bar-raiser round?", a: "Netflix operates on freedom, maturity, and direct feedbacks. Candidates must show strong independence, self-motivation, and lack of ego." }
  ],
  Apple: [
    { q: "How deeply does Apple test low-level memory logic?", a: "For core software positions, deeply. Expect questions on heap fragmentation, caching structures, interrupts, registers, and assembly mechanics." }
  ],
  TCS: [
    { q: "What is the difference between TCS Ninja, Digital, and Prime?", a: "Ninja (3.6 LPA) covers fundamental operations; Digital (7 LPA) tests advanced web dev and logical programming; Prime (9 LPA) tests core competitive DSA and cloud structures." },
    { q: "Can I reappear for TCS NQT if I fail the screen?", a: "Yes. TCS conducts NQT assessments multiple times throughout the year. You can purchase tokens and reappear to improve your logic score." }
  ],
  Infosys: [
    { q: "What are the programming sections in Infosys Specialist Programmer test?", a: "The specialist programmer test features 3 competitive programming questions (ranging from medium arrays/prefix sums to hard trees/DP) to be solved in 3 hours." }
  ]
};

const CompanyFAQ = ({ companyName }) => {
  const faqs = FAQ_DATA[companyName] || FAQ_DATA.Google;
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="company-faq-section">
      <div className="company-faq-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">💬 FAQ Help</span>
          <h2>Hiring FAQs</h2>
          <p>Read commonly asked questions about recruitment parameters, eligibility criteria, and screen expectations at {companyName}.</p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                className={`company-faq-item card ${isOpen ? "open" : ""}`} 
                key={index}
                onClick={() => toggleFAQ(index)}
              >
                <div className="faq-question-row">
                  <h3>{item.q}</h3>
                  <span className={`faq-arrow ${isOpen ? "rotate" : ""}`}>
                    ▼
                  </span>
                </div>
                
                {isOpen && (
                  <div className="faq-answer-row animate-expand">
                    <p>{item.a}</p>
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

export default CompanyFAQ;
