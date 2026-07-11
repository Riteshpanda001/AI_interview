import React from "react";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustedCompanies from "../components/TrustedCompanies";
import Features from "../components/Features";
import ATSResume from "../components/ATSResume";
import AIMockInterview from "../components/AIMockInterview";
import PerformanceAnalytics from "../components/PerformanceAnalytics";
import Statistics from "../components/Statistics";
import Testimonials from "../components/Testimonials";
import CompanyPreparation from "../components/CompanyPreparation";
import Pricing from "../components/Pricing";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";


const Home = () => {

  return (
    <>
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <ATSResume />
      <AIMockInterview />
      <PerformanceAnalytics />
      <Statistics />
      <Testimonials />
      <CompanyPreparation />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
};

export default Home;