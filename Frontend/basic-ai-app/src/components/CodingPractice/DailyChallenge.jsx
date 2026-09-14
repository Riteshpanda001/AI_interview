import React, { useEffect, useState } from "react";
import "./DailyChallenge.css";
import { useAuth } from "../../context/AuthContext";
import useRequireAuth from "../../hooks/useRequireAuth";

const API_BASE_URL = "http://localhost:8000/api";

const DIFFICULTY_COLORS = {
  Easy:   "#22c55e",
  Medium: "#f59e0b",
  Hard:   "#ef4444"
};

const DailyChallenge = ({ onSolve }) => {
  const { authFetch, token, user } = useAuth();
  const { requireAuth } = useRequireAuth();
  const isLoggedIn = !!user;

  const [challenge, setChallenge]           = useState(null);
  const [streak, setStreak]                 = useState({ current_streak: 0, longest_streak: 0, today_completed: false, total_days_practiced: 0 });
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [loadingStreak, setLoadingStreak]   = useState(false);
  const [completing, setCompleting]         = useState(false);
  const [completionMsg, setCompletionMsg]   = useState("");

  // ── Fetch today's challenge (public — no auth needed) ──
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/coding/daily-challenge`);
        if (res.ok) {
          const data = await res.json();
          setChallenge(data);
        }
      } catch (err) {
        console.warn("Could not fetch daily challenge:", err);
        // Fallback static challenge
        setChallenge({
          title: "Binary Search",
          difficulty: "Easy",
          category: "Array",
          description: "Given a sorted array of integers arr and a target value k, return its index. If target is not found, return -1 in O(log N) runtime.",
          xp_reward: 30,
          date: new Date().toISOString().split("T")[0],
          slug: "arr-binary-search"
        });
      } finally {
        setLoadingChallenge(false);
      }
    };
    fetchChallenge();
  }, []);

  // ── Fetch user's streak (requires login) ──
  useEffect(() => {
    if (!token) return;
    const fetchStreak = async () => {
      setLoadingStreak(true);
      try {
        const res = await authFetch(`${API_BASE_URL}/coding/streak`);
        if (res.ok) {
          const data = await res.json();
          setStreak(data);
        }
      } catch (err) {
        console.warn("Could not fetch streak:", err);
      } finally {
        setLoadingStreak(false);
      }
    };
    fetchStreak();
  }, [token]);

  // ── Mark today's challenge as complete ──
  const handleCompleteChallenge = async () => {
    try {
      setCompleting(true);
      const res = await authFetch(`${API_BASE_URL}/coding/daily-challenge/complete`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setStreak(prev => ({
          ...prev,
          current_streak: data.current_streak,
          longest_streak: data.longest_streak,
          today_completed: true,
          total_days_practiced: (prev.total_days_practiced || 0) + 1
        }));
        setCompletionMsg(data.message || "🔥 Challenge completed!");
        setTimeout(() => setCompletionMsg(""), 4000);
      }
    } catch (err) {
      console.warn("Could not complete daily challenge:", err);
    } finally {
      setCompleting(false);
    }
  };

  // ── Solve: scroll to workspace + mark complete ──
  const handleSolveClick = () => {
    requireAuth(() => {
      if (onSolve && challenge) {
        // Pass the challenge as a problem object for AICodingAssistant
        onSolve({
          id: challenge.slug || "two-sum",
          title: challenge.title,
          difficulty: challenge.difficulty,
          category: challenge.category,
          instructions: challenge.description,
          codeTemplate: `// Solve: ${challenge.title}\n// Category: ${challenge.category}\n`,
        });
      }
      // Also mark it complete in the backend
      handleCompleteChallenge();
    }, "/coding-practice");
  };

  if (loadingChallenge) {
    return (
      <section className="daily-challenge-section">
        <div className="daily-challenge-container">
          <div style={{ textAlign: "center", padding: "60px", color: "#64748b", fontSize: "15px" }}>
            Loading today's challenge...
          </div>
        </div>
      </section>
    );
  }

  const diffColor = DIFFICULTY_COLORS[challenge?.difficulty] || "#22c55e";

  return (
    <section className="daily-challenge-section">
      <div className="daily-challenge-container">

        <div className="section-header-mini">
          <span className="section-mini-tag">🔥 Streak Challenge</span>
          <h2>Daily Coding <span>Challenge</span></h2>
          <p>Solve today's selected problem to level up your streak, earn dynamic rank points, and test your speed limits.</p>
        </div>

        <div className="challenge-hero-card card">
          <div className="challenge-card-badge">
            <span className="live-dot">●</span> LIVE CHALLENGE
            {/* Date label */}
            <span style={{ marginLeft: "12px", fontSize: "11px", color: "#94a3b8", fontWeight: "600" }}>
              {challenge?.date || new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>

          <div className="challenge-details">
            <div className="challenge-meta">
              <span className="challenge-difficulty" style={{ background: `${diffColor}22`, color: diffColor }}>
                {challenge?.difficulty || "Easy"}
              </span>
              <span className="challenge-acceptance">
                📂 {challenge?.category || "Array"}
              </span>
              <span className="challenge-score">
                Points: +{challenge?.xp_reward || 30} XP
              </span>
            </div>

            <h3>{challenge?.title || "Loading..."}</h3>
            <p className="challenge-desc">
              {challenge?.description || ""}
            </p>

            {/* Streak Stats Row — shows real data for logged-in users */}
            <div className="streak-stats-row">
              <div className="streak-stat">
                {loadingStreak ? (
                  <strong style={{ color: "#94a3b8" }}>—</strong>
                ) : (
                  <strong style={{ color: streak.current_streak > 0 ? "#f59e0b" : "#94a3b8" }}>
                    {isLoggedIn ? `${streak.current_streak} Days` : "— Days"}
                  </strong>
                )}
                <span>Current Streak</span>
              </div>
              <div className="streak-stat">
                <strong style={{ color: "#10b981" }}>
                  {isLoggedIn ? `${streak.longest_streak || 0} Days` : "Login"}
                </strong>
                <span>Best Streak</span>
              </div>
              <div className="streak-stat">
                <strong>
                  {isLoggedIn ? streak.total_days_practiced || 0 : "—"}
                </strong>
                <span>Days Practiced</span>
              </div>
            </div>

            {/* Completion message */}
            {completionMsg && (
              <div style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
                color: "#10b981",
                padding: "10px 16px",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: "700",
                marginBottom: "12px",
                textAlign: "center"
              }}>
                {completionMsg}
              </div>
            )}

            {/* Today-already-done badge */}
            {isLoggedIn && streak.today_completed && !completionMsg && (
              <div style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#10b981",
                padding: "8px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: "700",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                ✅ You've already completed today's challenge! Keep your streak going tomorrow.
              </div>
            )}

            <div className="challenge-action-row">
              <button
                className="challenge-solve-btn"
                onClick={handleSolveClick}
                disabled={completing}
              >
                {completing ? "Recording..." : streak.today_completed ? "Solve Again →" : "Start Solving Now →"}
              </button>

              {!isLoggedIn && (
                <span style={{ fontSize: "12.5px", color: "#94a3b8", fontStyle: "italic", marginLeft: "12px" }}>
                  Login to track your streak
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DailyChallenge;
