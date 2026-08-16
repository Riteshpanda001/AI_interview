import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Sub-components
import CompanyHero from "../components/CompanyPreparation/CompanyHero";
import TopCompanies from "../components/CompanyPreparation/TopCompanies";
import CompanyQuestions from "../components/CompanyPreparation/CompanyQuestions";
import CompanyFAQ from "../components/CompanyPreparation/CompanyFAQ";
import AdminCompanyManager from "../components/CompanyPreparation/AdminCompanyManager";

// Styles
import "../components/CompanyPreparation/CompanyPreparation.css";
import "./CompanyPreparation.css";

const API_BASE_URL = "http://localhost:8000/api";

const CompanyPreparation = () => {
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [companyProfile, setCompanyProfile] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Fetch dynamic company profile & question bank from backend database
  const fetchCompanyData = async () => {
    const slug = selectedCompany.toLowerCase().trim().replace(/\s+/g, "-");
    setLoading(true);
    try {
      const [profRes, questRes] = await Promise.all([
        fetch(`${API_BASE_URL}/company/${slug}`),
        fetch(`${API_BASE_URL}/company/${slug}/questions`)
      ]);

      if (profRes.ok) {
        const profile = await profRes.json();
        setCompanyProfile(profile);
      }
      if (questRes.ok) {
        const questions = await questRes.json();
        setQuestionsData(questions);
      }
    } catch (err) {
      console.warn("Backend company API warning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [selectedCompany]);

  return (
    <>
      <Navbar />

      <main className="company-page-container">
        {/* Company Hero Banner */}
        <CompanyHero />



        {/* Company Selection Grid */}
        <TopCompanies 
          selectedCompany={selectedCompany} 
          onSelectCompany={(comp) => {
            setSelectedCompany(comp);
          }} 
        />

        {/* DSA Questions Section */}
        <div style={{ maxWidth: "1200px", margin: "1.5rem auto 3rem auto", padding: "0 1rem" }}>
          <CompanyQuestions companyName={selectedCompany} />
        </div>

        {/* Dynamic FAQ Section */}
        <CompanyFAQ companyName={selectedCompany} />
      </main>

      {/* Admin Company Manager Modal */}
      <AdminCompanyManager
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshData={fetchCompanyData}
      />

      <Footer />
    </>
  );
};

export default CompanyPreparation;


