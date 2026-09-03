import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import { FaFileAlt, FaCode, FaMicrophone, FaBuilding, FaCheckCircle, FaSync, FaFilter } from "react-icons/fa";
import "./DashboardPage.css";

const API_BASE_URL = "http://localhost:8000/api";

const ActivityHistory = () => {
  const { user, token, authFetch } = useAuth();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const resp = await authFetch(`${API_BASE_URL}/activity/`);
      if (resp.ok) {
        const data = await resp.json();
        setActivities(data);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchActivities();
    }
  }, [token]);

  const getActivityIcon = (type) => {
    if (type?.includes("RESUME")) return <FaFileAlt color="#7F77DD" />;
    if (type?.includes("ATS")) return <FaCheckCircle color="#38BDF8" />;
    if (type?.includes("CODING")) return <FaCode color="#22C55E" />;
    if (type?.includes("COMPANY")) return <FaBuilding color="#EF9F27" />;
    if (type?.includes("INTERVIEW")) return <FaMicrophone color="#E85D30" />;
    return <FaSync color="#A7A7B5" />;
  };

  const filteredActivities = filterType === "all" 
    ? activities 
    : activities.filter(a => a.type?.toLowerCase().includes(filterType.toLowerCase()));

  // Group activities by Date (Today, Yesterday, Date string)
  const groupActivitiesByDate = (items) => {
    const groups = {};
    const todayStr = new Date().toDateString();
    const yesterdayStr = new Date(Date.now() - 86400000).toDateString();

    items.forEach((item) => {
      const d = item.created_at ? new Date(item.created_at) : new Date();
      const dStr = d.toDateString();
      let label = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
      if (dStr === todayStr) label = "TODAY";
      else if (dStr === yesterdayStr) label = "YESTERDAY";

      if (!groups[label]) groups[label] = [];
      groups[label].push({ ...item, formattedTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    });

    return groups;
  };

  const grouped = groupActivitiesByDate(filteredActivities);

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Complete User Activity Timeline</h1>
            <p className="topbar-subtitle">Real-time log of all preparation events across Resume, ATS, Coding, Company, & AI Interviews.</p>
          </div>
          <div className="topbar-right">
            <div 
              className="topbar-user-badge" 
              onClick={() => navigate("/profile")}
              title={`My Profile & Security (${user?.full_name || "User"})`}
            >
              <div className="topbar-avatar">{user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content" style={{ padding: "1.5rem 2rem", color: "#F8F8FA" }}>
          {/* Filter Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
              <FaFilter style={{ color: "#7F77DD", marginRight: "0.4rem" }} />
              {["all", "resume", "ats", "coding", "company", "interview"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    background: filterType === type ? "#7F77DD" : "#1A1A24",
                    color: filterType === type ? "#F8F8FA" : "#A7A7B5",
                    border: "1px solid #292936",
                    padding: "0.4rem 0.85rem",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    textTransform: "capitalize"
                  }}
                >
                  {type === "all" ? "All Activities" : type}
                </button>
              ))}
            </div>
            <button
              onClick={fetchActivities}
              style={{
                background: "#1A1A24",
                border: "1px solid #292936",
                color: "#A7A7B5",
                padding: "0.4rem 0.85rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem"
              }}
            >
              <FaSync className={loading ? "spin" : ""} /> Refresh Log
            </button>
          </div>

          {/* Timeline View */}
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#A7A7B5" }}>Loading your activity timeline...</div>
          ) : Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} style={{ marginBottom: "2rem" }}>
                <div style={{
                  fontSize: "0.85rem",
                  fontWeight: "800",
                  color: "#7F77DD",
                  letterSpacing: "1px",
                  marginBottom: "1rem",
                  borderBottom: "1px solid #292936",
                  paddingBottom: "0.4rem"
                }}>
                  {dateLabel}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {items.map((act) => (
                    <div 
                      key={act.id} 
                      style={{
                        background: "#13131A",
                        border: "1px solid #292936",
                        borderRadius: "12px",
                        padding: "1rem 1.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "#1A1A24",
                          border: "1px solid #292936",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.1rem"
                        }}>
                          {getActivityIcon(act.type)}
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "700", color: "#F8F8FA" }}>{act.title}</h4>
                          <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.85rem", color: "#A7A7B5" }}>{act.description}</p>
                        </div>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#707080", whiteSpace: "nowrap" }}>
                        {act.formattedTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              background: "#13131A",
              border: "1px dashed #292936",
              borderRadius: "16px",
              padding: "3rem",
              textAlign: "center",
              color: "#707080"
            }}>
              No preparation activities recorded yet. Complete ATS scans, coding practice, or mock interviews to populate your timeline!
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityHistory;
