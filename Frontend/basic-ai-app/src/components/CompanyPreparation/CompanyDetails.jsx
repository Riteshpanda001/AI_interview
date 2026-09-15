import React, { useState, useEffect } from "react";
import "./CompanyDetails.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Static fallback for 8 known companies
const STATIC_DETAILS = {
  Google:    { hq: "Mountain View, California", ctc: "₹32 - 50 LPA", experience: "0 - 8+ Years", roles: ["Software Engineer (SWE)", "Site Reliability Engineer (SRE)", "Product Manager"], barDescription: "Google looks for strong conceptual foundations in Data Structures and Algorithms, deep systems logic, and cultural alignment through the 'Googlyness' round.", stats: [{ label: "DSA Weight", value: "90%" }, { label: "System Design Weight", value: "80%" }, { label: "Culture Match Weight", value: "75%" }] },
  Microsoft: { hq: "Redmond, Washington", ctc: "₹28 - 45 LPA", experience: "0 - 10+ Years", roles: ["Software Engineering (SWE)", "Data Scientist", "Program Manager"], barDescription: "Microsoft evaluations check clear OOP design paradigms, multi-threaded coding efficiency, scalable software architectures, and product optimization concepts.", stats: [{ label: "DSA Weight", value: "80%" }, { label: "OOP & Design Weight", value: "85%" }, { label: "System Design Weight", value: "75%" }] },
  Amazon:    { hq: "Seattle, Washington", ctc: "₹25 - 42 LPA", experience: "0 - 7+ Years", roles: ["Software Development Engineer (SDE)", "Support Engineer", "Solutions Architect"], barDescription: "Amazon heavily scrutinizes your decision histories using their 16 Leadership Principles. Coding rounds check algorithmic accuracy under stress.", stats: [{ label: "Leadership Principles", value: "95%" }, { label: "DSA Weight", value: "85%" }, { label: "System Design Weight", value: "80%" }] },
  Meta:      { hq: "Menlo Park, California", ctc: "₹35 - 55 LPA", experience: "2 - 12+ Years", roles: ["Software Engineer", "Production Engineer", "Product Designer"], barDescription: "Meta requires fast coding iteration. You must solve two medium/hard algorithms in 45 minutes perfectly, including dry runs and time analyses.", stats: [{ label: "Coding Speed", value: "98%" }, { label: "DSA Accuracy", value: "95%" }, { label: "System Design Weight", value: "85%" }] },
  Netflix:   { hq: "Los Gatos, California", ctc: "₹40 - 65 LPA", experience: "3 - 15+ Years", roles: ["Senior Software Engineer", "Core Infrastructure Engineer", "UI Engineer"], barDescription: "Netflix values independence, high maturity, and alignment with their Freedom and Responsibility culture deck. Technical focus lies in high scalability.", stats: [{ label: "Culture Fit", value: "95%" }, { label: "System Architecture", value: "90%" }, { label: "Concurrency & Scale", value: "85%" }] },
  Apple:     { hq: "Cupertino, California", ctc: "₹30 - 48 LPA", experience: "1 - 10+ Years", roles: ["Hardware Engineer", "Software Engineer", "iOS Developer"], barDescription: "Apple values perfection, privacy principles, low-level OS/memory control, and high attention to product craftsmanship and UI detail.", stats: [{ label: "Low Level / OS Logic", value: "90%" }, { label: "Product Design", value: "85%" }, { label: "DSA Weight", value: "80%" }] },
  TCS:       { hq: "Mumbai, Maharashtra", ctc: "₹3.6 - 7.5 LPA (NQT / Digital)", experience: "0 - 4 Years", roles: ["Ninja Systems Engineer", "Digital Software Engineer", "Prime Developer"], barDescription: "TCS tests logical ability, verbal speed, and syntax coding. TCS Digital & Prime tracks test advanced data structure implementations.", stats: [{ label: "Aptitude Weight", value: "90%" }, { label: "Coding Basics", value: "80%" }, { label: "SQL & DB Basics", value: "70%" }] },
  Infosys:   { hq: "Bengaluru, Karnataka", ctc: "₹3.6 - 8.0 LPA (System Engineer / Specialist)", experience: "0 - 4 Years", roles: ["Systems Engineer", "Specialist Programmer (SP)", "Digital Specialist Engineer (DSE)"], barDescription: "Infosys Specialty Tracks focus on competitive coding, logic constructs, dynamic databases, and application framework foundations.", stats: [{ label: "Specialty Coding", value: "85%" }, { label: "Logical Aptitude", value: "90%" }, { label: "Core Java/DBMS", value: "75%" }] }
};

const getStaticDetails = (companyName) =>
  STATIC_DETAILS[companyName] || {
    hq: "Global Headquarters",
    ctc: "Competitive Package",
    experience: "0 - 10+ Years",
    roles: ["Software Engineer", "Technical Lead", "Data Scientist"],
    barDescription: `${companyName} evaluates candidates on technical depth, problem-solving ability, and cultural alignment. Prepare thoroughly across DSA, system design, and behavioral rounds.`,
    stats: [
      { label: "DSA Weight", value: "80%" },
      { label: "System Design", value: "75%" },
      { label: "Behavioral Fit", value: "70%" }
    ]
  };

const CompanyDetails = ({ companyName }) => {
  const [details, setDetails] = useState(getStaticDetails(companyName));
  const [isLive, setIsLive]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setDetails(getStaticDetails(companyName));
    setIsLive(false);

    const fetchCompany = async () => {
      setLoading(true);
      try {
        const slug = companyName.toLowerCase().trim().replace(/\s+/g, "-");
        const res = await fetch(`${API_BASE_URL}/company/${slug}`);
        if (res.ok) {
          const data = await res.json();
          // Check it's a real DB record (not just the default schema fallback)
          const hasRealData = data.hq || data.ctc || (Array.isArray(data.roles) && data.roles.length > 0);
          if (hasRealData) {
            setDetails({
              hq: data.hq || "N/A",
              ctc: data.ctc || "Competitive Package",
              experience: data.experience || "0 - 10+ Years",
              roles: Array.isArray(data.roles) ? data.roles : getStaticDetails(companyName).roles,
              barDescription: data.description || data.barDescription || getStaticDetails(companyName).barDescription,
              stats: Array.isArray(data.evaluation_stats) && data.evaluation_stats.length > 0
                ? data.evaluation_stats
                : getStaticDetails(companyName).stats
            });
            setIsLive(true);
          }
        }
      } catch (err) {
        console.warn("CompanyDetails API fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyName]);

  return (
    <section className="company-details-section">
      <div className="company-details-container card">

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
            Loading company profile...
          </div>
        ) : (
          <>
            {/* Left Side: Summary and stats */}
            <div className="details-main-content">
              <span className="details-header-tag">
                📊 Company Profile
                {isLive && (
                  <span style={{ marginLeft: "8px", fontSize: "11px", color: "#10b981", fontWeight: "700", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: "10px" }}>
                    ● Live
                  </span>
                )}
              </span>
              <h2 className="company-details-title">
                Inside <span>{companyName}</span> Hiring
              </h2>
              <p className="details-para">{details.barDescription}</p>

              <div className="details-grid-meta">
                <div>
                  <strong>Headquarters:</strong>
                  <p>{details.hq}</p>
                </div>
                <div>
                  <strong>Average Compensation:</strong>
                  <p className="ctc-text">{details.ctc}</p>
                </div>
                <div>
                  <strong>Target Levels:</strong>
                  <p>{details.experience}</p>
                </div>
              </div>

              <div className="target-roles-wrap">
                <strong>Key Roles Recruited:</strong>
                <div className="roles-chips">
                  {details.roles.map((role, idx) => (
                    <span key={idx} className="role-chip">💼 {role}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: Evaluation Weights */}
            <div className="details-evaluation-weights">
              <h3>Evaluation Weights</h3>
              <div className="weights-list">
                {details.stats.map((stat, idx) => (
                  <div key={idx} className="weight-row">
                    <div className="weight-meta">
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                    <div className="weight-bar-bg">
                      <div className="weight-bar-fill" style={{ width: stat.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </section>
  );
};

export default CompanyDetails;
