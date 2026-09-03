import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaCode, FaCheckCircle, FaExclamationTriangle, FaSearch, FaFilter, FaFire, FaTimesCircle } from "react-icons/fa";
import "./CodingStatistics.css";

const API_BASE_URL = "http://localhost:8000/api";

const CodingStatistics = () => {
  const { token, authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [filterTab, setFilterTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, historyRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/coding/statistics`),
          authFetch(`${API_BASE_URL}/coding/history`)
        ]);

        if (statsRes.ok) {
          const sData = await statsRes.json();
          setStats(sData);
        }

        if (historyRes.ok) {
          const hData = await historyRes.json();
          setHistory(hData);
        }
      } catch (err) {
        console.warn("Error loading coding practice history & stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Filtering history
  const filteredHistory = history.filter((item) => {
    const pName = item.problem_name || "";
    const matchesSearch = pName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filterTab === "solved") return item.status === "accepted";
    if (filterTab === "attempted") return item.status !== "accepted";
    if (filterTab === "easy") return item.difficulty?.toLowerCase() === "easy";
    if (filterTab === "medium") return item.difficulty?.toLowerCase() === "medium";
    if (filterTab === "hard") return item.difficulty?.toLowerCase() === "hard";

    return true;
  });

  const totalBank = stats?.total_problems_bank || 120;
  const solved = stats?.problems_solved || 0;
  const accuracy = stats?.accuracy || 0;
  const easySolved = stats?.easy_solved || 0;
  const mediumSolved = stats?.medium_solved || 0;
  const hardSolved = stats?.hard_solved || 0;

  const topicPerf = stats?.topic_performance || {
    Arrays: 80,
    Strings: 75,
    "Linked Lists": 60,
    Trees: 50,
    Graphs: 40,
    "Dynamic Programming": 42
  };
  const weakestTopic = stats?.weakest_topic || "Dynamic Programming";

  return (
    <section className="coding-stats-section" style={{ color: "#F8F8FA", padding: "2rem 0" }}>
      <div className="coding-stats-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        
        <div className="section-header-mini" style={{ marginBottom: "1.5rem" }}>
          <span className="section-mini-tag">📊 Practice & History Analytics</span>
          <h2>Your Coding <span>Performance</span></h2>
          <p>Real-time submission log, problem progress breakdown, and topic weakness identification.</p>
        </div>

        {/* Overview Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          <div style={{ background: "#13131A", border: "1px solid #292936", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#A7A7B5", textTransform: "uppercase" }}>Problems Solved</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#22C55E", margin: "0.4rem 0" }}>{solved} / {totalBank}</div>
            <div style={{ fontSize: "0.75rem", color: "#707080" }}>Easy: {easySolved} | Med: {mediumSolved} | Hard: {hardSolved}</div>
          </div>

          <div style={{ background: "#13131A", border: "1px solid #292936", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#A7A7B5", textTransform: "uppercase" }}>Coding Accuracy</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#7F77DD", margin: "0.4rem 0" }}>{accuracy}%</div>
            <div style={{ fontSize: "0.75rem", color: "#707080" }}>Accepted vs Total Attempts</div>
          </div>

          <div style={{ background: "#13131A", border: "1px solid #292936", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", color: "#A7A7B5", textTransform: "uppercase" }}>Total Submissions</div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#38BDF8", margin: "0.4rem 0" }}>{history.length}</div>
            <div style={{ fontSize: "0.75rem", color: "#707080" }}>Recorded in database</div>
          </div>
        </div>

        {/* Topic Performance & Weak Topic Warning */}
        <div style={{ background: "#13131A", border: "1px solid #292936", borderRadius: "16px", padding: "1.5rem", marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: "0 0 1rem 0" }}>Topic Performance Breakdown</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {Object.entries(topicPerf).map(([tName, tAcc]) => (
              <div key={tName} style={{ background: "#1A1A24", border: "1px solid #292936", borderRadius: "10px", padding: "0.85rem 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", fontWeight: "600", marginBottom: "0.4rem" }}>
                  <span>{tName}</span>
                  <span style={{ color: tAcc >= 70 ? "#22C55E" : tAcc >= 50 ? "#EF9F27" : "#EF4444" }}>{tAcc}% Accuracy</span>
                </div>
                <div style={{ height: "6px", background: "#13131A", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ width: `${tAcc}%`, height: "100%", background: tAcc >= 70 ? "#22C55E" : tAcc >= 50 ? "#EF9F27" : "#EF4444", borderRadius: "4px" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weak Area Banner */}
          <div style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "12px",
            padding: "1rem 1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FaExclamationTriangle color="#EF4444" size={24} />
              <div>
                <strong style={{ color: "#EF4444", fontSize: "0.95rem" }}>Weak Topic Identified: {weakestTopic}</strong>
                <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#A7A7B5" }}>
                  Your accuracy on {weakestTopic} is {topicPerf[weakestTopic] || 42}%. Solve target practice problems to improve your rating.
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                const el = document.getElementById("coding-problems-list");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                background: "#E85D30",
                color: "#F8F8FA",
                border: "none",
                padding: "0.5rem 1.2rem",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              [Practice {weakestTopic} Now]
            </button>
          </div>
        </div>

        {/* MY CODING HISTORY TABLE & FILTERS */}
        <div style={{ background: "#13131A", border: "1px solid #292936", borderRadius: "16px", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "700", margin: 0 }}>MY CODING HISTORY</h3>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              {/* Search Box */}
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#707080", fontSize: "0.8rem" }} />
                <input 
                  type="text" 
                  placeholder="Search problem..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "#1A1A24",
                    border: "1px solid #292936",
                    color: "#F8F8FA",
                    padding: "0.4rem 0.8rem 0.4rem 2rem",
                    borderRadius: "8px",
                    fontSize: "0.85rem"
                  }}
                />
              </div>

              {/* Filter Tabs */}
              {["all", "solved", "attempted", "easy", "medium", "hard"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  style={{
                    background: filterTab === tab ? "#7F77DD" : "#1A1A24",
                    color: filterTab === tab ? "#F8F8FA" : "#A7A7B5",
                    border: "1px solid #292936",
                    padding: "0.4rem 0.75rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "capitalize"
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {filteredHistory.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #292936", color: "#707080" }}>
                    <th style={{ padding: "0.75rem 1rem" }}>Problem Name</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Difficulty</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Language</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Attempts</th>
                    <th style={{ padding: "0.75rem 1rem" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item, idx) => {
                    const isAccepted = item.status === "accepted";
                    const diff = item.difficulty || "Medium";
                    const diffColor = diff.toLowerCase() === "easy" ? "#22C55E" : diff.toLowerCase() === "hard" ? "#EF4444" : "#EF9F27";

                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid #1A1A24" }}>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: "600", color: "#F8F8FA" }}>{item.problem_name}</td>
                        <td style={{ padding: "0.75rem 1rem", color: diffColor, fontWeight: "700" }}>{diff}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#A7A7B5", textTransform: "uppercase" }}>{item.language}</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span style={{
                            background: isAccepted ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isAccepted ? "#22C55E" : "#EF4444",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "4px",
                            fontWeight: "700",
                            fontSize: "0.75rem"
                          }}>
                            {isAccepted ? "Solved" : "Attempted"}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "#A7A7B5" }}>{item.attempts_count || 1} {item.attempts_count === 1 ? "attempt" : "attempts"}</td>
                        <td style={{ padding: "0.75rem 1rem", color: "#707080" }}>
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recent"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "#707080" }}>
              {loading ? "Loading coding history..." : "No matching coding submissions found."}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default CodingStatistics;
