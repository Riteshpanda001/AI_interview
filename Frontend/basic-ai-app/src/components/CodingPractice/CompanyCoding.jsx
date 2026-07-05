import React from "react";
import "./CompanyCoding.css";

const COMPANIES = [
  { id: "Google", name: "Google", logoColor: "#4285F4", textColor: "#4285F4", borderGlow: "rgba(66, 133, 244, 0.2)", badgeText: "Google" },
  { id: "Meta", name: "Meta", logoColor: "#0668E1", textColor: "#0668E1", borderGlow: "rgba(6, 104, 225, 0.2)", badgeText: "Meta" },
  { id: "Amazon", name: "Amazon", logoColor: "#FF9900", textColor: "#FF9900", borderGlow: "rgba(255, 153, 0, 0.2)", badgeText: "Amazon" },
  { id: "Microsoft", name: "Microsoft", logoColor: "#F25022", textColor: "#F25022", borderGlow: "rgba(242, 80, 34, 0.2)", badgeText: "Microsoft" },
  { id: "Apple", name: "Apple", logoColor: "#000000", textColor: "#111827", borderGlow: "rgba(17, 24, 39, 0.2)", badgeText: "Apple" },
  { id: "Netflix", name: "Netflix", logoColor: "#E50914", textColor: "#E50914", borderGlow: "rgba(229, 9, 20, 0.2)", badgeText: "Netflix" }
];

const CompanyCoding = ({ selectedCompany, onSelectCompany }) => {
  return (
    <section className="company-coding-section">
      <div className="company-coding-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🏢 Company Tagging</span>
          <h2>Target Top Companies</h2>
          <p>Solve coding problems specifically asked in interviews by major tech employers. Toggle a company to filter challenges.</p>
        </div>

        <div className="companies-horizontal-list">
          {COMPANIES.map((company) => {
            const isActive = selectedCompany === company.id;
            return (
              <div 
                className={`company-pill card ${isActive ? "active" : ""}`}
                key={company.id}
                onClick={() => onSelectCompany(isActive ? null : company.id)}
                style={{
                  borderColor: isActive ? company.logoColor : "",
                  boxShadow: isActive ? `0 10px 25px ${company.borderGlow}` : ""
                }}
              >
                <div className="company-logo-avatar" style={{ backgroundColor: company.logoColor }}>
                  {company.name[0]}
                </div>
                <span className="company-pill-name" style={{ color: isActive ? company.textColor : "" }}>
                  {company.badgeText}
                </span>
                {isActive && <span className="active-dot-indicator" style={{ backgroundColor: company.logoColor }}></span>}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default CompanyCoding;
