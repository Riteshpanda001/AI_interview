import React from "react";
import "./FAQ.css";

const FAQ = () => {
  const faqs = [
    {
      question: "What is ATS Resume Analysis?",
      answer:
        "ATS Resume Analysis evaluates your resume against Applicant Tracking Systems and provides a score along with improvement suggestions.",
    },
    {
      question: "How does the AI Mock Interview work?",
      answer:
        "The AI interviewer asks technical, HR, and behavioral questions and provides instant feedback on your responses.",
    },
    {
      question: "Can I practice coding interviews?",
      answer:
        "Yes. PrepNova AI offers coding interview preparation with real-world coding challenges and AI feedback.",
    },
    {
      question: "Which companies are covered?",
      answer:
        "Google, Microsoft, Amazon, Meta, TCS, Infosys, Wipro, Accenture, and many more.",
    },
    {
      question: "Is there a free plan available?",
      answer:
        "Yes. Our Free Plan includes AI interviews, ATS analysis, and basic interview preparation resources.",
    },
    {
      question: "How is my interview score calculated?",
      answer:
        "Scores are calculated based on communication, confidence, technical knowledge, and problem-solving ability.",
    },
  ];

  return (
    <section className="faq-section" id="faq">

      <div className="faq-header">

        <span className="faq-tag">
          ❓ Frequently Asked Questions
        </span>

        <h2>
          Got Questions?
          <span> We've Got Answers</span>
        </h2>

        <p>
          Find answers to the most common questions about
          PrepNova AI and interview preparation.
        </p>

      </div>

      <div className="faq-container">

        {faqs.map((faq, index) => (
          <div className="faq-card" key={index}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}

      </div>

    </section>
  );
};

export default FAQ;