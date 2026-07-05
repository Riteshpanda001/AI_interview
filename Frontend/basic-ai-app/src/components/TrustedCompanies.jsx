import React from "react";
import "./TrustedCompanies.css";

const TrustedCompanies = () => {
  return (
    <section className="trusted-section">

      <h2>
        Trusted by Candidates Preparing for
        <span> Top Companies</span>
      </h2>

      <p>
        Join thousands of candidates preparing for interviews at
        world-class companies.
      </p>

      <div className="logo-slider">
          <div className="logo-track">
              {/* First Set */}
              <img src="/logos/google.png" alt="Google" />
              <img src="/logos/microsoft.png" alt="Microsoft" />
              <img src="/logos/openai.png" alt="OpenAI" />
              <img src="/logos/amazon.png" alt="Amazon" />
              <img src="/logos/meta.png" alt="Meta" />
              <img src="/logos/tcs.png" alt="TCS" />
              <img src="/logos/Infosys.png" alt="Infosys" />
              {/* Duplicate Set */}
              <img src="/logos/google.png" alt="Google" />
              <img src="/logos/microsoft.png" alt="Microsoft" />
              <img src="/logos/openai.png" alt="OpenAI" />
              <img src="/logos/amazon.png" alt="Amazon" />
              <img src="/logos/meta.png" alt="Meta" />
              <img src="/logos/tcs.png" alt="TCS" />
              <img src="/logos/Infosys.png" alt="Infosys" />
            </div>
        </div>

    </section>
  );
};

export default TrustedCompanies;