import React from "react";
import "./Footer.css";
import logo from "../assets/prenova_ai_logo.png";

const Footer = () => {
  return (
    <footer className="footer" id="contact">

      <div className="footer-container">

        {/* Logo Section */}
        <div className="footer-brand">

          <img src={logo} alt="PrepNova AI" />

          <p>
            AI-powered interview preparation platform helping
            students and professionals crack their dream jobs.
          </p>

        </div>

        {/* Quick Links */}
        <div className="footer-links">

          <h3>Quick Links</h3>

          <a href="/">Home</a>
          <a href="/#features">Features</a>
          <a href="/pricing">Pricing</a>
          <a href="/#faq">FAQ</a>

        </div>

        {/* Resources */}
        <div className="footer-links">

          <h3>Resources</h3>

          <a href="/">AI Mock Interview</a>
          <a href="/">ATS Resume Analyzer</a>
          <a href="/">Coding Practice</a>
          <a href="/">Company Preparation</a>

        </div>

        {/* Contact */}
        <div className="footer-links">

          <h3>Contact</h3>

          <a href="mailto:support@prepnova.ai">
            support@prepnova.ai
          </a>

          <a href="/">LinkedIn</a>
          <a href="/">GitHub</a>
          <a href="/">Instagram</a>

        </div>

      </div>

      {/* Bottom Footer */}

      <div className="footer-bottom">

        <p>
          © 2026 PrepNova AI. All Rights Reserved.
        </p>

        <div className="footer-policy">

          <a href="/">Privacy Policy</a>
          <a href="/">Terms & Conditions</a>

        </div>

      </div>

    </footer>
  );
};

export default Footer;