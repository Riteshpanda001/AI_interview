import React, { useState, useEffect } from "react";
import "./HiringProcess.css";

const API_BASE_URL = "http://localhost:8000/api";

// Fallback static data for offline / unseeded DB
const STATIC_HIRING = {
  Google: [
    { title: "Resume Selection", desc: "AI-optimized resume filter seeking quantifiable achievements and project impact." },
    { title: "Phone Screen", desc: "45-minute technical coding round covering linear structures or basic recursion." },
    { title: "Onsite Rounds", desc: "3 Coding rounds (medium/hard DSA) + 1 System Design round + 1 Googlyness round." },
    { title: "Hiring Committee", desc: "Independent reviewers evaluate anonymous feedback sheets to ensure unbiased hiring." },
    { title: "Team Matching & Offer", desc: "Find target teams matching your skills, complete final reviews, and issue offer." }
  ],
  Microsoft: [
    { title: "Resume Screening", desc: "Evaluation of academic background, core projects, and technical skills." },
    { title: "Online Assessment", desc: "1-2 coding problems testing algorithms, time limitations, and design efficiency." },
    { title: "Technical Onsite", desc: "3 rounds focusing on DSA, clean object-oriented code, and system structure." },
    { title: "As-Appropriate (AA) Round", desc: "Bar-raiser manager round evaluating overall architectural vision and fit." },
    { title: "Final Decisions", desc: "Consolidated team feedbacks compile the final hiring offer details." }
  ],
  Amazon: [
    { title: "Application Filter", desc: "Filter candidate experiences, projects, and target role alignments." },
    { title: "Online Assessment", desc: "2 coding questions + work style simulation checking Leadership Principles." },
    { title: "Technical Loop", desc: "4-5 onsite rounds focusing on DSA, HLD/LLD, and leadership behavior answers." },
    { title: "Debrief Panel", desc: "All interviewers align and select the hiring bar alignment status." },
    { title: "Offer Delivery", desc: "Salary package discussions, benefits details, and onboarding schedules." }
  ],
  Meta: [
    { title: "Profile Evaluation", desc: "Screening profiles showing strong problem solving and shipping experience." },
    { title: "Technical Screen", desc: "1-2 coding questions. You must solve them quickly and cleanly in 45 minutes." },
    { title: "Onsite Loop", desc: "2 coding rounds + 1 system design round + 1 behavioral (PE/culture) round." },
    { title: "Hiring Board Review", desc: "Independent engineering directors review feedback reports to approve hires." },
    { title: "Compensation & Offer", desc: "Coordinate base, equity details, target starting dates, and signing sheets." }
  ],
};

const getDefaultSteps = (companyName) =>
  STATIC_HIRING[companyName] || [
    { title: "Resume Screening", desc: "Initial evaluation of your profile, projects, and technical background." },
    { title: "Online Assessment", desc: "Coding and aptitude evaluation to shortlist candidates." },
    { title: "Technical Rounds", desc: "DSA, system design, and core CS concept evaluation." },
    { title: "HR & Offer", desc: "Behavioral discussion, compensation, and onboarding details." }
  ];

const HiringProcess = ({ companyName }) => {
  const [steps, setSteps]       = useState(getDefaultSteps(companyName));
  const [isLive, setIsLive]     = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setSteps(getDefaultSteps(companyName));
    setIsLive(false);

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const slug = companyName.toLowerCase().trim().replace(/\s+/g, "-");
        const res = await fetch(`${API_BASE_URL}/company/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.hiring_process) && data.hiring_process.length > 0) {
            setSteps(data.hiring_process);
            setIsLive(true);
          }
        }
      } catch (err) {
        console.warn("HiringProcess API fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [companyName]);

  return (
    <section className="hiring-process-section">
      <div className="hiring-process-container">

        <div className="section-header-mini">
          <span className="section-mini-tag">⏳ Hiring Funnel</span>
          <h2 className="hiring-process-title">
            The hiring process at <span>{companyName}</span>
          </h2>
          <p>Navigate the official pipeline steps from initial resume screening to the final compensation discussions.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading hiring process...
          </div>
        ) : (
          <div className="process-timeline-flow">
            {steps.map((step, idx) => (
              <div className="process-step-node" key={idx}>
                <div className="step-counter-bubble">
                  <span>{idx + 1}</span>
                </div>
                <div className="step-content-box card">
                  <h4>{step.title}</h4>
                  <p>{step.desc || step.details || step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default HiringProcess;
