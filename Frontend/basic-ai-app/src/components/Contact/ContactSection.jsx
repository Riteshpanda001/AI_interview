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

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          website: formData.website,
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
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
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
                  required
                />
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
                    required
                  />
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
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  rows="5"
                  name="message"
                  placeholder="Write your detailed query or feedback here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
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
    </section>
  );
};

export default ContactSection;