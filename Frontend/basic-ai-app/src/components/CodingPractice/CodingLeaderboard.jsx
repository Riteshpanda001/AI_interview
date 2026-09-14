import React, { useEffect, useState } from "react";
import "./CodingLeaderboard.css";

const API_BASE_URL = "http://localhost:8000/api";

// Fallback static data shown while loading or if API is offline
const FALLBACK_USERS = [
  { rank: 1, name: "Siddharth Sharma", solved: 142, xp: 7100, streak: 45, avatar: "⚡" },
  { rank: 2, name: "Ananya Iyer",      solved: 138, xp: 6900, streak: 28, avatar: "🔥" },
  { rank: 3, name: "Rohit Verma",      solved: 131, xp: 6550, streak: 12, avatar: "🧙‍♂️" },
  { rank: 4, name: "Priya Nair",       solved: 120, xp: 6000, streak: 31, avatar: "🌟" },
  { rank: 5, name: "Aarav Patel",      solved: 115, xp: 5750, streak: 18, avatar: "🧠" }
];

const CodingLeaderboard = () => {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive]   = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/coding/leaderboard`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            setIsLive(true);
          } else {
            // API returned empty list — use fallback
            setUsers(FALLBACK_USERS);
          }
        } else {
          setUsers(FALLBACK_USERS);
        }
      } catch (err) {
        console.warn("Leaderboard API unavailable, using fallback data:", err);
        setUsers(FALLBACK_USERS);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <section className="coding-leaderboard-section">
      <div className="coding-leaderboard-container">

        <div className="section-header-mini">
          <span className="section-mini-tag">🏆 Top Performers</span>
          <h2>Global Practice <span>Leaderboard</span></h2>
          <p>
            Compete with peer developers. Rank is updated in real-time based on
            successful challenge compilations and streak durations.
          </p>
        </div>

        <div className="leaderboard-card card">
          {/* Live / Sample indicator */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "0 4px"
          }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#64748b" }}>
              Top Coders This Week
            </span>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              fontWeight: "700",
              color: isLive ? "#10b981" : "#f59e0b",
              background: isLive ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
              padding: "4px 10px",
              borderRadius: "20px"
            }}>
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: isLive ? "#10b981" : "#f59e0b",
                display: "inline-block",
                animation: isLive ? "pulse 1.5s infinite" : "none"
              }} />
              {loading ? "Loading..." : isLive ? "Live Data" : "Sample Data"}
            </span>
          </div>

          <div className="leaderboard-table-header">
            <span>Rank</span>
            <span>Developer</span>
            <span className="col-solved">Solved</span>
            <span className="col-xp">XP Points</span>
            <span className="col-streak">Streak</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#64748b", fontSize: "14px" }}>
              Loading leaderboard...
            </div>
          ) : (
            <div className="leaderboard-list">
              {users.map((user) => (
                <div className="leaderboard-row" key={user.rank}>
                  <div className="row-rank-cell">
                    <span className={`rank-badge rank-${user.rank}`}>
                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : `#${user.rank}`}
                    </span>
                  </div>

                  <div className="row-user-cell">
                    <span className="user-avatar-icon">{user.avatar}</span>
                    <div className="user-info">
                      <strong>{user.name}</strong>
                      {user.rank === 1 && <span className="admin-tag">Top Coder</span>}
                    </div>
                  </div>

                  <div className="row-solved-cell col-solved">
                    <strong>{user.solved}</strong>
                  </div>

                  <div className="row-xp-cell col-xp">
                    <strong>{user.xp} XP</strong>
                  </div>

                  <div className="row-streak-cell col-streak">
                    <span className="leaderboard-streak-badge">
                      🔥 {user.streak} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default CodingLeaderboard;
