import React, { useState, useEffect } from "react";
import "./InterviewRounds.css";

const API_BASE_URL = "http://localhost:8000/api";

const STATIC_ROUNDS = {
  Google: [
    { name: "Technical / Coding Round", duration: "45 Mins", focus: "DSA, Trees, Graphs, DP", tip: "State your time/space complexity before coding. Walk through edge cases out loud." },
    { name: "System Design", duration: "45 Mins", focus: "Scalability, Caching, Databases", tip: "Start with functional/non-functional requirements. Sketch high-level block designs first." },
    { name: "Googlyness & Leadership", duration: "45 Mins", focus: "Behavioral, Teamwork, Diversity", tip: "Show willingness to learn, adapt, and handle conflict. Use the STAR methodology." }
  ],
  Microsoft: [
    { name: "Online Test / Screen", duration: "60 Mins", focus: "DSA, Arrays, Strings", tip: "Make sure code is clean and passes all hidden boundary test cases." },
    { name: "Technical Onsite", duration: "45 Mins", focus: "OOP Design, Linked Lists, Trees", tip: "Think about design patterns, encapsulation, clean API structures." },
    { name: "System Design / Architecture", duration: "45 Mins", focus: "Microservices, API Design", tip: "Focus on decoupled architectures, databases, and trade-offs." }
  ],
  Amazon: [
    { name: "Online Assessment (OA)", duration: "90 Mins", focus: "DSA + Leadership Principles", tip: "Manage your time wisely. Read the leadership simulation scenarios closely." },
    { name: "Coding Round", duration: "45 Mins", focus: "Arrays, Maps, Stacks, Queues", tip: "Explain how your code aligns with customer obsession or operational standards." },
    { name: "System Design Round", duration: "45 Mins", focus: "Sharding, CDNs, Load Balancers", tip: "Design for durability and high availability. Use AWS-like concepts." }
  ],
  Meta: [
    { name: "Coding Screen", duration: "45 Mins", focus: "Fast Algorithms, Speed", tip: "You must solve 2 medium problems. Don't spend more than 5 minutes explaining." },
    { name: "Coding Onsite (2 Rounds)", duration: "45 Mins each", focus: "Hard DSA, Dynamic Programming", tip: "Meta focuses on optimal solutions. Avoid brute force immediately." },
    { name: "Product Design", duration: "45 Mins", focus: "Product Architecture, APIs", tip: "Focus on client-server interactions, database schemas, and protocols." }
  ],
};

const getDefaultRounds = (companyName) =>
  STATIC_ROUNDS[companyName] || [
    { name: "Online Assessment", duration: "60-90 Mins", focus: "DSA, Aptitude, Core CS", tip: "Practice time management. Don't get stuck on one question." },
    { name: "Technical Interview", duration: "45 Mins", focus: "Projects, CS Fundamentals, Coding", tip: "Explain your thought process clearly. Walk through your solutions." },
    { name: "HR Round", duration: "30 Mins", focus: "Communication, Motivation, Fit", tip: "Be genuine and specific. Quantify achievements wherever possible." }
  ];

const InterviewRounds = ({ companyName }) => {
  const [rounds, setRounds]   = useState(getDefaultRounds(companyName));
  const [isLive, setIsLive]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRounds(getDefaultRounds(companyName));
    setIsLive(false);

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const slug = companyName.toLowerCase().trim().replace(/\s+/g, "-");
        const res = await fetch(`${API_BASE_URL}/company/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.interview_rounds) && data.interview_rounds.length > 0) {
            setRounds(data.interview_rounds);
            setIsLive(true);
          }
        }
      } catch (err) {
        console.warn("InterviewRounds API fallback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [companyName]);

  return (
    <section className="interview-rounds-section">
      <div className="interview-rounds-container">

        <div className="section-header-mini">
          <span className="section-mini-tag">🛡️ Round Guide</span>
          <h2 className="interview-rounds-title">
            Targeted <span>Round Strategy</span>
          </h2>
          <p>Read the structured round patterns, specific technical focuses, and optimization tips designed to beat the panel.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading round details...
          </div>
        ) : (
          <div className="rounds-table-card card">
            <div className="rounds-table-header">
              <div>Round Name</div>
              <div>Duration</div>
              <div>Focus Topics</div>
              <div>AI Preparation Tip</div>
            </div>

            <div className="rounds-table-body">
              {rounds.map((rnd, idx) => (
                <div className="rounds-table-row" key={idx}>
                  <div className="round-name-cell">
                    <strong>{rnd.name}</strong>
                  </div>
                  <div className="round-duration-cell">
                    <span>⏳ {rnd.duration}</span>
                  </div>
                  <div className="round-focus-cell">
                    <span>{rnd.focus}</span>
                  </div>
                  <div className="round-tip-cell">
                    <p>💡 {rnd.tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default InterviewRounds;
