import React from "react";
import "./InterviewRounds.css";

const ROUNDS_DATA = {
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
  Netflix: [
    { name: "System Architecture", duration: "60 Mins", focus: "Streaming Protocols, CDNs", tip: "Discuss failure recovery, network latency, and video caching layers." },
    { name: "Senior Coding & LLD", duration: "60 Mins", focus: "Concurrency, Thread Safety", tip: "Design robust APIs. Ensure proper locking, resource management, and testing." }
  ],
  Apple: [
    { name: "Low-Level Coding", duration: "60 Mins", focus: "Memory Management, C/C++ Basics", tip: "Understand pointers, stack vs heap, assembly foundations, and constraints." },
    { name: "Systems Design", duration: "45 Mins", focus: "Device-to-Cloud sync, Security", tip: "Address privacy protocols, local SQLite storage sync, and battery optimization." }
  ],
  TCS: [
    { name: "Aptitude (NQT)", duration: "120 Mins", focus: "Quant, English, Coding Logic", tip: "Practice speed calculation. Standard logic questions are repeated." },
    { name: "Technical Interview", duration: "30 Mins", focus: "Core Java, DBMS, SQL, Projects", tip: "Be thorough with your final-year college project and basic SQL queries." }
  ],
  Infosys: [
    { name: "Aptitude Round", duration: "95 Mins", focus: "Logical Reasoning, Math, Verbal", tip: "Prioritize questions you are strong in. Do not spend too much time on single questions." },
    { name: "Technical Round", duration: "30 Mins", focus: "CS Core, Python/Java, Web Dev", tip: "Understand OOP concepts clearly. Be ready to explain polymorphism and inheritance." }
  ]
};

const InterviewRounds = ({ companyName }) => {
  const rounds = ROUNDS_DATA[companyName] || ROUNDS_DATA.Google;

  return (
    <section className="interview-rounds-section">
      <div className="interview-rounds-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🛡️ Round Guide</span>
          <h2>Targeted Round Strategy</h2>
          <p>Read the structured round patterns, specific technical focuses, and optimization tips designed to beat the panel.</p>
        </div>

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

      </div>
    </section>
  );
};

export default InterviewRounds;
