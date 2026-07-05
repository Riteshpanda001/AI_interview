import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Sub-components from CompanyPreparations folder
import CompanyHero from "../components/CompanyPreparation/CompanyHero";
import TopCompanies from "../components/CompanyPreparation/TopCompanies";
import CompanyDetails from "../components/CompanyPreparation/CompanyDetails";
import HiringProcess from "../components/CompanyPreparation/HiringProcess";
import InterviewRounds from "../components/CompanyPreparation/InterviewRounds";
import CompanyQuestions from "../components/CompanyPreparation/CompanyQuestions";
import PreparationRoadmap from "../components/CompanyPreparation/PreparationRoadmap";
import CompanyFAQ from "../components/CompanyPreparation/CompanyFAQ";

// Styles
import "../components/CompanyPreparation/CompanyPreparation.css";
import "./CompanyPreparation.css";

const CompanyPreparation = () => {
  const [selectedCompany, setSelectedCompany] = useState("Google");

  return (
    <>
      <Navbar />

      <main className="company-page-container">
        
        {/* Company Hero Banner */}
        <CompanyHero />

        {/* Company Tab Selector */}
        <TopCompanies 
          selectedCompany={selectedCompany} 
          onSelectCompany={setSelectedCompany} 
        />

        {/* Dynamic Details Sections based on selectedCompany */}
        <div className="company-dynamic-content">
          <CompanyDetails companyName={selectedCompany} />
          <HiringProcess companyName={selectedCompany} />
          <InterviewRounds companyName={selectedCompany} />
          <CompanyQuestions companyName={selectedCompany} />
          <PreparationRoadmap companyName={selectedCompany} />
          <CompanyFAQ companyName={selectedCompany} />
        </div>

      </main>

      <Footer />
    </>
  );
};

export default CompanyPreparation;
