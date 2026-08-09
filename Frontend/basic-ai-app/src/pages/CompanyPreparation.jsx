import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  FaBuilding,
  FaGraduationCap,
  FaListOl,
  FaLaptopCode,
  FaCode,
  FaServer,
  FaUserCheck,
  FaBrain,
  FaPlay,
  FaCalendarCheck,
  FaCog,
  FaCheckSquare,
  FaSquare,
  FaStar,
  FaChevronRight,
  FaLightbulb,
  FaCheckCircle
} from "react-icons/fa";

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
  const { authFetch } = useAuth();
  const [selectedCompany, setSelectedCompany] = useState("Google");
  const [activePipelineStep, setActivePipelineStep] = useState(1);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Interactive Prep Plan Checkbox Tracking State
  const [completedTasks, setCompletedTasks] = useState(() => {
    const saved = localStorage.getItem(`prep_tasks_${selectedCompany}`);
    return saved ? JSON.parse(saved) : {};
  });

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
    const saved = localStorage.getItem(`prep_tasks_${selectedCompany}`);
    setCompletedTasks(saved ? JSON.parse(saved) : {});
  }, [selectedCompany]);

  const toggleTask = (taskKey) => {
    const updated = { ...completedTasks, [taskKey]: !completedTasks[taskKey] };
    setCompletedTasks(updated);
    localStorage.setItem(`prep_tasks_${selectedCompany}`, JSON.stringify(updated));
  };

  const handleLaunchCompanyMock = () => {
    const questions = questionsData.length > 0 ? questionsData : [
      { id: "q1", category: "Technical", question: `Explain system architecture trade-offs at ${selectedCompany}.` }
    ];

    localStorage.setItem("mock_setup_prefill", JSON.stringify({
      role: `Software Engineer @ ${selectedCompany}`,
      job_description: `Targeting ${selectedCompany} hiring bar, core values, and engineering culture.`,
      company: selectedCompany,
      questions: questions
    }));

    window.location.href = "/mock-interviews";
  };

  const getEligibilityData = () => {
    if (companyProfile?.eligibility) return companyProfile.eligibility;
    return {
      degree: "B.E. / B.Tech / M.Tech / MCA in CS, IT, ECE or STEM quantitative fields",
      min_cgpa: "7.0 CGPA / 65% aggregate with no active backlogs",
      batch_eligibility: "Current graduating batch & recent graduates (0-3 years exp)",
      backlogs_allowed: "0 active backlogs at time of interview loop"
    };
  };

  const getHiringProcess = () => {
    if (companyProfile?.hiring_process) return companyProfile.hiring_process;
    return [
      { stage: 1, title: "Online Assessment (OA)", duration: "90 Mins", details: "2 Coding Problems (DSA) + 20 Core CS MCQs" },
      { stage: 2, title: "Technical Round 1", duration: "60 Mins", details: "Data Structures & Algorithms, Code Dry Runs" },
      { stage: 3, title: "Technical Round 2 (System Design)", duration: "60 Mins", details: "High-level & Low-level system design" },
      { stage: 4, title: "HR & Behavioral Round", duration: "45 Mins", details: "Cultural alignment & STAR behavioral scenario responses" }
    ];
  };

  const getOASpecs = () => {
    if (companyProfile?.online_assessment_specs) return companyProfile.online_assessment_specs;
    return {
      platform: "HackerRank / CodeSignal",
      duration_mins: 90,
      sections: ["Coding (2 Problems)", "Computer Science MCQs"],
      cutoff_percentage: "85%"
    };
  };

  const getPrepPlan = () => {
    if (companyProfile?.personalized_prep_plan) return companyProfile.personalized_prep_plan;
    return [
      { week: "Week 1", focus: "Advanced DSA & Target Patterns", tasks: [`Solve top ${selectedCompany} tagged LeetCode problems`, "Master Graph & Dynamic Programming patterns"] },
      { week: "Week 2", focus: "System Design & Architecture", tasks: ["Study load balancing, caching, microservices", "Review LLD class diagrams"] },
      { week: "Week 3", focus: "Core CS Fundamentals & MCQs", tasks: ["Revise OS concurrency, DBMS indexing", "Practice timed OA mock assessment"] },
      { week: "Week 4", focus: "Behavioral STAR & Company Mock", tasks: [`Draft STAR stories aligned to ${selectedCompany} values`, `Launch 1-click ${selectedCompany} Mock Interview`] }
    ];
  };

  const eligibility = getEligibilityData();
  const hiringProcess = getHiringProcess();
  const oaSpecs = getOASpecs();
  const prepPlan = getPrepPlan();

  // Filter category questions from questionsData
  const technicalQuestions = questionsData.filter(q => q.category?.toLowerCase() === "technical");
  const hrQuestions = questionsData.filter(q => q.category?.toLowerCase() === "hr");
  const behavioralQuestions = questionsData.filter(q => q.category?.toLowerCase() === "behavioral");

  // 10-Step Sequential Pipeline requested by prompt
  const pipelineSteps = [
    { id: 1, icon: <FaBuilding />, label: "Company Overview" },
    { id: 2, icon: <FaGraduationCap />, label: "Eligibility Criteria" },
    { id: 3, icon: <FaListOl />, label: "Hiring Process" },
    { id: 4, icon: <FaLaptopCode />, label: "Online Assessment" },
    { id: 5, icon: <FaCode />, label: "DSA Questions" },
    { id: 6, icon: <FaServer />, label: "Technical & System Design" },
    { id: 7, icon: <FaUserCheck />, label: "HR Round" },
    { id: 8, icon: <FaBrain />, label: "Behavioral STAR" },
    { id: 9, icon: <FaPlay />, label: "Company Mock Interview" },
    { id: 10, icon: <FaCalendarCheck />, label: "Personalized Prep Plan" }
  ];

  return (
    <>
      <Navbar />

      <main className="company-page-container">
        {/* Company Hero Banner */}
        <CompanyHero />

        {/* Company Top Selector & Admin Management Trigger */}
        <div style={{ maxWidth: "1200px", margin: "1rem auto 0 auto", padding: "0 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ background: "rgba(168, 85, 247, 0.15)", color: "#a855f7", padding: "4px 12px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
              🎯 Live Target: {selectedCompany}
            </span>
          </div>
          <button
            onClick={() => setIsAdminOpen(true)}
            style={{
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#e9d5ff",
              padding: "0.5rem 1rem",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.2s"
            }}
          >
            <FaCog style={{ color: "#a855f7" }} /> ⚙️ Admin Data Manager
          </button>
        </div>

        {/* Company Selection Grid */}
        <TopCompanies 
          selectedCompany={selectedCompany} 
          onSelectCompany={(comp) => {
            setSelectedCompany(comp);
            setActivePipelineStep(1);
          }} 
        />

        {/* 10-Step Sequential Pipeline Navigation Bar */}
        <div style={{ maxWidth: "1200px", margin: "2rem auto", padding: "0 1rem" }}>
          <div style={{
            display: "flex",
            overflowX: "auto",
            gap: "0.5rem",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "0.75rem",
            borderRadius: "14px",
            border: "1px solid rgba(168, 85, 247, 0.3)"
          }}>
            {pipelineSteps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActivePipelineStep(step.id)}
                style={{
                  padding: "0.6rem 0.9rem",
                  borderRadius: "10px",
                  border: "none",
                  background: activePipelineStep === step.id ? "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)" : "transparent",
                  color: activePipelineStep === step.id ? "#fff" : "#94a3b8",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                <span>{step.icon}</span>
                <span>{step.id}. {step.label}</span>
              </button>
            ))}
          </div>

          {/* Active Step Content Display */}
          <div style={{
            background: "#0f172a",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            padding: "2rem",
            marginTop: "1.5rem",
            color: "#f8fafc",
            minHeight: "350px"
          }}>

            {/* Step 1: Company Overview */}
            {activePipelineStep === 1 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#a855f7", fontSize: "1.4rem" }}>
                      🏢 {selectedCompany} Overview & Engineering Culture
                    </h3>
                    <p style={{ color: "#cbd5e1", fontSize: "1rem", lineHeight: "1.6", maxWidth: "800px" }}>
                      {companyProfile?.description || `${selectedCompany} is a global tech pioneer testing candidates on strong algorithmic optimization, system scalability, and cultural alignment.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePipelineStep(2)}
                    style={{ background: "#1e293b", border: "1px solid rgba(168, 85, 247, 0.3)", color: "#a855f7", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Eligibility <FaChevronRight />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Industry Sector</span>
                    <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "1.05rem" }}>{companyProfile?.industry || "Technology"}</div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Interview Difficulty Rating</span>
                    <div style={{ fontWeight: "700", color: "#f59e0b", marginTop: "4px", fontSize: "1.05rem" }}>{companyProfile?.difficulty_rating || "Hard"}</div>
                  </div>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Database Question Items</span>
                    <div style={{ fontWeight: "700", color: "#10b981", marginTop: "4px", fontSize: "1.05rem" }}>{questionsData.length} Target Questions</div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Eligibility Criteria */}
            {activePipelineStep === 2 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#3b82f6", fontSize: "1.3rem" }}>🎓 {selectedCompany} Eligibility Criteria</h3>
                  <button
                    onClick={() => setActivePipelineStep(3)}
                    style={{ background: "#1e293b", border: "1px solid rgba(59, 130, 246, 0.3)", color: "#60a5fa", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Hiring Process <FaChevronRight />
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", borderLeft: "4px solid #3b82f6" }}>
                    <strong style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Degree & Branches Required</strong>
                    <p style={{ margin: "6px 0 0 0", fontWeight: "600", fontSize: "0.95rem" }}>{eligibility.degree}</p>
                  </div>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", borderLeft: "4px solid #10b981" }}>
                    <strong style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Minimum CGPA / Percentage Cutoff</strong>
                    <p style={{ margin: "6px 0 0 0", fontWeight: "600", fontSize: "0.95rem" }}>{eligibility.min_cgpa}</p>
                  </div>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", borderLeft: "4px solid #a855f7" }}>
                    <strong style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Eligible Batches & Experience</strong>
                    <p style={{ margin: "6px 0 0 0", fontWeight: "600", fontSize: "0.95rem" }}>{eligibility.batch_eligibility}</p>
                  </div>
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", borderLeft: "4px solid #f59e0b" }}>
                    <strong style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Backlogs Policy & Gaps</strong>
                    <p style={{ margin: "6px 0 0 0", fontWeight: "600", fontSize: "0.95rem" }}>{eligibility.backlogs_allowed}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Hiring Process */}
            {activePipelineStep === 3 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#10b981", fontSize: "1.3rem" }}>📋 Recruitment & Hiring Process Timeline</h3>
                  <button
                    onClick={() => setActivePipelineStep(4)}
                    style={{ background: "#1e293b", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Online Assessment <FaChevronRight />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                  {hiringProcess.map((stg, i) => (
                    <div key={i} style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1.25rem", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <span style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "1rem" }}>
                        {stg.stage || i+1}
                      </span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, color: "#fff", fontSize: "1.05rem" }}>
                          {stg.title} <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: "400" }}>({stg.duration})</span>
                        </h4>
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "0.9rem" }}>{stg.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Online Assessment (OA) */}
            {activePipelineStep === 4 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#f59e0b", fontSize: "1.3rem" }}>💻 Online Assessment (OA) Specifications</h3>
                  <button
                    onClick={() => setActivePipelineStep(5)}
                    style={{ background: "#1e293b", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fbbf24", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: DSA Questions <FaChevronRight />
                  </button>
                </div>
                <div style={{ background: "#1e293b", padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem" }}>
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Testing Platform</span>
                      <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "1.1rem" }}>{oaSpecs.platform}</div>
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Test Duration</span>
                      <div style={{ fontWeight: "700", marginTop: "4px", fontSize: "1.1rem" }}>{oaSpecs.duration_mins} Minutes</div>
                    </div>
                    <div>
                      <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>Cutoff Benchmark</span>
                      <div style={{ fontWeight: "700", color: "#10b981", marginTop: "4px", fontSize: "1.1rem" }}>{oaSpecs.cutoff_percentage}</div>
                    </div>
                  </div>

                  <h4 style={{ color: "#fff", margin: "1.5rem 0 0.5rem 0" }}>Test Sections Breakdown</h4>
                  <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#cbd5e1" }}>
                    {(oaSpecs.sections || ["2 Algorithmic Coding Problems", "Core CS MCQs"]).map((sec, idx) => (
                      <li key={idx} style={{ marginBottom: "6px" }}>{sec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 5: DSA Questions */}
            {activePipelineStep === 5 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#a855f7", fontSize: "1.3rem" }}>⚡ Data Structures & Algorithmic Problem Bank</h3>
                  <button
                    onClick={() => setActivePipelineStep(6)}
                    style={{ background: "#1e293b", border: "1px solid rgba(168, 85, 247, 0.3)", color: "#c084fc", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Technical & System Design <FaChevronRight />
                  </button>
                </div>
                <CompanyQuestions companyName={selectedCompany} />
              </div>
            )}

            {/* Step 6: Technical & System Design */}
            {activePipelineStep === 6 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#60a5fa", fontSize: "1.3rem" }}>🛠️ Technical & System Design Focus Areas</h3>
                  <button
                    onClick={() => setActivePipelineStep(7)}
                    style={{ background: "#1e293b", border: "1px solid rgba(96, 165, 250, 0.3)", color: "#60a5fa", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: HR Round <FaChevronRight />
                  </button>
                </div>
                <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                  Core CS fundamentals tested at <strong>{selectedCompany}</strong>: Operating System internals (concurrency, threads, memory locking), Database indexing (B-Trees, ACID transactions), Computer Networking (TCP/IP handshake, HTTP/2), and High-Level System Design (caching, load balancers, rate limiters).
                </p>

                {technicalQuestions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1.25rem" }}>
                    <h4 style={{ color: "#fff", margin: 0 }}>Target Technical Questions from DB</h4>
                    {technicalQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: "#1e293b", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #60a5fa" }}>
                        <strong style={{ color: "#fff" }}>{q.title}</strong>
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "0.88rem" }}>{q.instructions}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "10px", marginTop: "1rem", color: "#94a3b8" }}>
                    💡 Tip: Practice Low Level Design (LLD) class diagrams and High Level Architecture (HLD) trade-offs for {selectedCompany}.
                  </div>
                )}
              </div>
            )}

            {/* Step 7: HR Round */}
            {activePipelineStep === 7 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#ec4899", fontSize: "1.3rem" }}>👔 HR & Cultural Alignment Round</h3>
                  <button
                    onClick={() => setActivePipelineStep(8)}
                    style={{ background: "#1e293b", border: "1px solid rgba(236, 72, 153, 0.3)", color: "#f472b6", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Behavioral STAR <FaChevronRight />
                  </button>
                </div>
                <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                  The HR round evaluates your long-term alignment with <strong>{selectedCompany}</strong>, career motivations, relocation flexibility, and salary expectations.
                </p>

                {hrQuestions.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "1.25rem" }}>
                    <h4 style={{ color: "#fff", margin: 0 }}>HR Questions for {selectedCompany}</h4>
                    {hrQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: "#1e293b", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #ec4899" }}>
                        <strong style={{ color: "#fff" }}>{q.title}</strong>
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "0.88rem" }}>{q.instructions}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "10px", marginTop: "1rem" }}>
                    <h4 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>Key HR Questions to Prepare</h4>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#cbd5e1", fontSize: "0.9rem" }}>
                      <li>Why do you specifically want to join {selectedCompany}?</li>
                      <li>Where do you see yourself in 3-5 years engineering career path?</li>
                      <li>How do you handle working in high-pace cross-functional engineering teams?</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step 8: Behavioral STAR */}
            {activePipelineStep === 8 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#34d399", fontSize: "1.3rem" }}>🧠 Behavioral Round & Leadership STAR Framework</h3>
                  <button
                    onClick={() => setActivePipelineStep(9)}
                    style={{ background: "#1e293b", border: "1px solid rgba(52, 211, 153, 0.3)", color: "#34d399", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Company Mock Interview <FaChevronRight />
                  </button>
                </div>
                <div style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(52, 211, 153, 0.2)", marginBottom: "1.25rem" }}>
                  <h4 style={{ color: "#34d399", margin: "0 0 0.5rem 0" }}>The STAR Framework</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", fontSize: "0.85rem" }}>
                    <div><strong>S - Situation:</strong> Set context and background</div>
                    <div><strong>T - Task:</strong> Define your specific responsibility</div>
                    <div><strong>A - Action:</strong> Describe engineering steps YOU took</div>
                    <div><strong>R - Result:</strong> Highlight quantitative business metrics</div>
                  </div>
                </div>

                {behavioralQuestions.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    <h4 style={{ color: "#fff", margin: 0 }}>Behavioral Scenarios for {selectedCompany}</h4>
                    {behavioralQuestions.map((q, idx) => (
                      <div key={idx} style={{ background: "#1e293b", padding: "1rem", borderRadius: "10px", borderLeft: "4px solid #34d399" }}>
                        <strong style={{ color: "#fff" }}>{q.title}</strong>
                        <p style={{ margin: "4px 0 0 0", color: "#cbd5e1", fontSize: "0.88rem" }}>{q.instructions}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 9: Company Mock Interview */}
            {activePipelineStep === 9 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <h3 style={{ margin: 0, color: "#10b981", fontSize: "1.4rem" }}>🎯 Launch 1-Click {selectedCompany} AI Mock Interview</h3>
                  <button
                    onClick={() => setActivePipelineStep(10)}
                    style={{ background: "#1e293b", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: "600" }}
                  >
                    Next: Prep Plan <FaChevronRight />
                  </button>
                </div>
                <p style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
                  Simulate an authentic live interview tailored specifically to <strong>{selectedCompany}</strong>'s difficulty, technical evaluation bar, and core values.
                </p>

                <div style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "1.75rem", borderRadius: "16px", margin: "1.5rem 0" }}>
                  <h4 style={{ color: "#fff", margin: "0 0 0.5rem 0" }}>Interview Setup Parameters:</h4>
                  <ul style={{ color: "#cbd5e1", margin: "0 0 1.25rem 1.25rem", padding: 0, fontSize: "0.9rem" }}>
                    <li><strong>Target Role:</strong> Software Engineer @ {selectedCompany}</li>
                    <li><strong>Hiring Bar:</strong> {companyProfile?.difficulty_rating || "Hard"} Level Evaluation</li>
                    <li><strong>Question Dataset:</strong> {questionsData.length} Company-Tagged Questions loaded</li>
                  </ul>

                  <button
                    onClick={handleLaunchCompanyMock}
                    style={{
                      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "#fff",
                      border: "none",
                      padding: "0.9rem 1.75rem",
                      borderRadius: "12px",
                      fontWeight: "700",
                      fontSize: "1.05rem",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)"
                    }}
                  >
                    🚀 Launch {selectedCompany} AI Mock Interview Session
                  </button>
                </div>
              </div>
            )}

            {/* Step 10: Personalized Preparation Plan */}
            {activePipelineStep === 10 && (
              <div>
                <h3 style={{ margin: "0 0 0.5rem 0", color: "#a855f7", fontSize: "1.4rem" }}>
                  🗺️ Personalized 4-Week {selectedCompany} Preparation Plan
                </h3>
                <p style={{ color: "#cbd5e1", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                  Follow this structured weekly roadmap. Check off completed tasks to track your readiness percentage.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {prepPlan.map((p, i) => (
                    <div key={i} style={{ background: "#1e293b", padding: "1.25rem", borderRadius: "14px", borderLeft: "4px solid #a855f7" }}>
                      <strong style={{ color: "#a855f7", fontSize: "1.05rem" }}>{p.week}: {p.focus}</strong>
                      <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        {(p.tasks || []).map((task, tidx) => {
                          const taskKey = `${selectedCompany}_w${i}_t${tidx}`;
                          const isDone = !!completedTasks[taskKey];
                          return (
                            <div
                              key={tidx}
                              onClick={() => toggleTask(taskKey)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                                background: "rgba(15, 23, 42, 0.6)",
                                padding: "0.6rem 0.85rem",
                                borderRadius: "8px",
                                cursor: "pointer",
                                border: isDone ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid transparent"
                              }}
                            >
                              {isDone ? (
                                <FaCheckSquare style={{ color: "#10b981" }} />
                              ) : (
                                <FaSquare style={{ color: "#64748b" }} />
                              )}
                              <span style={{ fontSize: "0.88rem", color: isDone ? "#94a3b8" : "#f1f5f9", textDecoration: isDone ? "line-through" : "none" }}>
                                {task}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
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
