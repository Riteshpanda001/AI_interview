import React from "react";
import "./TopCompanies.css";
import useRequireAuth from "../../hooks/useRequireAuth";

const COMPANIES = [
  { name: "Google", logo: "🔍", type: "Product", color: "#4285F4" },
  { name: "Microsoft", logo: "💻", type: "Product", color: "#F25022" },
  { name: "Amazon", logo: "📦", type: "Product", color: "#FF9900" },
  { name: "Meta", logo: "🌐", type: "Product", color: "#0668E1" },
  { name: "Netflix", logo: "🍿", type: "Product", color: "#E50914" },
  { name: "Apple", logo: "🍎", type: "Product", color: "#555555" },
  { name: "TCS", logo: "🏢", type: "Service", color: "#1E2A38" },
  { name: "Infosys", logo: "📈", type: "Service", color: "#007CC3" }
];

const TopCompanies = ({ selectedCompany, onSelectCompany }) => {
  const { requireAuth } = useRequireAuth();

  return (
    <section className="top-companies-section">
      <div className="top-companies-container">
        <div className="section-header-mini">
          <span className="section-mini-tag">🏢 Choose Target</span>
          <h2>Select a Company to Begin</h2>
          <p>Toggle between top tech giants and service firms to view customized preparation tracks, questions, and guides.</p>
        </div>

        <div className="companies-row-selector">
          {COMPANIES.map((company) => {
            const isSelected = selectedCompany === company.name;
            return (
              <button
                key={company.name}
                className={`company-tab-btn ${isSelected ? "selected" : ""}`}
                onClick={() => requireAuth(() => onSelectCompany(company.name), "/company-preparation")}
                style={{
                  "--brand-color": company.color,
                  "--brand-bg": `${company.color}0c`,
                  "--brand-border": `${company.color}25`
                }}
              >
                <span className="tab-logo">{company.logo}</span>
                <div className="tab-text">
                  <strong>{company.name}</strong>
                  <span>{company.type} Based</span>
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
