import React from "react";
import "./CodingLeaderboard.css";

const LEADERBOARD_USERS = [
  { rank: 1, name: "Siddharth Sharma", solved: 142, xp: 8420, streak: 45, avatar: "⚡" },
  { rank: 2, name: "Ananya Iyer", solved: 138, xp: 7950, streak: 28, avatar: "🔥" },
  { rank: 3, name: "Rohit Verma", solved: 131, xp: 7520, streak: 12, avatar: "🧙‍♂️" },
  { rank: 4, name: "Priya Nair", solved: 120, xp: 6890, streak: 31, avatar: "🌟" },
  { rank: 5, name: "Aarav Patel", solved: 115, xp: 6410, streak: 18, avatar: "🧠" }
];

const CodingLeaderboard = () => {
  return (
    <section className="coding-leaderboard-section">
      <div className="coding-leaderboard-container">
        
        <div className="section-header-mini">
          <span className="section-mini-tag">🏆 Top Performers</span>
          <h2>Global Practice Leaderboard</h2>
          <p>Compete with peer developers. Rank is updated in real-time based on successful challenge compilations and streak durations.</p>
        </div>

        <div className="leaderboard-card card">
          <div className="leaderboard-table-header">
            <span>Rank</span>
            <span>Developer</span>
            <span className="col-solved">Solved</span>
            <span className="col-xp">XP Points</span>
            <span className="col-streak">Streak</span>
          </div>

          <div className="leaderboard-list">
            {LEADERBOARD_USERS.map((user) => (
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
        </div>

      </div>
    </section>
  );
};

export default CodingLeaderboard;
