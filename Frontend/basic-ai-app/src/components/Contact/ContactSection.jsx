import React, { useState } from "react";
import "./ContactSection.css";

const ContactSection = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    alert("✅ Thank you! Your message has been sent successfully.");

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
  };

  return (
    <section className="contact-section">

      {/* Header */}

      <div className="contact-header">

        <span className="contact-badge">
          📞 CONTACT US
        </span>

        <h2>
          We'd Love to
          <span> Hear From You</span>
        </h2>

        <p>
          Have questions about PrepNova AI?
          Need help with your interview preparation?
          Send us a message and our team will get back to you.
        </p>

      </div>

      {/* Main Container */}

      <div className="contact-container">

        {/* Left Side */}

        <div className="contact-info">

          <div className="info-card">
            <div className="info-icon">📧</div>

            <div>
              <h3>Email</h3>
              <p>prenovaai001@gmail.com</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon">📞</div>

            <div>
              <h3>Phone</h3>
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
              <p>9:00 AM - 6:00 PM</p>
            </div>
          </div>

        </div>

        {/* Right Side */}

        <div className="contact-form-card">

          <form onSubmit={handleSubmit}>

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
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />

            </div>

            <div className="form-group">

              <label>Message</label>

              <textarea
                rows="6"
                name="message"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />

            </div>

            <button
              type="submit"
              className="send-btn"
            >
              🚀 Send Message
            </button>

          </form>

        </div>

      </div>

    </section>
  );
};

export default ContactSection;