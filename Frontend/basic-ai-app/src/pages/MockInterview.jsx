import React from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrustedCompanies from "../components/TrustedCompanies";

import MockHero from "../components/mockInterview/MockHero";

import PracticeSection from "../components/mockInterview/PracticeSection";
import AIInterviewSection from "../components/mockInterview/AIInterviewSection";
import NailEveryAnswer from "../components/mockInterview/NailEveryAnswer";
import AIvsTraditional from "../components/mockInterview/AIvsTraditional";
import TwoClicksSection from "../components/mockInterview/TwoClicksSection";
import MockFeatures from "../components/Features";
import HowItWorks from "../components/mockInterview/HowItWorks";
import CompanySection from "../components/CompanyPreparation";
import PreviewSection from "../components/AIMockInterview";
import StudentReviews from "../components/mockInterview/Testimonials";
import MockFAQ from "../components/mockInterview/MockFAQ";

import "./MockInterview.css";

const MockInterview = () => {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <MockHero />

      {/* Trusted Companies */}
      <TrustedCompanies />

      {/* Practice Makes Perfect */}
      <PracticeSection />

      {/* Right AI Interview Practice */}
      <AIInterviewSection />

      {/* Nail Every Answer */}
      <NailEveryAnswer />

      {/* AI vs Traditional */}
      <AIvsTraditional />

      {/* Crack Interview With Two Clicks */}
      <TwoClicksSection />

      {/* Features */}
      <MockFeatures />

      {/* How It Works */}
      <HowItWorks />

      {/* Companies */}
      <CompanySection />

      {/* Interview Preview */}
      <PreviewSection />

      {/* Student Reviews */}
      <StudentReviews />

      {/* FAQ */}
      <MockFAQ />

      {/* Footer */}
      <Footer />
    </>
  );
};

export default MockInterview;