import React, { useState, useEffect } from "react";
import "./ContactSection.css";

const API_BASE_URL = "http://localhost:8000/api";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "", // Honeypot trap for bots
  });

  // Math Captcha state
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, expected: 0 });
  const [captchaInput, setCaptchaInput] = useState("");

  // Validation & Status States
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);

  // Ticket Tracker State
  const [lookupTicketNumber, setLookupTicketNumber] = useState("");
  const [trackerResult, setTrackerResult] = useState(null);
  const [trackerError, setTrackerError] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Generate Math CAPTCHA
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    setCaptcha({
      num1,
      num2,
      expected: num1 + num2
    });
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear validation error when field is typed in
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ""
      });
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setValidationErrors({});

    // 1. Frontend Validation
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = "Full Name is required.";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email Address is required.";
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!formData.subject.trim()) {
      errors.subject = "Subject is required.";
    }

    if (!formData.message.trim()) {
      errors.message = "Message is required.";
    } else if (formData.message.trim().length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    if (!captchaInput.trim()) {
      errors.captcha = "Please complete the math verification.";
    } else {
      const ans = parseInt(captchaInput.trim(), 10);
      if (isNaN(ans)) {
        errors.captcha = "Captcha answer must be a number.";
      } else if (ans !== captcha.expected) {
        errors.captcha = "Incorrect answer. Please verify and try again.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject,
          message: formData.message,
          website: formData.website || null,
          captcha_answer: parseInt(captchaInput.trim(), 10),
          captcha_expected: captcha.expected,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to submit contact request.");
      }

      setSubmittedTicket(data);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        website: "",
      });
      setCaptchaInput("");
      generateCaptcha();
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      generateCaptcha(); // Refresh CAPTCHA on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketLookup = async (e) => {
    e.preventDefault();
    setTrackerError("");
    setTrackerResult(null);

    if (!lookupTicketNumber.trim()) {
      setTrackerError("Please enter a ticket number.");
      return;
    }

    setIsTracking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact/ticket/${lookupTicketNumber.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Ticket not found.");
      }

      setTrackerResult(data);
    } catch (err) {
      setTrackerError(err.message || "Failed to lookup ticket.");
    } finally {
      setIsTracking(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "How long does it take to get a response to my support ticket?",
      answer: "We aim to reply to all support tickets within 24 hours. You will receive an automated email confirmation once your ticket is created, and another email when an agent responds."
    },
    {
      question: "Can I track the status of my ticket directly on the platform?",
      answer: "Yes! Use the Ticket Tracker widget on this page. Enter your ticket number (e.g., TICK-12345) to see its current status in real time."
    },
    {
      question: "Is there any limit to the number of support requests I can submit?",
      answer: "To prevent abuse, we limit submissions to 3 tickets per 10 minutes per email or IP address. If you exceed this, please wait before submitting again."
    },
    {
      question: "What is PrepNova AI's refund policy?",
      answer: "We offer a 7-day money-back guarantee for our Pro and Premium plans if you are unsatisfied with our AI preparation services. Contact us with your email address and payment details to request a refund."
    }
  ];

  return (
    <section className="contact-section">
      {/* Header */}
      <div className="contact-header">
        <span className="contact-badge">📞 CONTACT US</span>
        <h2>
          We'd Love to <span>Hear From You</span>
        </h2>
        <p>
          Have questions about PrepNova AI? Need help with your interview preparation or billing? Send us a message and our support engineers will get back to you.
        </p>
      </div>

      {/* Main Container */}
      <div className="contact-container">
        {/* Left Side: Contact Info & Ticket Tracker */}
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">📧</div>
            <div>
              <h3>Email Support</h3>
              <p>prenovaai001@gmail.com</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>
            <div>
              <h3>Phone Helpline</h3>
              <p>+91 9692229676</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📍</div>
            <div>
              <h3>Location</h3>
              <p>Bhubaneswar, Odisha, India</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">🕒</div>
            <div>
              <h3>Working Hours</h3>
              <p>Monday - Saturday</p>
              <p>9:00 AM - 6:00 PM IST</p>
            </div>
          </div>

          {/* Ticket Tracker Widget */}
          <div className="ticket-tracker-card">
            <h4>Ticket Tracker</h4>
            <p>Check the real-time status of your support request.</p>
            <form onSubmit={handleTicketLookup} className="ticket-lookup-form">
              <input
                type="text"
                placeholder="Enter Ticket # (e.g. TICK-12345)"
                value={lookupTicketNumber}
                onChange={(e) => setLookupTicketNumber(e.target.value)}
              />
              <button type="submit" disabled={isTracking}>
                {isTracking ? "Tracking..." : "Track"}
              </button>
            </form>

            {trackerError && <div className="tracker-error">{trackerError}</div>}

            {trackerResult && (
              <div className="tracker-result-box">
                <div className="tracker-status-line">
                  <span>Status:</span>
                  <span className={`status-pill ${trackerResult.status.toLowerCase()}`}>
                    {trackerResult.status}
                  </span>
                </div>
                <p className="tracker-subject"><strong>Subject:</strong> {trackerResult.subject}</p>
                <div className="tracker-time">
                  Estimated Response: {trackerResult.estimated_response}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Form / Success Card */}
        <div className="contact-form-card">
          {submittedTicket ? (
            <div className="ticket-success-card">
              <div className="success-icon-circle">✓</div>
              <h2>Ticket Created Successfully! 🎉</h2>
              <p className="ticket-number-display">
                Ticket Number: <strong>#{submittedTicket.ticket_number}</strong>
              </p>
              
              <div className="success-details-box">
                <p><strong>Name:</strong> {submittedTicket.name}</p>
                <p><strong>Email:</strong> {submittedTicket.email}</p>
                <p><strong>Subject:</strong> {submittedTicket.subject}</p>
                <p><strong>Estimated Response:</strong> Within 24 Hours</p>
              </div>

              <p className="email-sent-note">
                📧 A confirmation email has been sent to <strong>{submittedTicket.email}</strong>.
              </p>

              <button
                type="button"
                className="btn-new-ticket"
                onClick={() => setSubmittedTicket(null)}
              >
                Submit Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && <div className="contact-alert-error">{errorMsg}</div>}

              {/* Honeypot field (hidden from genuine human users) */}
              <div style={{ display: "none" }}>
                <input
                  type="text"
                  name="website"
                  tabIndex="-1"
                  autoComplete="off"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {validationErrors.name && (
                  <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", textAlign: "left" }}>
                    {validationErrors.name}
                  </span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {validationErrors.email && (
                    <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", textAlign: "left" }}>
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. Question about ATS resume score"
                  value={formData.subject}
                  onChange={handleChange}
                />
                {validationErrors.subject && (
                  <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", textAlign: "left" }}>
                    {validationErrors.subject}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="5"
                  name="message"
                  placeholder="Write your detailed query or feedback here..."
                  value={formData.message}
                  onChange={handleChange}
                />
                {validationErrors.message && (
                  <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "4px", textAlign: "left" }}>
                    {validationErrors.message}
                  </span>
                )}
              </div>

              {/* Math CAPTCHA Field */}
              <div className="captcha-group">
                <label className="captcha-label" style={{ display: "block", textAlign: "left" }}>
                  Security Verification: <strong>{captcha.num1} + {captcha.num2} = ?</strong>
                </label>
                <div className="captcha-input-row" style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
                  <input
                    type="text"
                    placeholder="Enter answer"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    style={{ maxWidth: "120px" }}
                  />
                  <button
                    type="button"
                    className="btn-refresh-captcha"
                    onClick={generateCaptcha}
                  >
                    ↻ Refresh
                  </button>
                </div>
                {validationErrors.captcha && (
                  <span style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", display: "block", textAlign: "left" }}>
                    {validationErrors.captcha}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="send-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "🚀 Submit"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="contact-faq-section">
        <div className="faq-header">
          <h3>Frequently Asked <span>Questions</span></h3>
          <p>Common questions about our support ticket system and services.</p>
        </div>

        <div className="faq-accordion-list">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className={`faq-item ${openFaqIndex === index ? "open" : ""}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question-bar">
                <h4>{faq.question}</h4>
                <span className="faq-toggle-icon">
                  {openFaqIndex === index ? "−" : "+"}
                </span>
              </div>
              {openFaqIndex === index && (
                <div className="faq-answer-content" style={{ textAlign: "left" }}>
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;