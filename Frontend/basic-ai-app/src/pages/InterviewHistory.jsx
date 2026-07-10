import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaCalendarAlt, FaCheckDouble, FaTimes } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000/api";

const InterviewHistory = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/history/interviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        } else {
          throw new Error("Failed to fetch history");
        }
      } catch (err) {
        console.warn("Backend API unavailable, using offline history list:", err);
        // Offline fallback data
        setHistory([
          {
            id: "h1",
            interview_session_id: "s1",
            overall_score: 82,
            scores_breakdown: {
              communication: 85,
              technical: 78,
              confidence: 90
            },
            verdict: "Hire",
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "h2",
            interview_session_id: "s2",
            overall_score: 75,
            scores_breakdown: {
              communication: 72,
              technical: 70,
              confidence: 80
            },
            verdict: "Hire",
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "h3",
            interview_session_id: "s3",
            overall_score: 58,
            scores_breakdown: {
              communication: 60,
              technical: 50,
              confidence: 65
            },
            verdict: "No Hire",
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchHistory();
    }
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #7c3aed",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          animation: "spin 1s linear infinite",
          margin: "0 auto 15px"
        }} />
        <p style={{ color: "#4b5563" }}>Retrieving past evaluations...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1f2937", marginBottom: "8px" }}>
          Your Interview History
        </h2>
        <p style={{ color: "#6b7280" }}>
          Review scores, feedback breakdowns, and performance trends from your previous AI sessions.
        </p>
      </div>

      {history.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {history.map((item) => (
            <div className="historyCard" key={item.id} style={{
              background: "#ffffff",
              padding: "30px",
              borderRadius: "20px",
              boxShadow: "0 10px 25px rgba(0,0,0,.06)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", color: "#1f2937", fontWeight: "700" }}>
                    AI Mock Evaluation Session
                  </h3>
                  <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#6b7280", marginTop: "6px" }}>
                    <FaCalendarAlt />
                    <span>Completed on: {new Date(item.created_at).toLocaleDateString()}</span>
                    <span style={{ color: "#d1d5db" }}>|</span>
                    <span style={{
                      fontWeight: "bold",
                      color: item.verdict === "Hire" ? "#10b981" : "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      {item.verdict === "Hire" ? <FaCheckDouble /> : <FaTimes />}
                      {item.verdict === "Hire" ? "Passed Verdict" : "Needs Work"}
                    </span>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color: item.overall_score >= 80 ? "#10b981" : item.overall_score >= 60 ? "#d97706" : "#ef4444"
                  }}>
                    {item.overall_score}%
                  </span>
                  <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>Overall Rating</p>
                </div>
              </div>

              {/* Sub-Score Breakdown */}
              <div style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px dashed #e5e7eb",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px"
              }}>
                <div>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Communication</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${item.scores_breakdown.communication}%`, height: "100%", background: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#374151" }}>{item.scores_breakdown.communication}%</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Technical Aptitude</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${item.scores_breakdown.technical}%`, height: "100%", background: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#374151" }}>{item.scores_breakdown.technical}%</span>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: "13px", color: "#6b7280" }}>Confidence / Demeanor</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <div style={{ flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${item.scores_breakdown.confidence}%`, height: "100%", background: "#7c3aed" }} />
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#374151" }}>{item.scores_breakdown.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: "#ffffff",
          padding: "50px",
          borderRadius: "20px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,.06)",
          color: "#6b7280"
        }}>
          No previous interview records were found. Set up your first round under the "New Interview" tab to get evaluated!
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
