import React, { useState } from "react";
import "./MockFAQ.css";

const faqData = [
  {
    question: "What is an AI Mock Interview?",
    answer:
      "PrepNova AI Mock Interview simulates a real interview experience using Artificial Intelligence. It asks technical, HR, behavioral, coding, and company-specific questions based on your resume, selected company, and job role. After every answer, the AI provides instant feedback to improve your interview performance."
  },

  {
    question: "Is this platform suitable for freshers?",
    answer:
      "Yes. PrepNova AI is designed for freshers as well as experienced professionals. Freshers can practice HR, aptitude, and technical interviews, while experienced candidates can prepare for senior-level technical and managerial interviews."
  },

  {
    question: "Can I practice company-specific interviews?",
    answer:
      "Yes. You can prepare for interviews of Google, Microsoft, Amazon, Meta, Netflix, Apple, TCS, Infosys, Wipro, Cognizant, Deloitte, Capgemini, IBM, Accenture, and many other companies."
  },

  {
    question: "Does the AI provide feedback after every interview?",
    answer:
      "Absolutely. After every interview, PrepNova AI generates a detailed report including technical score, communication score, confidence level, grammar analysis, vocabulary, answer quality, and personalized improvement suggestions."
  },

  {
    question: "Will interview questions be based on my resume?",
    answer:
      "Yes. Once you upload your resume, the AI analyzes your education, projects, internships, certifications, skills, and experience to generate personalized interview questions."
  },

  {
    question: "Can I upload a Job Description (JD)?",
    answer:
      "Yes. Uploading a Job Description allows the AI to generate role-specific interview questions based on the required technologies, responsibilities, and skills mentioned by the recruiter."
  },

  {
    question: "Does the platform support coding interviews?",
    answer:
      "Yes. Practice Data Structures & Algorithms, SQL, System Design, OOP, Java, Python, JavaScript, C++, Machine Learning, Web Development, and many other technical interview topics."
  },

  {
    question: "Can I take voice-based interviews?",
    answer:
      "Yes. PrepNova AI supports voice interviews using Speech Recognition, allowing you to answer naturally just like a real interview."
  },

  {
    question: "Does the platform support webcam analysis?",
    answer:
      "Yes. With your permission, the AI can analyze facial expressions, confidence, posture, eye contact, and speaking behavior to provide more realistic interview feedback."
  },

  {
    question: "How is my interview score calculated?",
    answer:
      "Your score is calculated using communication skills, technical knowledge, answer relevance, confidence, fluency, grammar, vocabulary, response time, and overall interview performance."
  },

  {
    question: "Can I track my interview progress?",
    answer:
      "Yes. Every completed interview is stored in your dashboard where you can compare previous scores, identify weak areas, and monitor your improvement over time."
  },

  {
    question: "Is my resume and interview data secure?",
    answer:
      "Absolutely. Your uploaded resumes, interview recordings, reports, and personal information are securely stored and never shared with recruiters or third parties without your permission."
  },

  {
    question: "Can I practice unlimited interviews?",
    answer:
      "Depending on your subscription plan, you can practice unlimited mock interviews, receive unlimited reports, retry interviews, and continuously improve your performance."
  },

  {
    question: "Can experienced professionals also use PrepNova AI?",
    answer:
      "Yes. Experienced professionals can prepare for Senior Software Engineer, Tech Lead, Manager, Product Manager, DevOps Engineer, Cloud Engineer, Data Scientist, AI Engineer, and Architect interviews."
  },

  {
    question: "Why should I choose PrepNova AI over traditional mock interviews?",
    answer:
      "PrepNova AI is available 24/7, provides instant personalized feedback, supports company-specific interviews, analyzes resumes and job descriptions, tracks progress, supports voice interviews, and allows unlimited practice at a much lower cost than traditional mock interviews."
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

        <h2>Everything You Need To Know</h2>

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