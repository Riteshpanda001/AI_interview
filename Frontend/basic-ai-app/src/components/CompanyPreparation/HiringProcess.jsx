import React from "react";
import "./HiringProcess.css";

const HIRING_PROCESS_DATA = {
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
  Netflix: [
    { title: "Recruiter Call", desc: "Check core experience, motivations, and cultural expectations." },
    { title: "Technical Screen", desc: "1-2 high-level coding or system questions with senior infrastructure leads." },
    { title: "Onsite Loop", desc: "2 System Architecture rounds + 2 Coding/LLD rounds + 2 Cultural fit chats." },
    { title: "Feedback Debrief", desc: "Immediate decision round. Focuses on consensus among the panel." },
    { title: "Executive Sign-Off", desc: "Engineering VP and HR director review compensation parameters for sign-off." }
  ],
  Apple: [
    { title: "Initial Screen", desc: "Verify strong specialization in systems, hardware, or target application layers." },
    { title: "Technical Screen", desc: "Detailed technical discussion or coding round testing low-level design." },
    { title: "Onsite Loop", desc: "4-5 rounds of intense technical deep-dives, hardware/software interactions, and design." },
    { title: "Director Interview", desc: "Final fit round evaluating product alignment and vision." },
    { title: "Hiring Offer", desc: "Determine standard tiers, equity components, and coordinate offer details." }
  ],
  TCS: [
    { title: "Online NQT Exam", desc: "National Qualifier Test assessing Numerical, Verbal, Logical, and Basic Coding." },
    { title: "Technical Round", desc: "Face-to-face round assessing academic projects, OOPs, DBMS, SQL, and simple algorithms." },
    { title: "Managerial Round", desc: "Case-study and behavioral questions assessing flexibility and pressure handling." },
    { title: "HR Round", desc: "Document verifications, shifts agreement, relocate guidelines, and salary package explanations." }
  ],
  Infosys: [
    { title: "Aptitude / Coding Screening", desc: "Logical reasoning, mathematical aptitude, and fundamental programming tests." },
    { title: "Technical Interview", desc: "Evaluation of programming fundamentals (Java/Python/C++), projects, and SQL queries." },
    { title: "HR Interview", desc: "General communication check, relocation preferences, and formal compensation details." }
  ]
};

const HiringProcess = ({ companyName }) => {
  const steps = HIRING_PROCESS_DATA[companyName] || HIRING_PROCESS_DATA.Google;

  return (
    <section className="hiring-process-section">
      <div className="hiring-process-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">⏳ Hiring Funnel</span>
          <h2 className="hiring-process-title">The hiring process at <span>{companyName}</span></h2>
          <p>Navigate the official pipeline steps from initial resume screening to the final compensation discussions.</p>
        </div>

        <div className="process-timeline-flow">
          {steps.map((step, idx) => (
            <div className="process-step-node" key={idx}>
              <div className="step-counter-bubble">
                <span>{idx + 1}</span>
              </div>
              <div className="step-content-box card">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HiringProcess;
