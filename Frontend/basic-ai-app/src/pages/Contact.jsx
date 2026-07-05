import React from "react";
import "./Contact.css";

import Navbar from "../components/Navbar";
import ContactSection from "../components/Contact/ContactSection";
import Footer from "../components/Footer";

const Contact = () => {
  return (
    <div className="contact-page">

      <Navbar />

      <ContactSection />

      <Footer />

    </div>
  );
};

export default Contact;