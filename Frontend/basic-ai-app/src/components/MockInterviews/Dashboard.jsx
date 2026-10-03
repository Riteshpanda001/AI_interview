import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import useRequireAuth from "../../hooks/useRequireAuth";
import { 
  FaArrowUp, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaFire, 
  FaTrophy, 
  FaBriefcase, 
  FaCode, 
  FaFileAlt, 
  FaChartLine, 
  FaSync, 
  FaPlus, 
  FaTrash, 
  FaChevronRight, 
  FaMicrophone, 
  FaBuilding, 
  FaInfoCircle,
  FaStar,
  FaHistory,
  FaGraduationCap,
  FaBullseye,
  FaCheckDouble
} from "react-icons/fa";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const Dashboard = ({ onPracticeNow }) => {
  const { user, token, authFetch } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncState, setSyncState] = useState("idle"); // 'idle' | 'syncing' | 'synced'
  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [chartTimeRange, setChartTimeRange] = useState("7d"); // '7d' | '30d' | '90d' | 'all'

  // Goal Form Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalCategory, setGoalCategory] = useState("coding");

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setSyncState("syncing");
      else setLoading(true);
      setError(null);

      const response = await authFetch(`${API_BASE_URL}/dashboard/`);
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
        setLastSyncedTime(new Date());
        if (isManualRefresh) {
          setSyncState("synced");
          setTimeout(() => setSyncState("idle"), 3000);
        }
      } else {
        if (response.status === 401) {
          setError("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          setError("You do not have permission to perform this action.");
        } else if (response.status === 429) {
          setError("Too many requests. Please wait and try again.");
        } else if (response.status >= 500) {
          setError("Something went wrong on the server. Please try again.");
        } else {
          setError(`Failed to load dashboard metrics (HTTP ${response.status}).`);
        }
      }
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
      const isNetErr =
        err?.name === "TypeError" ||
        err?.message?.toLowerCase().includes("fetch") ||
        err?.message?.toLowerCase().includes("network");

      if (isNetErr) {
        setError("Unable to connect to backend server. Please make sure the backend is running on http://localhost:8000.");
      } else {
        setError(err.message || "Failed to load dashboard metrics.");
      }
      setSyncState("idle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  // Goal CRUD handlers
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    try {
      const resp = await authFetch(`${API_BASE_URL}/dashboard/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: goalTitle,
          target_value: parseFloat(goalTarget) || 10,
          current_value: 0,
          category: goalCategory,
          unit: goalCategory === "coding" ? "problems" : goalCategory === "interview" ? "interviews" : "%"
        })
      });

      if (resp.ok) {
        setShowGoalModal(false);
        setGoalTitle("");
        fetchDashboard(true);
      }
    } catch (err) {
      console.error("Error creating goal:", err);
    }
  };

  const handleToggleGoalComplete = async (goal) => {
    try {
      const resp = await authFetch(`${API_BASE_URL}/dashboard/goals/${goal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !goal.completed,
          current_value: !goal.completed ? goal.target_value : 0
        })
      });
      if (resp.ok) {
        fetchDashboard(true);
      }
    } catch (err) {
      console.error("Error updating goal:", err);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const resp = await authFetch(`${API_BASE_URL}/dashboard/goals/${goalId}`, {
        method: "DELETE"
      });
      if (resp.ok) {
        fetchDashboard(true);
      }
    } catch (err) {
      console.error("Error deleting goal:", err);
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="prenova-dashboard">
        <div style={{ display: "flex", gap: "1.25rem", flexDirection: "column" }}>
          <div className="skeleton-box" style={{ height: "140px", width: "100%" }} />
          <div className="metrics-grid-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-box" style={{ height: "120px" }} />
            ))}
          </div>
          <div className="skeleton-box" style={{ height: "260px", width: "100%" }} />
          <div className="skeleton-box" style={{ height: "200px", width: "100%" }} />
        </div>
      </div>
    );
  }

  // Error Banner State
  if (error && !data) {
    return (
      <div className="prenova-dashboard">
        <div className="error-banner-container" style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          margin: "2rem 0"
        }}>
          <FaExclamationTriangle style={{ fontSize: "2.5rem", color: "#EF4444", marginBottom: "1rem" }} />
          <h3 style={{ color: "#F8F8FA", margin: "0 0 0.5rem 0" }}>Dashboard Data Unavailable</h3>
          <p style={{ color: "#A7A7B5", margin: "0 0 1.5rem 0" }}>{error}</p>
          <button 
            className="refresh-btn"
            onClick={() => fetchDashboard(true)}
            style={{ margin: "0 auto" }}
          >
            <FaSync /> Retry Syncing
          </button>
        </div>
      </div>
    );
  }

  // Safe destructuring of aggregated API response payload
  const readiness = data?.readiness || {
    score: data?.interview_readiness || 0,
    level: "Getting Started",
    weeklyImprovement: data?.weekly_improvement || 0,
    monthlyGrowth: data?.monthly_improvement || 0,
    hasSufficientData: (data?.interview_readiness || 0) > 0,
    message: "Complete more preparation activities to generate your Interview Readiness Index.",
    breakdown: { ats: 0, resume: 0, coding: 0, interview: 0, company: 0, consistency: 0 }
  };

  const metrics = data?.metrics || {
    atsScore: data?.ats_score || 0,
    resumeCompletion: data?.resume_completion || 0,
    jobMatchFit: data?.job_match_score || 0,
    targetRoleName: "Target Role",
    interviewScore: data?.interview_score || 0,
    codingAccuracy: data?.coding_score || 0,
    problemsSolved: data?.questions_correct || 0,
    totalProblems: 120,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  };

  const overview = data?.overview || {
    resume: { score: metrics.resumeCompletion, status: metrics.resumeCompletion >= 90 ? "Completed" : metrics.resumeCompletion > 0 ? "In Progress" : "Not Started" },
    ats: { score: metrics.atsScore, status: metrics.atsScore >= 80 ? "Completed" : metrics.atsScore > 0 ? "In Progress" : "Not Started" },
    coding: { score: metrics.codingAccuracy, status: metrics.problemsSolved >= 20 ? "Completed" : metrics.problemsSolved > 0 ? "In Progress" : "Not Started" },
    interview: { score: metrics.interviewScore, status: metrics.interviewScore > 0 ? "In Progress" : "Not Started" },
    company: { score: metrics.jobMatchFit, status: metrics.jobMatchFit > 0 ? "In Progress" : "Not Started" }
  };

  const skillsList = data?.skills || [];
  const statistics = data?.statistics || {
    resumes_created: data?.resume_progress?.versionsCount || 0,
    ats_analyses: data?.ats_performance?.latestScore ? 1 : 0,
    problems_solved: metrics.problemsSolved,
    mock_interviews: data?.total_interviews || 0,
    companies_prepared: data?.company_preparation?.companiesExplored || 0,
    total_prep_time: data?.weekly_activity?.totalTime || "0h 0m",
    current_streak: data?.streak?.count || 0,
    goals_completed: (data?.goals || []).filter(g => g.completed).length
  };

  const recommendations = data?.recommendations || [];
  const careerRoadmap = data?.career_roadmap || [];
  const resumeProgress = data?.resume_progress || { completion: metrics.resumeCompletion, sections: {} };
  const atsPerformance = data?.ats_performance || { latestScore: metrics.atsScore, previousScore: 0, improvement: 0, missingKeywords: [] };
  const codingProgress = data?.coding_progress || { solved: metrics.problemsSolved, total: 120, accuracy: metrics.codingAccuracy, streak: 0, topicPerformance: {}, weakestTopic: "Dynamic Programming" };
  const companyPrep = data?.company_preparation || { companiesExplored: 0, questionsPracticed: 0, companyList: [] };
  const interviewPerf = data?.interview_performance || { overallScore: metrics.interviewScore, technical: 0, communication: 0, confidence: 0, problemSolving: 0, totalInterviews: data?.total_interviews || 0, lastInterview: "None" };
  const performanceHistory = data?.performance_history || { atsScoreHistory: [], interviewPerformanceHistory: [], codingProgressHistory: [] };
  const weeklyActivity = data?.weekly_activity || { days: [], totalTime: "0h 0m", mostProductiveDay: "N/A" };
  const recentActivity = data?.recent_activity || [];
  const goals = data?.goals || [];
  const achievements = data?.achievements || { unlocked: [], nextAchievement: null };
  const quickActions = data?.quick_actions || [];
  const streak = data?.streak || { count: codingProgress.streak || 0, activeToday: false };

  // Determine if User is brand new (zero activity)
  const isNewUser = !readiness.hasSufficientData && metrics.problemsSolved === 0 && (interviewPerf.totalInterviews || 0) === 0 && (metrics.atsScore || 0) === 0;

  // Multi-colored Neon Line Graph Series Calculation for 5 Modules
  const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];

  const rawModulesSeries = [
    {
      id: "resume",
      name: "AI Resume Builder",
      color: "#C084FC",
      score: metrics.resumeCompletion || 0,
      points: [
        Math.round((metrics.resumeCompletion || 0) * 0.35),
        Math.round((metrics.resumeCompletion || 0) * 0.5),
        Math.round((metrics.resumeCompletion || 0) * 0.65),
        Math.round((metrics.resumeCompletion || 0) * 0.72),
        Math.round((metrics.resumeCompletion || 0) * 0.85),
        Math.round((metrics.resumeCompletion || 0) * 0.95),
        metrics.resumeCompletion || 0
      ]
    },
    {
      id: "coding",
      name: "Coding Practice",
      color: "#00FF88",
      score: metrics.codingAccuracy || 0,
      points: [
        Math.round((metrics.codingAccuracy || 0) * 0.25),
        Math.round((metrics.codingAccuracy || 0) * 0.45),
        Math.round((metrics.codingAccuracy || 0) * 0.6),
        Math.round((metrics.codingAccuracy || 0) * 0.68),
        Math.round((metrics.codingAccuracy || 0) * 0.8),
        Math.round((metrics.codingAccuracy || 0) * 0.92),
        metrics.codingAccuracy || 0
      ]
    },
    {
      id: "company",
      name: "Company Preparation",
      color: "#FB7185",
      score: metrics.jobMatchFit || 0,
      points: [
        Math.round((metrics.jobMatchFit || 0) * 0.3),
        Math.round((metrics.jobMatchFit || 0) * 0.5),
        Math.round((metrics.jobMatchFit || 0) * 0.62),
        Math.round((metrics.jobMatchFit || 0) * 0.7),
        Math.round((metrics.jobMatchFit || 0) * 0.82),
        Math.round((metrics.jobMatchFit || 0) * 0.9),
        metrics.jobMatchFit || 0
      ]
    },
    {
      id: "interview",
      name: "AI Interview Prep",
      color: "#FBBF24",
      score: metrics.interviewScore || 0,
      points: [
        Math.round((metrics.interviewScore || 0) * 0.2),
        Math.round((metrics.interviewScore || 0) * 0.4),
        Math.round((metrics.interviewScore || 0) * 0.55),
        Math.round((metrics.interviewScore || 0) * 0.7),
        Math.round((metrics.interviewScore || 0) * 0.85),
        Math.round((metrics.interviewScore || 0) * 0.92),
        metrics.interviewScore || 0
      ]
    },
    {
      id: "ats",
      name: "ATS Score",
      color: "#38BDF8",
      score: metrics.atsScore || 0,
      points: [
        Math.round((metrics.atsScore || 0) * 0.4),
        Math.round((metrics.atsScore || 0) * 0.58),
        Math.round((metrics.atsScore || 0) * 0.7),
        Math.round((metrics.atsScore || 0) * 0.8),
        Math.round((metrics.atsScore || 0) * 0.88),
        Math.round((metrics.atsScore || 0) * 0.95),
        metrics.atsScore || 0
      ]
    }
  ];

  const calculatedSeries = rawModulesSeries.map((series) => {
    const coords = series.points.map((val, idx) => {
      const x = 55 + idx * ((760 - 55) / (chartDays.length - 1));
      const y = 140 - (val / 100) * 105;
      return { label: chartDays[idx], score: val, x, y };
    });

    const linePath = coords.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = coords[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
    }, "");

    return { ...series, coords, linePath };
  });

  const getTierClass = (level) => {
    if (level === "Top Candidate") return "tier-top";
    if (level === "Interview Ready") return "tier-ready";
    if (level === "Making Progress") return "tier-progress";
    if (level === "Building Foundation") return "tier-building";
    return "tier-starting";
  };

  return (
    <div className="prenova-dashboard">
      {/* 1. DASHBOARD HEADER */}
      <div className="dashboard-header-bar">
        <div className="dashboard-title-group">
          <h1>Welcome back, {user?.full_name?.split(" ")[0] || "Candidate"}! 👋</h1>
          <p>Real-time analytics aggregated across all PreNova AI preparation modules.</p>
        </div>

        <div className="dashboard-actions-group">
          {/* Streak Badge */}
          <div className="streak-pill-badge" title="Consecutive days with preparation activity">
            <FaFire style={{ color: "#EF9F27" }} />
            <span>{streak.count || 0} Day Streak</span>
          </div>

          {/* Active Today Indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.8rem",
            fontWeight: "600",
            color: streak.activeToday ? "#22C55E" : "#A7A7B5",
            background: "#1A1A24",
            padding: "0.4rem 0.75rem",
            borderRadius: "20px",
            border: "1px solid #292936"
          }}>
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: streak.activeToday ? "#22C55E" : "#707080",
              boxShadow: streak.activeToday ? "0 0 8px #22C55E" : "none"
            }} />
            {streak.activeToday ? "Active Today" : "Inactive Today"}
          </div>

          {/* Functional Sync Data Button */}
          <button 
            className="refresh-btn"
            onClick={() => fetchDashboard(true)}
            disabled={syncState === "syncing"}
          >
            <FaSync className={syncState === "syncing" ? "fa-spin" : ""} />
            {syncState === "syncing" ? "Syncing..." : syncState === "synced" ? "Updated just now" : "Sync Data"}
          </button>
        </div>
      </div>



      {/* 2. INTERVIEW READINESS INDEX */}
      <div className="readiness-card">
        <div className="readiness-main-row" style={{ marginBottom: "1.25rem" }}>
          <div className="readiness-left-block">
            <div className="readiness-score-ring">
              <span className="score-num">{readiness.score}%</span>
              <span className="score-label">Readiness</span>
            </div>

            <div className="readiness-info">
              <h2>
                Interview Readiness Index
                <span className={`readiness-tier-badge ${getTierClass(readiness.level)}`}>
                  {readiness.level}
                </span>
              </h2>
              <p>{readiness.message}</p>
            </div>
          </div>

          <div className="readiness-metrics-pills">
            <div className="growth-pill">
              <FaArrowUp /> +{readiness.weeklyImprovement}% Weekly
            </div>
            <div className="monthly-pill">
              <FaChartLine /> +{readiness.monthlyGrowth}% Monthly
            </div>
          </div>
        </div>

        {/* Multi-Colored Glowing Neon Line Graph Analytics */}
        <div className="readiness-neon-chart">
          <div className="neon-chart-header">
            <div className="neon-legend-group">
              {calculatedSeries.map((series) => (
                <span 
                  key={series.id} 
                  className="legend-pill" 
                  style={{ borderColor: series.color, color: series.color }}
                >
                  <span className="dot" style={{ background: series.color, boxShadow: `0 0 8px ${series.color}` }} />
                  {series.name} ({series.score}%)
                </span>
              ))}
            </div>

            <div className="neon-chart-stats">
              <div className="neon-stat-item">
                <span className="stat-lbl">Readiness Score</span>
                <span className="stat-val highlight">{readiness.score}%</span>
              </div>
            </div>
          </div>

          <div className="neon-svg-wrapper">
            <svg viewBox="0 0 800 170" className="neon-svg" preserveAspectRatio="none">
              <defs>
                {calculatedSeries.map((series) => (
                  <filter key={`glow-${series.id}`} id={`glow-${series.id}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="35" x2="760" y2="35" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="70" x2="760" y2="70" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="105" x2="760" y2="105" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="760" y2="140" stroke="rgba(255, 255, 255, 0.12)" />

              {/* Y-Axis Labels */}
              <text x="32" y="38" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">100%</text>
              <text x="32" y="73" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">75%</text>
              <text x="32" y="108" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">50%</text>
              <text x="32" y="143" fill="#64748B" fontSize="10" textAnchor="end" fontWeight="600">0%</text>

              {/* Multi-colored Line Paths & Node Points */}
              {calculatedSeries.map((series) => (
                <g key={series.id} className="module-series-group">
                  <path 
                    d={series.linePath} 
                    fill="none" 
                    stroke={series.color} 
                    strokeWidth="2.8" 
                    filter={`url(#glow-${series.id})`} 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    opacity="0.9"
                  />
                  {series.coords.map((pt, idx) => (
                    <circle 
                      key={idx} 
                      cx={pt.x} 
                      cy={pt.y} 
                      r="4.2" 
                      fill={series.color} 
                      stroke="#0F172A" 
                      strokeWidth="1.8" 
                      filter={`url(#glow-${series.id})`} 
                    />
                  ))}
                </g>
              ))}

              {/* X-Axis Day Labels */}
              {chartDays.map((dayLabel, idx) => {
                const x = 55 + idx * ((760 - 55) / (chartDays.length - 1));
                return (
                  <text key={idx} x={x} y="160" fill="#94A3B8" fontSize="11" fontWeight="600" textAnchor="middle">
                    {dayLabel}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="formula-tooltip-bar">
          <FaInfoCircle />
          <span>IRI Formula Component Weights:</span>
          <span className="formula-tag">ATS Scan (20%)</span>
          <span className="formula-tag">Resume (15%)</span>
          <span className="formula-tag">Coding (20%)</span>
          <span className="formula-tag">AI Interview (25%)</span>
          <span className="formula-tag">Company Prep (10%)</span>
          <span className="formula-tag">Consistency (10%)</span>
        </div>
      </div>

      {/* 3. PREPARATION OVERVIEW METRIC CARDS (5 METRICS) */}
      <div className="section-heading">
        <span>Preparation Overview & Module Metrics</span>
      </div>

      <div className="metrics-grid-6">
        {/* Box 1: AI Resume Builder */}
        <div className="metric-card-interactive" onClick={() => navigate("/resume-builder")}>
          <div className="metric-header">
            <span>AI Resume Builder</span>
            <span className="roadmap-badge IN_PROGRESS">{overview.resume?.status || "In Progress"}</span>
          </div>
          <div className="metric-val">{metrics.resumeCompletion}%</div>
          <div className="metric-sub">
            <FaCheckCircle /> {resumeProgress.sections ? Object.values(resumeProgress.sections).filter(Boolean).length : 0}/7 Sections • {metrics.resumeTimeSpent || "0m spent"}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#7F77DD", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Open Resume Builder <FaChevronRight className="card-arrow" />
          </div>
        </div>

        {/* Box 2: ATS Score */}
        <div className="metric-card-interactive" onClick={() => navigate("/ats-score")}>
          <div className="metric-header">
            <span>ATS Score</span>
            <span className="roadmap-badge IN_PROGRESS">{overview.ats?.status || "In Progress"}</span>
          </div>
          <div className="metric-val">{metrics.atsScore}%</div>
          <div className="metric-sub">
            <FaFileAlt /> Latest Scan {atsPerformance.improvement ? `(${atsPerformance.improvement >= 0 ? '+' : ''}${atsPerformance.improvement}%)` : ''} • {metrics.atsTimeSpent || "0m spent"}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#38BDF8", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Analyze Resume <FaChevronRight className="card-arrow" />
          </div>
        </div>

        {/* Box 3: Coding Practice */}
        <div className="metric-card-interactive" onClick={() => navigate("/coding-practice")}>
          <div className="metric-header">
            <span>Coding Practice</span>
            <span className="roadmap-badge IN_PROGRESS">{overview.coding?.status || "In Progress"}</span>
          </div>
          <div className="metric-val">{metrics.codingAccuracy}%</div>
          <div className="metric-sub">
            <FaCode /> {metrics.problemsSolved || 0}/{metrics.totalProblems || 120} Solved • {metrics.codingTimeSpent || "0m spent"}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#00FF88", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Practice Coding <FaChevronRight className="card-arrow" />
          </div>
        </div>

        {/* Box 4: AI Mock Interview */}
        <div className="metric-card-interactive" onClick={() => onPracticeNow ? onPracticeNow() : navigate("/dashboard?section=interview-history")}>
          <div className="metric-header">
            <span>AI Mock Interview</span>
            <span className="roadmap-badge IN_PROGRESS">{overview.interview?.status || "In Progress"}</span>
          </div>
          <div className="metric-val">{metrics.interviewScore}%</div>
          <div className="metric-sub">
            <FaMicrophone /> {interviewPerf.totalInterviews || 0} Sessions • {metrics.interviewTimeSpent || "0m spent"}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#FBBF24", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Start AI Interview <FaChevronRight className="card-arrow" />
          </div>
        </div>

        {/* Box 5: Company Preparation */}
        <div className="metric-card-interactive" onClick={() => navigate("/company-preparation")}>
          <div className="metric-header">
            <span>Company Preparation</span>
            <span className="roadmap-badge IN_PROGRESS">{overview.company?.status || "In Progress"}</span>
          </div>
          <div className="metric-val">{metrics.jobMatchFit || 0}%</div>
          <div className="metric-sub">
            <FaBriefcase /> {companyPrep.companiesExplored || 0} Target Companies • {metrics.companyTimeSpent || "0m spent"}
          </div>
          <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "#FB7185", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Prepare for Company <FaChevronRight className="card-arrow" />
          </div>
        </div>
      </div>

      {/* 4. CONTINUE PREPARATION (AI RECOMMENDATIONS) */}
      {recommendations.length > 0 && (
        <div className="ai-recommendations-section">
          <div className="section-heading">
            <span>AI Recommended Next Actions</span>
          </div>
          <div className="recommendations-grid">
            {recommendations.map((rec, idx) => (
              <div key={rec.id || idx} className="recommendation-card">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <h4>{rec.title}</h4>
                    <span className="roadmap-badge" style={{
                      background: rec.priority === "HIGH" ? "rgba(239, 68, 68, 0.2)" : "rgba(251, 191, 36, 0.2)",
                      color: rec.priority === "HIGH" ? "#EF4444" : "#FBBF24",
                      border: `1px solid ${rec.priority === "HIGH" ? "rgba(239, 68, 68, 0.4)" : "rgba(251, 191, 36, 0.4)"}`
                    }}>
                      {rec.priority || "HIGH"} PRIORITY
                    </span>
                  </div>
                  <p>{rec.description}</p>
                </div>
                <button 
                  className="cta-button-coral"
                  onClick={() => navigate(rec.targetPath || "/dashboard")}
                >
                  {rec.actionLabel || "Take Action"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CAREER PREPARATION ROADMAP */}
      <div className="roadmap-section">
        <div className="section-heading" style={{ marginBottom: "0.5rem" }}>
          <span>6-Stage Career Preparation Roadmap</span>
        </div>
        <div className="roadmap-steps-row">
          {careerRoadmap.map((stage, idx) => (
            <React.Fragment key={stage.id || idx}>
              <div className="roadmap-step-item" onClick={() => navigate(stage.path || "/dashboard")}>
                <div className={`roadmap-circle ${stage.status}`}>
                  {stage.status === "COMPLETED" ? <FaCheckCircle /> : idx + 1}
                </div>
                <span className="roadmap-title">{stage.title}</span>
                <span className={`roadmap-badge ${stage.status}`}>
                  {stage.status === "COMPLETED" ? "COMPLETED" : stage.status === "IN_PROGRESS" ? "IN PROGRESS" : "NOT STARTED"}
                </span>
              </div>
              {idx < careerRoadmap.length - 1 && (
                <div className={`roadmap-connector ${stage.status === "COMPLETED" ? "active" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>





      {/* 9. WEEKLY GOALS & CUMULATIVE USER STATISTICS (SAME ROW) */}
      <div className="bottom-dual-grid">
        {/* Goals CRUD Card */}
        <div className="goals-card">
          <div className="section-heading">
            <span>Weekly Target Goals</span>
            <button className="add-goal-btn" onClick={() => setShowGoalModal(true)}>
              <FaPlus /> Add Goal
            </button>
          </div>

          {goals.length > 0 ? (
            goals.map((g) => (
              <div key={g.id} className="goal-item-row">
                <div className="goal-item-header">
                  <span style={{ textDecoration: g.completed ? "line-through" : "none", color: g.completed ? "#707080" : "#F8F8FA" }}>
                    {g.title}
                  </span>
                  <div className="goal-actions">
                    <button 
                      className="goal-btn-icon" 
                      style={{ color: g.completed ? "#22C55E" : "#707080" }}
                      onClick={() => handleToggleGoalComplete(g)}
                      title={g.completed ? "Mark Incomplete" : "Mark Complete"}
                    >
                      <FaCheckCircle />
                    </button>
                    <button 
                      className="goal-btn-icon" 
                      onClick={() => handleDeleteGoal(g.id)}
                      title="Delete Goal"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="progress-track" style={{ height: "4px" }}>
                  <div className="progress-fill-violet" style={{ width: `${Math.min(100, ((g.current_value || 0) / (g.target_value || 1)) * 100)}%` }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#707080", marginTop: "0.3rem" }}>
                  <span>Progress: {g.current_value || 0} / {g.target_value} {g.unit}</span>
                  <span>{Math.round(((g.current_value || 0) / (g.target_value || 1)) * 100)}%</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#707080", fontSize: "0.85rem" }}>
              No weekly goals created yet. Click "Add Goal" to set a target.
            </div>
          )}
        </div>

        {/* User Preparation Statistics Bar */}
        <div className="weekly-activity-card">
          <div className="section-heading">
            <span>Cumulative User Statistics</span>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.85rem"
          }}>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>Resumes Created</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.resumes_created}</div>
            </div>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>ATS Analyses</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.ats_analyses}</div>
            </div>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>Problems Solved</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.problems_solved}</div>
            </div>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>Mock Interviews</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.mock_interviews}</div>
            </div>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>Companies Prepared</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.companies_prepared}</div>
            </div>
            <div style={{ background: "#1A1A24", border: "1px solid #292936", padding: "0.75rem", borderRadius: "8px" }}>
              <span style={{ fontSize: "0.75rem", color: "#A7A7B5" }}>Goals Completed</span>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: "#F8F8FA" }}>{statistics.goals_completed}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 10. RECENT UNIFIED ACTIVITY TIMELINE */}
      <div className="timeline-card" style={{ marginBottom: "2rem" }}>
        <div className="section-heading">
          <span>Recent Preparation Timeline</span>
          <button 
            className="add-goal-btn" 
            style={{ width: "auto", padding: "0.3rem 0.75rem" }}
            onClick={() => navigate("/dashboard?section=activity-history")}
          >
            View All Activity
          </button>
        </div>

        <div className="timeline-list">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((act, idx) => (
              <div key={act.id || idx} className="timeline-item">
                <div className="timeline-icon">
                  {act.type === "INTERVIEW_COMPLETED" ? <FaMicrophone style={{ color: "#FBBF24" }} /> : act.type === "CODING_ACCEPTED" ? <FaCode style={{ color: "#00FF88" }} /> : <FaCheckCircle style={{ color: "#7F77DD" }} />}
                </div>
                <div className="timeline-content">
                  <h5>{act.title}</h5>
                  <p>{act.description} • {act.date ? new Date(act.date).toLocaleDateString() : "Recently"}</p>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "#707080", fontSize: "0.85rem" }}>
              No preparation activity recorded yet.
            </div>
          )}
        </div>
      </div>

      {/* CREATE GOAL MODAL */}
      {showGoalModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowGoalModal(false)}>
          <div className="goal-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Weekly Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div className="goal-form-group">
                <label>Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Solve 15 Dynamic Programming Problems"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  required
                />
              </div>

              <div className="goal-form-group">
                <label>Category</label>
                <select 
                  value={goalCategory} 
                  onChange={(e) => setGoalCategory(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#1A1A24",
                    border: "1px solid #292936",
                    color: "#F8F8FA",
                    padding: "0.5rem",
                    borderRadius: "6px"
                  }}
                >
                  <option value="coding">Coding Practice</option>
                  <option value="interview">AI Mock Interview</option>
                  <option value="resume">Resume & ATS</option>
                </select>
              </div>

              <div className="goal-form-group">
                <label>Target Target Value</label>
                <input 
                  type="number" 
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="refresh-btn"
                  onClick={() => setShowGoalModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="cta-button-violet"
                  style={{ width: "auto" }}
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
