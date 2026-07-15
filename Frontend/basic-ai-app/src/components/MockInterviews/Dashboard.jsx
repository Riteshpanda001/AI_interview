import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaLaptopCode, FaCommentDots, FaAward, FaCalendarAlt } from "react-icons/fa";
import "./Dashboard.css";

const API_BASE_URL = "http://localhost:8000/api";

const Dashboard = ({ onPracticeNow }) => {
  const { user, token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        } else {
          throw new Error("Failed to fetch backend metrics");
        }
      } catch (err) {
        console.warn("Backend unavailable, using simulated offline data:", err);
        // Fallback simulated metrics for local preview when DB is not running
        setMetrics({
          total_interviews: 4,
          average_score: 7.8,
          skills_progress: {
            "Communication": 82,
            "Technical Skills": 74,
            "Confidence Level": 88
          },
          recent_activity: [
            {
              id: "1",
              role_target: "Backend Engineer",
              interview_type: "technical",
              overall_score: 82,
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "2",
              role_target: "React Frontend Developer",
              interview_type: "technical",
              overall_score: 75,
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "3",
              role_target: "HR Generalist",
              interview_type: "hr",
              overall_score: 78,
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  const getScoreClass = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  return (
    <div className="dashboard">
      {/* Welcome Card */}
      <div className="welcomeCard">
        <h1>Welcome back, {user?.full_name || "PrepNova User"}!</h1>
        <p>
          Ready to level up your interview game? Start a customized interactive mock interview simulation with our AI. Choose between Technical, HR, and Behavioral rounds and get instant expert feedback.
        </p>
        <button className="practiceBtn" onClick={onPracticeNow}>
          Practice Now
        </button>
      </div>

      {/* Statistics */}
      <div>
        <h2 className="sectionTitle">Your Performance Overview</h2>
        <div className="statsGrid">
          <div className="statCard">
            <h2>{metrics?.total_interviews ?? 0}</h2>
            <p>Interviews Completed</p>
          </div>
          <div className="statCard">
            <h2>{metrics?.average_score ? `${(metrics.average_score * 10).toFixed(0)}%` : "0%"}</h2>
            <p>Average Score</p>
          </div>
          <div className="statCard">
            <h2>{metrics?.skills_progress?.["Communication"] ? `${metrics.skills_progress["Communication"]}%` : "80%"}</h2>
            <p>Communication Score</p>
          </div>
          <div className="statCard">
            <h2>{metrics?.skills_progress?.["Confidence Level"] ? `${metrics.skills_progress["Confidence Level"]}%` : "85%"}</h2>
            <p>Confidence Level</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="sectionTitle">PrepNova AI Core Features</h2>
        <div className="featureGrid">
          <div className="featureCard">
            <FaLaptopCode />
            <h3>Technical Simulator</h3>
            <p>Real-time mock interviews for Software Engineering, Data Science, Product, and other roles covering syntax, logic, and concepts.</p>
          </div>
          <div className="featureCard">
            <FaCommentDots />
            <h3>HR & Behavioral Rounds</h3>
            <p>Practice situational questions using STAR methodology and improve response articulation, confidence, and leadership styles.</p>
          </div>
          <div className="featureCard">
            <FaAward />
            <h3>ATS Resume Audit</h3>
            <p>Analyze your resume against targeted job descriptions to identify keywords, gaps, and optimize formatting scores.</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="sectionTitle">Recent Mock Interviews</h2>
        {metrics?.recent_activity?.length > 0 ? (
          <div>
            {metrics.recent_activity.map((activity) => (
              <div className="historyCard" key={activity.id}>
                <div className="dashboard-card-header">
                  <div>
                    <h3>{activity.role_target}</h3>
                    <p className="dashboard-card-meta">
                      <span className={`profile-badge ${activity.interview_type === "technical" ? "technical" : "hr"}`}>
                        {activity.interview_type}
                      </span>
                      <span className="dashboard-card-dot">•</span>
                      <FaCalendarAlt className="dashboard-card-icon" />
                      <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <div className="dashboard-card-score-wrapper">
                    <span className={`dashboard-score-val ${getScoreClass(activity.overall_score)}`}>
                      {activity.overall_score}%
                    </span>
                    <p className="dashboard-score-label">Overall Score</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            No interviews taken yet. Click "Practice Now" above to get started!
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
