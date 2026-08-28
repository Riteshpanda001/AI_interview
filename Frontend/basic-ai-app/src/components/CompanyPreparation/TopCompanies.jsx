import React, { useState, useEffect } from "react";
import "./TopCompanies.css";

const API_BASE_URL = "http://localhost:8000/api";

const DEFAULT_COMPANIES = [
  { name: "Google", logo: "/logos/google.png", type: "Product", color: "#4285F4" },
  { name: "Microsoft", logo: "/logos/microsoft.png", type: "Product", color: "#F25022" },
  { name: "Amazon", logo: "/logos/amazon.png", type: "Product", color: "#FF9900" },
  { name: "Meta", logo: "/logos/meta.png", type: "Product", color: "#0668E1" },
  { name: "OpenAI", logo: "/logos/openai.png", type: "Product", color: "#10a37f" },
  { name: "Netflix", logo: "🍿", type: "Product", color: "#E50914" },
  { name: "Apple", logo: "🍎", type: "Product", color: "#555555" },
  { name: "Uber", logo: "🚗", type: "Product", color: "#000000" },
  { name: "Flipkart", logo: "🛒", type: "Product", color: "#2874F0" },
  { name: "Zomato", logo: "🍕", type: "Product", color: "#CB202D" },
  { name: "Atlassian", logo: "🔹", type: "Product", color: "#0052CC" },
  { name: "Adobe", logo: "🎨", type: "Product", color: "#FF0000" },
  { name: "Oracle", logo: "🔴", type: "Product", color: "#F80000" },
  { name: "Goldman Sachs", logo: "🏦", type: "FinTech", color: "#7399C6" },
  { name: "TCS", logo: "/logos/tcs.png", type: "Service", color: "#1E2A38" },
  { name: "Infosys", logo: "/logos/Infosys.png", type: "Service", color: "#007CC3" },
  { name: "Wipro", logo: "⚡", type: "Service", color: "#7C3AED" },
  { name: "Accenture", logo: "🚀", type: "Service", color: "#A855F7" }
];

const TopCompanies = ({ selectedCompany, onSelectCompany }) => {
  const [companies, setCompanies] = useState(DEFAULT_COMPANIES);

  useEffect(() => {
    const loadDbCompanies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/company/all`);
        if (res.ok) {
          const dbList = await res.json();
          if (Array.isArray(dbList) && dbList.length > 0) {
            // Merge DB companies with default logos/colors if missing
            const merged = dbList.map((c) => {
              const def = DEFAULT_COMPANIES.find(d => d.name.toLowerCase() === c.name.toLowerCase()) || {};
              return {
                name: c.name,
                logo: c.logo || def.logo || "🏢",
                type: c.industry || def.type || "Tech",
                color: def.color || "#a855f7"
              };
            });

            // Append default companies not in DB list
            DEFAULT_COMPANIES.forEach((def) => {
              if (!merged.some(m => m.name.toLowerCase() === def.name.toLowerCase())) {
                merged.push(def);
              }
            });

            setCompanies(merged);
          }
        }
      } catch (err) {
        console.warn("DB Company fetch fallback to static dataset:", err);
      }
    };

    loadDbCompanies();
  }, []);

  return (
    <section className="top-companies-section">
      <div className="top-companies-container">
        <div className="section-header-mini">
          <span className="section-mini-tag">🏢 Target Selection</span>
          <h2>Select Target <span>Company</span></h2>
          <p>Choose from top product & service companies to unlock customized multi-step hiring tracks and question banks.</p>
        </div>

        <div className="companies-row-selector">
          {companies.map((company) => {
            const isSelected = selectedCompany.toLowerCase() === company.name.toLowerCase();
            return (
              <button
                key={company.name}
                className={`company-tab-btn ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectCompany(company.name)}
                style={{
                  "--brand-color": company.color,
                  "--brand-bg": `${company.color}0c`,
                  "--brand-border": `${company.color}25`
                }}
              >
                <span className="tab-logo">
                  {company.logo && typeof company.logo === 'string' && company.logo.startsWith('/') ? (
                    <img src={company.logo} alt={company.name} style={{ width: "20px", height: "20px", objectFit: "contain" }} />
                  ) : (
                    company.logo
                  )}
                </span>
                <div className="tab-text">
                  <strong>{company.name}</strong>
                  <span>{company.type}</span>
                </div>
                {isSelected && <span className="active-dot">●</span>}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;
