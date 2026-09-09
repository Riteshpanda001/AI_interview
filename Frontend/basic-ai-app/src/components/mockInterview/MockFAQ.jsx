import React, { useState } from "react";
import "./MockFAQ.css";

const faqData = [
  {
    question: "What is an AI Mock Interview?",
    answer:
      "PrepNova AI Mock Interview simulates a real interview experience using Artificial Intelligence. It asks technical, HR, behavioral, coding, and company-specific questions based on your resume, selected company, and job role. After every answer, the AI provides instant feedback to improve your performance."
  },

  {
    question: "Can I practice company-specific and resume-based interviews?",
    answer:
      "Yes. You can upload your resume or job description to receive tailored questions, or select target companies like Google, Microsoft, Amazon, TCS, Infosys, and many more to practice role-specific scenarios."
  },

  {
    question: "Does the AI provide feedback after every interview?",
    answer:
      "Absolutely. After every interview, PrepNova AI generates a detailed report including technical score, communication score, confidence level, grammar analysis, answer quality, and personalized improvement suggestions."
  },

  {
    question: "Does the platform support coding and voice-based interviews?",
    answer:
      "Yes. PrepNova AI supports real-time voice interviews using speech recognition as well as technical coding interviews covering Data Structures, Algorithms, System Design, SQL, and popular programming languages."
  },

  {
    question: "Is my resume and interview data secure?",
    answer:
      "Absolutely. Your uploaded resumes, interview recordings, reports, and personal information are securely encrypted and never shared with recruiters or third parties without your explicit permission."
  },

  {
    question: "Why should I choose PrepNova AI over traditional mock interviews?",
    answer:
      "PrepNova AI is available 24/7, provides instant personalized feedback, tracks your progress over time, and allows unlimited practice at a fraction of the cost of traditional human mock interviews."
  }
];

const MockFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <section className="faq-section">

      <div className="faq-header">

        <span>Frequently Asked Questions</span>

        <h2>Everything You <span>Need To Know</span></h2>

        <p>
          Find answers to the most common questions about
          PrepNova AI Mock Interview Platform.
        </p>

      </div>

      <div className="faq-container">

        {faqData.map((item, index) => (

          <div
            className="faq-item"
            key={index}
          >

            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >

              <h3>{item.question}</h3>

              <span
                className={
                  openIndex === index
                    ? "faq-icon active"
                    : "faq-icon"
                }
              >
                ▼
              </span>

            </div>

            {openIndex === index && (

              <div className="faq-answer">

                <p>{item.answer}</p>

              </div>

            )}

          </div>

        ))}

      </div>

    </section>
  );
};

export default MockFAQ;