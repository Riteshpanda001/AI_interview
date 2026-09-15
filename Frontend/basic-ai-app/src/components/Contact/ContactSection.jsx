import React, { useState, useEffect } from "react";
import "./ContactSection.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

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
              <p>Suramani, Odisha, India</p>
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

          {/* Social Media Links Card */}
          <div className="social-links-card">
            <h4 className="social-links-title">🌐 Follow Us</h4>
            <p className="social-links-sub">Stay connected on social media</p>
            <div className="social-links-row">
              <a
                href="https://www.linkedin.com/in/riteshkumarpanda"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn linkedin"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </a>
              <a
                href="https://github.com/Riteshpanda001"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn github"
                aria-label="GitHub"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
              <a
                href="https://twitter.com/prenovaai"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn twitter"
                aria-label="Twitter / X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.87L2.25 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter / X
              </a>
              <a
                href="https://www.instagram.com/prenovaai"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-btn instagram"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                Instagram
              </a>
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

      {/* Google Maps Embed */}
      <div className="contact-map-section">
        <div className="contact-map-header">
          <span className="contact-map-badge">📍 Find Us Here</span>
          <h3>Our Location in <span>Suramani</span></h3>
          <p>Odisha, India — Asia/Kolkata (IST)</p>
        </div>
        <div className="contact-map-wrapper">
          <iframe
            title="PrepNova AI Location - Suramani, Odisha"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14953.782897849!2d85.0583!3d20.2168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19d0c73c123abc%3A0x456def!2sSuramani%2C%20Odisha%2C%20India!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="380"
            style={{ border: 0, borderRadius: "22px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

    </section>
  );
};

export default ContactSection;