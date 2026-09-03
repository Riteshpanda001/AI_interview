import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";

// Sub-components
import CompanyHero from "../components/CompanyPreparation/CompanyHero";
import TopCompanies from "../components/CompanyPreparation/TopCompanies";
import CompanyQuestions from "../components/CompanyPreparation/CompanyQuestions";
import CompanyFAQ from "../components/CompanyPreparation/CompanyFAQ";
import AdminCompanyManager from "../components/CompanyPreparation/AdminCompanyManager";
import CompanyDetails from "../components/CompanyPreparation/CompanyDetails";
import HiringProcess from "../components/CompanyPreparation/HiringProcess";
import InterviewRounds from "../components/CompanyPreparation/InterviewRounds";
import PreparationRoadmap from "../components/CompanyPreparation/PreparationRoadmap";

// Styles
import "../components/CompanyPreparation/CompanyPreparation.css";
import "./CompanyPreparation.css";

const API_BASE_URL = "http://localhost:8000/api";

const CompanyPreparation = () => {
  const { user } = useAuth();
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

        {/* Admin Controls Panel */}
        {user?.role?.toLowerCase() === "admin" && (
          <div style={{ display: "flex", justifyContent: "flex-end", maxWidth: "1200px", margin: "1rem auto 0 auto", padding: "0 1rem" }}>
            <button
              onClick={() => setIsAdminOpen(true)}
              style={{
                background: "linear-gradient(135deg, #7c3aed, #0284c7)",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              🛠️ Open Admin Company Manager
            </button>
          </div>
        )}

        {/* Company Selection Grid */}
        <TopCompanies 
          selectedCompany={selectedCompany} 
          onSelectCompany={(comp) => {
            setSelectedCompany(comp);
            setTimeout(() => {
              const questionsVault = document.getElementById("company-questions-vault");
              if (questionsVault) {
                questionsVault.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 100);
          }} 
        />

        {/* Company Specific Insights and Strategy */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}>
          <CompanyDetails companyName={selectedCompany} />
          <HiringProcess companyName={selectedCompany} />
          <InterviewRounds companyName={selectedCompany} />
          <PreparationRoadmap companyName={selectedCompany} />
        </div>

        {/* DSA Questions Section */}
        <div id="company-questions-vault" style={{ maxWidth: "1200px", margin: "2rem auto 3rem auto", padding: "0 1rem" }}>
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




