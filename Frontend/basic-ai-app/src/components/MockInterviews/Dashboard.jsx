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
  FaInfoCircle
} from "react-icons/fa";
import "./Dashboard.css";

const API_BASE_URL = "http://localhost:8000/api";

const Dashboard = ({ onPracticeNow }) => {
  const { user, token, authFetch } = useAuth();
  const { requireAuth } = useRequireAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Goal Form State
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("10");
  const [goalCategory, setGoalCategory] = useState("coding");

  const fetchDashboard = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await authFetch(`${API_BASE_URL}/dashboard/`);
      if (response.ok) {
        const resData = await response.json();
        setData(resData);
      } else {
        throw new Error("Failed to load dashboard metrics");
      }
    } catch (err) {
      console.warn("Dashboard fetch error:", err);
      setError("Unable to connect to backend server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  if (loading) {
    return (
      <div className="prenova-dashboard">
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <div className="skeleton-box" style={{ height: "140px", width: "100%" }} />
          <div className="metrics-grid-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton-box" style={{ height: "100px" }} />
            ))}
          </div>
          <div className="skeleton-box" style={{ height: "200px", width: "100%" }} />
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
    message: "Complete more preparation activities to generate your Interview Readiness Index."
  };

  const metrics = data?.metrics || {
    atsScore: data?.ats_score || 0,
    resumeCompletion: data?.resume_completion || 0,
    jobMatchFit: data?.job_match_score || 0,
    targetRoleName: "Add Target Role",
    interviewScore: data?.interview_score || 0,
    codingAccuracy: data?.coding_score || 0,
    problemsSolved: data?.questions_correct || 0,
    totalProblems: 120,
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0
  };

  const recommendations = data?.recommendations || [];
  const careerRoadmap = data?.career_roadmap || [];
  const resumeProgress = data?.resume_progress || { completion: metrics.resumeCompletion, sections: {} };
  const atsPerformance = data?.ats_performance || { latestScore: metrics.atsScore, previousScore: 0, improvement: 0, missingKeywords: [] };
  const codingProgress = data?.coding_progress || { solved: metrics.problemsSolved, total: 120, accuracy: metrics.codingAccuracy, streak: 0, topicPerformance: {} };
  const companyPrep = data?.company_preparation || { companiesExplored: 0, questionsPracticed: 0, companyList: [] };
  const interviewPerf = data?.interview_performance || { overallScore: metrics.interviewScore, totalInterviews: data?.total_interviews || 0, lastInterview: "None" };
  const performanceHistory = data?.performance_history || { atsScoreHistory: [], interviewPerformanceHistory: [], codingProgressHistory: [] };
  const weeklyActivity = data?.weekly_activity || { days: [], totalTime: "0h 0m", mostProductiveDay: "N/A" };
  const weakAreas = data?.weak_areas || [];
  const recentActivity = data?.recent_activity || [];
  const goals = data?.goals || [];
  const achievements = data?.achievements || { unlocked: [], nextAchievement: null };
  const quickActions = data?.quick_actions || [];
  const streak = data?.streak || { count: codingProgress.streak || 0 };

  const getTierClass = (level) => {
    if (level === "Top Candidate") return "tier-top";
    if (level === "Interview Ready") return "tier-ready";
    if (level === "Making Progress") return "tier-progress";
    if (level === "Building Foundation") return "tier-building";
    return "tier-starting";
  };

  return (
    <div className="prenova-dashboard">
      {/* Top Header & Refresh Control */}
      <div className="dashboard-header-bar">
        <div className="dashboard-title-group">
          <h1>Career Preparation Dashboard</h1>
          <p>Real-time analytics aggregated across all PreNova AI preparation modules.</p>
        </div>
        <div className="dashboard-actions-group">
          <div className="streak-pill-badge">
            <FaFire /> {streak.count || 0} Day Streak
          </div>
          <button className="refresh-btn" onClick={() => fetchDashboard(true)} disabled={refreshing}>
            <FaSync className={refreshing ? "spin" : ""} /> {refreshing ? "Refreshing..." : "Sync Data"}
          </button>
        </div>
      </div>

      {/* 1. INTERVIEW READINESS INDEX */}
      <div className="readiness-card">
        <div className="readiness-main-row">
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
            <span className="growth-pill">
              <FaArrowUp /> +{readiness.weeklyImprovement}% Weekly Improvement
            </span>
            <span className="monthly-pill">
              📈 +{readiness.monthlyGrowth}% Monthly Growth
            </span>
          </div>
        </div>

        <div className="formula-tooltip-bar">
          <FaInfoCircle />
          <span>Dynamic Score Formula:</span>
          <span className="formula-tag">ATS (20%)</span>
          <span className="formula-tag">Resume (15%)</span>
          <span className="formula-tag">Coding (20%)</span>
          <span className="formula-tag">AI Interview (25%)</span>
          <span className="formula-tag">Company Prep (10%)</span>
          <span className="formula-tag">Consistency (10%)</span>
        </div>
      </div>

      {/* 2. TRACKED ACTIVITY & PERFORMANCE METRICS (6 METRIC CARDS) */}
      <div className="metrics-grid-6">
        <div className="metric-card-interactive" onClick={() => navigate("/ats-score")}>
          <div className="metric-header">
            <span>ATS Match Score</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.atsScore}%</div>
          <div className="metric-sub"><FaFileAlt /> Latest ATS Resume Scan</div>
        </div>

        <div className="metric-card-interactive" onClick={() => navigate("/resume-builder")}>
          <div className="metric-header">
            <span>Resume Completion</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.resumeCompletion}%</div>
          <div className="metric-sub"><FaCheckCircle /> {resumeProgress.sections ? Object.values(resumeProgress.sections).filter(Boolean).length : 0}/7 Core Sections</div>
        </div>

        <div className="metric-card-interactive" onClick={() => navigate("/resume-builder")}>
          <div className="metric-header">
            <span>Job Match Fit</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">
            {metrics.jobMatchFit ? `${metrics.jobMatchFit}%` : "Add Target Role"}
          </div>
          <div className="metric-sub"><FaBriefcase /> {metrics.targetRoleName || "Target Role"}</div>
        </div>

        <div className="metric-card-interactive" onClick={() => navigate("/dashboard/history")}>
          <div className="metric-header">
            <span>Interview Score</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.interviewScore}%</div>
          <div className="metric-sub"><FaMicrophone /> {interviewPerf.totalInterviews} Mock Sessions Completed</div>
        </div>

        <div className="metric-card-interactive" onClick={() => navigate("/coding-practice")}>
          <div className="metric-header">
            <span>Coding Accuracy</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.codingAccuracy}%</div>
          <div className="metric-sub"><FaCode /> Accepted Submissions</div>
        </div>

        <div className="metric-card-interactive" onClick={() => navigate("/coding-practice")}>
          <div className="metric-header">
            <span>Problems Solved</span>
            <FaChevronRight className="card-arrow" />
          </div>
          <div className="metric-val">{metrics.problemsSolved} / {metrics.totalProblems}</div>
          <div className="metric-sub">Easy: {metrics.easySolved} | Med: {metrics.mediumSolved} | Hard: {metrics.hardSolved}</div>
        </div>
      </div>

      {/* 3. AI RECOMMENDED NEXT ACTIONS */}
      {recommendations.length > 0 && (
        <div className="ai-recommendations-section">
          <div className="section-heading">
            <span>🤖 AI RECOMMENDED NEXT STEPS</span>
          </div>
          <div className="recommendations-grid">
            {recommendations.map((rec) => (
              <div key={rec.id} className="recommendation-card">
                <div>
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                </div>
                <button 
                  className="cta-button-coral" 
                  onClick={() => {
                    if (rec.targetPath === "/mock-interview" && onPracticeNow) onPracticeNow();
                    else navigate(rec.targetPath);
                  }}
                >
                  [{rec.actionLabel}]
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CAREER PREPARATION ROADMAP */}
      <div className="roadmap-section">
        <div className="section-heading">
          <span>🚀 CAREER PREPARATION ROADMAP</span>
        </div>
        <div className="roadmap-steps-row">
          {careerRoadmap.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div 
                className="roadmap-step-item" 
                onClick={() => {
                  if (stage.path === "/mock-interview" && onPracticeNow) onPracticeNow();
                  else navigate(stage.path);
                }}
              >
                <div className={`roadmap-circle ${stage.status}`}>
                  {stage.status === "COMPLETED" ? <FaCheckCircle /> : idx + 1}
                </div>
                <div className="roadmap-title">{stage.title}</div>
                <span className={`roadmap-badge ${stage.status}`}>{stage.status.replace("_", " ")}</span>
              </div>
              {idx < careerRoadmap.length - 1 && (
                <div className={`roadmap-connector ${stage.status === "COMPLETED" ? "active" : ""}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 5. DETAILED MODULES GRID */}
      <div className="modules-grid-2">
        {/* Resume Progress Module */}
        <div className="module-card">
          <div>
            <div className="module-header">
              <h3><FaFileAlt color="#7F77DD" /> RESUME PROGRESS</h3>
              <span className="module-badge">{resumeProgress.completion}%</span>
            </div>
            <div className="checklist-grid">
              <div className={`checklist-item ${resumeProgress.sections?.personal ? "done" : "warn"}`}>
                {resumeProgress.sections?.personal ? "✓" : "⚠"} Personal Info
              </div>
              <div className={`checklist-item ${resumeProgress.sections?.summary ? "done" : "warn"}`}>
                {resumeProgress.sections?.summary ? "✓" : "⚠"} Summary
              </div>
              <div className={`checklist-item ${resumeProgress.sections?.education ? "done" : "warn"}`}>
                {resumeProgress.sections?.education ? "✓" : "⚠"} Education
              </div>
              <div className={`checklist-item ${resumeProgress.sections?.skills ? "done" : "warn"}`}>
                {resumeProgress.sections?.skills ? "✓" : "⚠"} Skills
              </div>
              <div className={`checklist-item ${resumeProgress.sections?.projects ? "done" : "warn"}`}>
                {resumeProgress.sections?.projects ? "✓" : "⚠"} Projects
              </div>
              <div className={`checklist-item ${resumeProgress.sections?.experience ? "done" : "warn"}`}>
                {resumeProgress.sections?.experience ? "✓" : "⚠"} Experience
              </div>
            </div>
          </div>
          <button className="cta-button-violet" onClick={() => navigate("/resume-builder")}>
            Continue Building Resume
          </button>
        </div>

        {/* ATS Performance Module */}
        <div className="module-card">
          <div>
            <div className="module-header">
              <h3><FaChartLine color="#38BDF8" /> ATS PERFORMANCE</h3>
              <span className="module-badge" style={{ color: "#38BDF8" }}>{atsPerformance.latestScore}%</span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#A7A7B5", marginBottom: "0.75rem" }}>
              Score Delta: <strong style={{ color: "#22C55E" }}>+{atsPerformance.improvement}%</strong> since previous scan
            </div>
            {atsPerformance.missingKeywords?.length > 0 && (
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#707080", marginBottom: "0.4rem" }}>Missing Keywords:</div>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                  {atsPerformance.missingKeywords.slice(0, 4).map((kw, i) => (
                    <span key={i} style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444", fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="cta-button-violet" onClick={() => navigate("/ats-score")}>
            Improve ATS Score
          </button>
        </div>

        {/* Coding Progress Module */}
        <div className="module-card">
          <div>
            <div className="module-header">
              <h3><FaCode color="#22C55E" /> CODING PROGRESS</h3>
              <span className="module-badge" style={{ color: "#22C55E" }}>{codingProgress.solved} / {codingProgress.total}</span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              {Object.entries(codingProgress.topicPerformance || {}).slice(0, 4).map(([tName, tAcc]) => (
                <div className="topic-bar-group" key={tName}>
                  <div className="topic-bar-header">
                    <span>{tName}</span>
                    <span>{tAcc}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill-violet" style={{ width: `${tAcc}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="cta-button-violet" onClick={() => navigate("/coding-practice")}>
            Practice {codingProgress.weakestTopic || "Coding"}
          </button>
        </div>

        {/* AI Interview Performance Module */}
        <div className="module-card">
          <div>
            <div className="module-header">
              <h3><FaMicrophone color="#EF9F27" /> AI INTERVIEW PERFORMANCE</h3>
              <span className="module-badge" style={{ color: "#EF9F27" }}>{interviewPerf.overallScore}%</span>
            </div>
            <div className="checklist-grid" style={{ marginBottom: "1rem" }}>
              <div className="checklist-item">Tech: <strong>{interviewPerf.technical || interviewPerf.overallScore}%</strong></div>
              <div className="checklist-item">Comm: <strong>{interviewPerf.communication || interviewPerf.overallScore}%</strong></div>
              <div className="checklist-item">Confidence: <strong>{interviewPerf.confidence || interviewPerf.overallScore}%</strong></div>
              <div className="checklist-item">Problem Solving: <strong>{interviewPerf.problemSolving || interviewPerf.overallScore}%</strong></div>
            </div>
          </div>
          <button className="cta-button-violet" onClick={() => onPracticeNow ? onPracticeNow() : navigate("/mock-interview")}>
            Start AI Interview
          </button>
        </div>
      </div>

      {/* 6. PERFORMANCE ANALYTICS CHARTS */}
      <div className="section-heading">
        <span>📊 PERFORMANCE ANALYTICS</span>
      </div>
      <div className="charts-grid-3">
        <div className="chart-card">
          <h4>ATS Score History</h4>
          <div className="svg-chart-container">
            {performanceHistory.atsScoreHistory?.length > 0 ? (
              performanceHistory.atsScoreHistory.map((item, i) => (
                <div className="chart-bar-column" key={i}>
                  <div className="chart-bar-fill" style={{ height: `${item.score}%` }} data-val={`${item.score}%`} />
                  <span className="chart-label">{item.date}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#707080", fontSize: "0.85rem", margin: "auto" }}>No ATS scans recorded yet</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h4>AI Interview Performance</h4>
          <div className="svg-chart-container">
            {performanceHistory.interviewPerformanceHistory?.length > 0 ? (
              performanceHistory.interviewPerformanceHistory.map((item, i) => (
                <div className="chart-bar-column" key={i}>
                  <div className="chart-bar-fill" style={{ height: `${item.score}%`, background: "linear-gradient(180deg, #EF9F27 0%, #26215C 100%)" }} data-val={`${item.score}%`} />
                  <span className="chart-label">{item.interview}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#707080", fontSize: "0.85rem", margin: "auto" }}>No interviews recorded yet</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <h4>Coding Progress (Problems Solved)</h4>
          <div className="svg-chart-container">
            {performanceHistory.codingProgressHistory?.length > 0 ? (
              performanceHistory.codingProgressHistory.map((item, i) => (
                <div className="chart-bar-column" key={i}>
                  <div className="chart-bar-fill" style={{ height: `${Math.min(100, item.solved * 10)}%`, background: "linear-gradient(180deg, #22C55E 0%, #26215C 100%)" }} data-val={`${item.solved} Solved`} />
                  <span className="chart-label">{item.date}</span>
                </div>
              ))
            ) : (
              <div style={{ color: "#707080", fontSize: "0.85rem", margin: "auto" }}>No submissions recorded yet</div>
            )}
          </div>
        </div>
      </div>

      {/* 7. WEEKLY ACTIVITY & WEAK AREAS */}
      <div className="activity-weak-grid">
        <div className="weekly-activity-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
            <span>WEEKLY PREPARATION ACTIVITY</span>
          </div>
          <div className="weekly-meta-bar">
            <div className="weekly-meta-item">Total Time: <span>{weeklyActivity.totalTime}</span></div>
            <div className="weekly-meta-item">Most Productive: <span>{weeklyActivity.mostProductiveDay}</span></div>
          </div>
          <div className="svg-chart-container" style={{ height: "120px" }}>
            {weeklyActivity.days?.map((d, idx) => (
              <div className="chart-bar-column" key={idx}>
                <div className="chart-bar-fill" style={{ height: `${Math.min(100, (d.activityCount || 0) * 25 + 10)}%` }} data-val={`${d.activityCount || 0} Actions`} />
                <span className="chart-label">{d.day.substring(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="weak-areas-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            <span>⚠ AREAS TO IMPROVE</span>
          </div>
          {weakAreas.length > 0 ? (
            weakAreas.map((item) => (
              <div key={item.id} className="weak-item-card">
                <div className="weak-item-header">
                  <h5>{item.category}</h5>
                  <span className="weak-score">{item.score}</span>
                </div>
                <p>{item.recommendation}</p>
                <button className="cta-button-violet" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", width: "auto" }} onClick={() => navigate(item.targetPath)}>
                  [{item.actionLabel}]
                </button>
              </div>
            ))
          ) : (
            <div style={{ color: "#A7A7B5", fontSize: "0.85rem" }}>No critical weak areas identified yet.</div>
          )}
        </div>
      </div>

      {/* 8. RECENT ACTIVITY & WEEKLY GOALS */}
      <div className="bottom-dual-grid">
        <div className="timeline-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            <span>RECENT ACTIVITY</span>
          </div>
          {recentActivity.length > 0 ? (
            <div className="timeline-list">
              {recentActivity.slice(0, 5).map((act, i) => (
                <div className="timeline-item" key={i}>
                  <div className="timeline-icon">
                    {act.type?.includes("RESUME") ? "📄" : act.type?.includes("CODING") ? "💻" : act.type?.includes("INTERVIEW") ? "🎤" : "🏢"}
                  </div>
                  <div className="timeline-content">
                    <h5>{act.title}</h5>
                    <p>{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#707080", fontSize: "0.85rem" }}>No recent activity recorded yet.</div>
          )}
        </div>

        <div className="goals-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            <span>WEEKLY GOALS</span>
            <button className="goal-btn-icon" onClick={() => setShowGoalModal(true)}><FaPlus /> Add Goal</button>
          </div>
          {goals.map((g) => (
            <div key={g.id} className="goal-item-row">
              <div className="goal-item-header">
                <span>{g.title}</span>
                <div className="goal-actions">
                  <span>{g.current_value} / {g.target_value} {g.unit}</span>
                  <button className="goal-btn-icon" onClick={() => handleDeleteGoal(g.id)}><FaTrash /></button>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill-violet" style={{ width: `${Math.min(100, (g.current_value / g.target_value) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 9. ACHIEVEMENTS & QUICK ACTIONS */}
      <div className="achievements-quick-grid">
        <div className="achievements-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            <span>🏆 ACHIEVEMENTS</span>
          </div>
          <div className="badges-grid">
            {achievements.unlocked?.map((badge) => (
              <div key={badge.id} className={`badge-item ${badge.unlocked ? "unlocked" : ""}`}>
                <div className="badge-icon">{badge.unlocked ? "🏆" : "🔒"}</div>
                <div className="badge-name">{badge.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="quick-actions-card">
          <div className="section-heading" style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            <span>⚡ QUICK ACTIONS</span>
          </div>
          <div className="quick-buttons-grid">
            {quickActions.map((qa) => (
              <button key={qa.id} className="quick-btn" onClick={() => {
                if (qa.path === "/mock-interview" && onPracticeNow) onPracticeNow();
                else navigate(qa.path);
              }}>
                <span>{qa.icon === "document" ? "📄" : qa.icon === "target" ? "🎯" : qa.icon === "code" ? "💻" : qa.icon === "building" ? "🏢" : "🎤"}</span>
                <span>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GOAL CREATION MODAL */}
      {showGoalModal && (
        <div className="goal-modal-backdrop" onClick={() => setShowGoalModal(false)}>
          <div className="goal-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Create Weekly Goal</h3>
            <form onSubmit={handleCreateGoal}>
              <div className="goal-form-group">
                <label>Goal Title</label>
                <input type="text" placeholder="e.g. Solve 10 Coding Problems" value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} required />
              </div>
              <div className="goal-form-group">
                <label>Target Value</label>
                <input type="number" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} required />
              </div>
              <div className="goal-form-group">
                <label>Category</label>
                <select value={goalCategory} onChange={(e) => setGoalCategory(e.target.value)} style={{ width: "100%", background: "#1A1A24", border: "1px solid #292936", color: "#F8F8FA", padding: "0.5rem", borderRadius: "6px" }}>
                  <option value="coding">Coding Practice</option>
                  <option value="interview">AI Interview</option>
                  <option value="resume">Resume / ATS</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="refresh-btn" onClick={() => setShowGoalModal(false)}>Cancel</button>
                <button type="submit" className="cta-button-coral">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
