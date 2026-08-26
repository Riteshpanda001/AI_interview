import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const role = (user?.role || "").toLowerCase().trim();
  const email = (user?.email || "").toLowerCase().trim();
  const isAdmin = role === "admin" || role === "superadmin" || email === "prenovaai01@gmail.com";

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (!loading && user && isAdmin) {
    return null;
  }

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