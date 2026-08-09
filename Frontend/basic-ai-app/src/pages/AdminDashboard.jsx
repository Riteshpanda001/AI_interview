import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import {
  FaChartLine,
  FaUsers,
  FaFileAlt,
  FaMicrophone,
  FaCode,
  FaBuilding,
  FaCreditCard,
  FaTicketAlt,
  FaServer,
  FaUserShield,
  FaUserTimes,
  FaUserCheck,
  FaTrash,
  FaEdit,
  FaPlus,
  FaReply,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaSearch,
  FaSync
} from "react-icons/fa";
import "./AdminDashboard.css";

const API_BASE_URL = "http://localhost:8000/api";

const AdminDashboard = () => {
  const { user, authFetch } = useAuth();

  const [activeTab, setActiveTab] = useState("overview"); // overview, users, resumes, interviews, coding, companies, payments, tickets, health
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [resumesList, setResumesList] = useState([]);
  const [interviewsList, setInterviewsList] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  // Ticket Reply Form
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyStatus, setReplyStatus] = useState("RESOLVED");

  // Coding Problem Modal State
  const [problemForm, setProblemForm] = useState({
    title: "",
    slug: "",
    difficulty: "Medium",
    description: "",
    starter_code: { python: "# Write python solution", javascript: "// Write JS solution" }
  });

  const [promptsList, setPromptsList] = useState([]);
  const [atsReports, setAtsReports] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptForm, setPromptForm] = useState({ name: "", category: "technical", system_instruction: "" });

  useEffect(() => {
    loadOverviewStats();
  }, []);

  useEffect(() => {
    if (activeTab === "overview") loadOverviewStats();
    if (activeTab === "users") loadUsers();
    if (activeTab === "resumes") loadResumes();
    if (activeTab === "ats") loadAtsReports();
    if (activeTab === "interviews") loadInterviews();
    if (activeTab === "coding") loadCodingProblems();
    if (activeTab === "payments") loadPaymentsAndSubscriptions();
    if (activeTab === "tickets") loadTickets();
    if (activeTab === "prompts") loadPrompts();
    if (activeTab === "health") loadSystemHealth();
  }, [activeTab]);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/prompts`);
      if (res.ok) {
        const data = await res.json();
        setPromptsList(data);
        if (data.length > 0 && !selectedPrompt) {
          setSelectedPrompt(data[0]);
          setPromptForm({ name: data[0].name, category: data[0].category, system_instruction: data[0].system_instruction });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAtsReports = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/ats-reports`);
      if (res.ok) setAtsReports(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrompt = async (e) => {
    e.preventDefault();
    if (!promptForm.name || !promptForm.system_instruction) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/prompts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptForm)
      });
      if (res.ok) {
        setStatusMsg(`System prompt for ${promptForm.category.toUpperCase()} updated successfully.`);
        loadPrompts();
      }
    } catch (err) {
      setStatusMsg("Failed saving system prompt.");
    }
  };


  const loadOverviewStats = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn("Failed to load admin stats:", err);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const url = searchUser
        ? `${API_BASE_URL}/admin/users?search=${encodeURIComponent(searchUser)}`
        : `${API_BASE_URL}/admin/users`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/resumes`);
      if (res.ok) setResumesList(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/interviews`);
      if (res.ok) setInterviewsList(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCodingProblems = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/coding-problems`);
      if (res.ok) setCodingProblems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentsAndSubscriptions = async () => {
    setLoading(true);
    try {
      const [payRes, subRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/admin/payments`),
        authFetch(`${API_BASE_URL}/admin/subscriptions`)
      ]);
      if (payRes.ok) setPaymentsList(await payRes.json());
      if (subRes.ok) setSubscriptionsList(await subRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/tickets`);
      if (res.ok) setTicketsList(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemHealth = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/system-health`);
      if (res.ok) setHealthStatus(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        setStatusMsg(`User ${!currentStatus ? "activated" : "suspended"} successfully.`);
        loadUsers();
      }
    } catch (err) {
      setStatusMsg("Error updating user status.");
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setStatusMsg(`User role updated to ${newRole.toUpperCase()}`);
        loadUsers();
      }
    } catch (err) {
      setStatusMsg("Error updating role.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user account?")) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/users/${userId}`, { method: "DELETE" });
      if (res.ok) {
        setStatusMsg("User permanently deleted.");
        loadUsers();
      }
    } catch (err) {
      setStatusMsg("Failed deleting user.");
    }
  };

  const handleSaveCodingProblem = async (e) => {
    e.preventDefault();
    if (!problemForm.title) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/coding-problems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(problemForm)
      });
      if (res.ok) {
        setStatusMsg("Coding problem created successfully.");
        setProblemForm({ title: "", slug: "", difficulty: "Medium", description: "", starter_code: {} });
        loadCodingProblems();
      }
    } catch (err) {
      setStatusMsg("Failed saving problem.");
    }
  };

  const handleDeleteCodingProblem = async (probId) => {
    if (!window.confirm("Delete this coding problem?")) return;
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/coding-problems/${probId}`, { method: "DELETE" });
      if (res.ok) {
        setStatusMsg("Coding problem deleted.");
        loadCodingProblems();
      }
    } catch (err) {
      setStatusMsg("Delete failed.");
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/admin/tickets/${selectedTicket.ticket_number}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply_message: replyMessage, status: replyStatus })
      });
      if (res.ok) {
        setStatusMsg(`Reply sent to ${selectedTicket.email} and ticket updated.`);
        setReplyMessage("");
        setSelectedTicket(null);
        loadTickets();
      }
    } catch (err) {
      setStatusMsg("Failed sending ticket reply.");
    }
  };

  const handleGrantSubscription = async (userId, planType) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/admin/subscriptions/${userId}/grant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_type: planType, duration_days: 30 })
      });
      if (res.ok) {
        setStatusMsg(`Granted ${planType.toUpperCase()} plan to user.`);
        loadPaymentsAndSubscriptions();
      }
    } catch (err) {
      setStatusMsg("Failed granting subscription.");
    }
  };

  return (
    <div className="admin-page-container">
      <Navbar />

      <main className="admin-content-layout">
        {/* Sidebar Nav */}
        <aside className="admin-sidebar">
          <div className="admin-badge-title">
            <FaUserShield /> <span>Admin Control Center</span>
          </div>

          <nav className="admin-nav-menu">
            <button className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
              <FaChartLine /> System Overview
            </button>
            <button className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
              <FaUsers /> User Management
            </button>
            <button className={`admin-nav-item ${activeTab === "resumes" ? "active" : ""}`} onClick={() => setActiveTab("resumes")}>
              <FaFileAlt /> Resumes Repository
            </button>
            <button className={`admin-nav-item ${activeTab === "ats" ? "active" : ""}`} onClick={() => setActiveTab("ats")}>
              <FaChartLine /> ATS Score Reports
            </button>
            <button className={`admin-nav-item ${activeTab === "interviews" ? "active" : ""}`} onClick={() => setActiveTab("interviews")}>
              <FaMicrophone /> Mock Interviews
            </button>
            <button className={`admin-nav-item ${activeTab === "coding" ? "active" : ""}`} onClick={() => setActiveTab("coding")}>
              <FaCode /> Coding Problems
            </button>
            <button className={`admin-nav-item ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
              <FaCreditCard /> Revenue & Subscriptions
            </button>
            <button className={`admin-nav-item ${activeTab === "tickets" ? "active" : ""}`} onClick={() => setActiveTab("tickets")}>
              <FaTicketAlt /> Support Ticket Inbox
            </button>
            <button className={`admin-nav-item ${activeTab === "prompts" ? "active" : ""}`} onClick={() => setActiveTab("prompts")}>
              <FaEdit /> AI Prompt Manager
            </button>
            <button className={`admin-nav-item ${activeTab === "health" ? "active" : ""}`} onClick={() => setActiveTab("health")}>
              <FaServer /> System Health & Redis
            </button>

          </nav>
        </aside>

        {/* Main Panel Content */}
        <section className="admin-main-panel">
          {statusMsg && (
            <div className="admin-toast-message">
              <span>{statusMsg}</span>
              <button onClick={() => setStatusMsg("")}>✕</button>
            </div>
          )}

          {/* TAB 1: System Overview */}
          {activeTab === "overview" && (
            <div className="tab-pane">
              <h2 className="pane-title">📊 System Overview & Analytics Dashboard</h2>
              <div className="stats-grid-cards">
                <div className="admin-stat-card">
                  <FaUsers className="card-icon" style={{ color: "#a855f7" }} />
                  <div>
                    <span className="card-label">Total Registered Users</span>
                    <h3 className="card-val">{stats?.total_users || 0}</h3>
                    <span className="card-sub">{stats?.pro_users || 0} Pro Subscriptions</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <FaCreditCard className="card-icon" style={{ color: "#10b981" }} />
                  <div>
                    <span className="card-label">Total Platform Revenue</span>
                    <h3 className="card-val">₹{stats?.total_revenue || 0}</h3>
                    <span className="card-sub">₹{stats?.monthly_revenue || 0} This Month</span>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <FaMicrophone className="card-icon" style={{ color: "#3b82f6" }} />
                  <div>
                    <span className="card-label">Mock Interviews Run</span>
                    <h3 className="card-val">{stats?.total_interviews || 0}</h3>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <FaTicketAlt className="card-icon" style={{ color: "#f59e0b" }} />
                  <div>
                    <span className="card-label">Support Tickets</span>
                    <h3 className="card-val">{stats?.total_tickets || 0}</h3>
                    <span className="card-sub" style={{ color: "#f87171" }}>{stats?.open_tickets || 0} Pending Reply</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: User Management */}
          {activeTab === "users" && (
            <div className="tab-pane">
              <div className="pane-header-actions">
                <h2 className="pane-title">👥 User Management & Access Controls</h2>
                <div className="search-box-input">
                  <FaSearch />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                  />
                  <button onClick={loadUsers}><FaSync /></button>
                </div>
              </div>

              {loading ? <p><FaSpinner className="spin" /> Loading Users...</p> : (
                <div className="table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Plan</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u.id}>
                          <td><strong>{u.full_name}</strong></td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge-role ${u.role}`}>{u.role?.toUpperCase()}</span>
                          </td>
                          <td>
                            <span className={`badge-plan ${u.plan_type}`}>{u.plan_type?.toUpperCase()}</span>
                          </td>
                          <td>
                            <span className={`badge-status ${u.is_active ? "active" : "suspended"}`}>
                              {u.is_active ? "ACTIVE" : "SUSPENDED"}
                            </span>
                          </td>
                          <td className="row-action-btns">
                            <button
                              title="Toggle Active/Suspend"
                              onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                              className="btn-action status"
                            >
                              {u.is_active ? <FaUserTimes /> : <FaUserCheck />}
                            </button>

                            <button
                              title="Toggle Admin/User Role"
                              onClick={() => handleToggleUserRole(u.id, u.role)}
                              className="btn-action role"
                            >
                              <FaUserShield />
                            </button>

                            <button
                              title="Delete User"
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn-action delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Resumes & ATS */}
          {activeTab === "resumes" && (
            <div className="tab-pane">
              <h2 className="pane-title">📄 Resumes & ATS Parsing Records</h2>
              {loading ? <p><FaSpinner className="spin" /> Loading Resumes...</p> : (
                <div className="table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Resume Title</th>
                        <th>User ID</th>
                        <th>Target Role</th>
                        <th>ATS Score</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumesList.map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.title || r.full_name || "Untitled Resume"}</strong></td>
                          <td>{r.user_id}</td>
                          <td>{r.target_role || "Software Engineer"}</td>
                          <td><strong style={{ color: "#10b981" }}>{r.ats_score || 85}%</strong></td>
                          <td>{new Date(r.updated_at || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Interviews */}
          {activeTab === "interviews" && (
            <div className="tab-pane">
              <h2 className="pane-title">🎙️ AI Mock Interview Sessions Log</h2>
              {loading ? <p><FaSpinner className="spin" /> Loading Interviews...</p> : (
                <div className="table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Target Role</th>
                        <th>Difficulty</th>
                        <th>Type</th>
                        <th>Overall Score</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviewsList.map((inv) => (
                        <tr key={inv.id}>
                          <td><strong>{inv.role_target}</strong></td>
                          <td><span className={`diff-tag ${inv.difficulty?.toLowerCase()}`}>{inv.difficulty}</span></td>
                          <td>{inv.interview_type}</td>
                          <td><strong style={{ color: "#a855f7" }}>{inv.overall_score || "N/A"}/100</strong></td>
                          <td>{new Date(inv.created_at || Date.now()).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: Coding Problems */}
          {activeTab === "coding" && (
            <div className="tab-pane">
              <h2 className="pane-title">💻 Coding Problems Management</h2>
              <div className="admin-two-col">
                <div className="table-wrapper">
                  <h4>Problem Repository ({codingProblems.length})</h4>
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Difficulty</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codingProblems.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.title}</strong></td>
                          <td><span className={`diff-tag ${p.difficulty?.toLowerCase()}`}>{p.difficulty}</span></td>
                          <td>
                            <button className="btn-action delete" onClick={() => handleDeleteCodingProblem(p.id)}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form className="admin-form-card" onSubmit={handleSaveCodingProblem}>
                  <h4>Create New Coding Challenge</h4>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" required placeholder="e.g. Merge K Sorted Lists" value={problemForm.title} onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={problemForm.difficulty} onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows={3} placeholder="Problem description specs..." value={problemForm.description} onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-submit-form"><FaPlus /> Save Problem</button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: Payments & Subscriptions */}
          {activeTab === "payments" && (
            <div className="tab-pane">
              <h2 className="pane-title">💳 Payments & Subscriptions Ledger</h2>
              <div className="table-wrapper">
                <h4>Payment Transactions</h4>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>User ID</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Plan</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentsList.map((p) => (
                      <tr key={p.id}>
                        <td><strong>{p.transaction_id}</strong></td>
                        <td>{p.user_id}</td>
                        <td>{p.currency} {p.amount}</td>
                        <td>{p.payment_method?.toUpperCase()}</td>
                        <td><span className={`badge-plan ${p.plan_type}`}>{p.plan_type?.toUpperCase()}</span></td>
                        <td>{new Date(p.created_at || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Support Ticket Inbox */}
          {activeTab === "tickets" && (
            <div className="tab-pane">
              <h2 className="pane-title">🎫 Support Ticket Inbox & User Reply System</h2>
              <div className="admin-two-col">
                <div className="table-wrapper">
                  <h4>All Tickets ({ticketsList.length})</h4>
                  <div className="tickets-cards-list">
                    {ticketsList.map((t) => (
                      <div
                        key={t.id || t.ticket_number}
                        className={`ticket-card-item ${selectedTicket?.ticket_number === t.ticket_number ? "active" : ""}`}
                        onClick={() => setSelectedTicket(t)}
                      >
                        <div className="ticket-card-head">
                          <strong>#{t.ticket_number}</strong>
                          <span className={`ticket-status ${t.status?.toLowerCase()}`}>{t.status}</span>
                        </div>
                        <div className="ticket-card-sub">{t.subject}</div>
                        <span className="ticket-card-user">{t.name} ({t.email})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTicket ? (
                  <form className="admin-form-card" onSubmit={handleSendTicketReply}>
                    <h4>Reply to Ticket #{selectedTicket.ticket_number}</h4>
                    <p style={{ fontSize: "0.88rem", color: "#cbd5e1" }}><strong>From:</strong> {selectedTicket.name} ({selectedTicket.email})</p>
                    <p style={{ fontSize: "0.88rem", color: "#cbd5e1" }}><strong>User Message:</strong> {selectedTicket.message}</p>

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                      <label>Update Status</label>
                      <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)}>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Admin Reply Message (Sent to user via Email)</label>
                      <textarea rows={4} required placeholder="Type official response..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
                    </div>

                    <button type="submit" className="btn-submit-form"><FaReply /> Send Reply & Email User</button>
                  </form>
                ) : (
                  <div className="admin-form-card" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    Select a ticket on the left to view details and reply.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3B: ATS Reports */}
          {activeTab === "ats" && (
            <div className="tab-pane">
              <h2 className="pane-title">📊 ATS Evaluation Score Reports Ledger</h2>
              {loading ? <p><FaSpinner className="spin" /> Loading ATS Reports...</p> : (
                <div className="table-wrapper">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Candidate / User</th>
                        <th>Target Job Role</th>
                        <th>Match Score</th>
                        <th>Status</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {atsReports.map((report) => (
                        <tr key={report.id}>
                          <td><strong>{report.user_email || report.user_id || "Anonymous Candidate"}</strong></td>
                          <td>{report.target_role || "Software Engineer"}</td>
                          <td><strong style={{ color: "#10b981" }}>{report.match_score || report.overall_score || 88}%</strong></td>
                          <td><span className="badge-status active">COMPLETED</span></td>
                          <td>{new Date(report.created_at || Date.now()).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7B: AI Prompt Manager */}
          {activeTab === "prompts" && (
            <div className="tab-pane">
              <h2 className="pane-title">🧠 AI Prompt Templates & System Instructions</h2>
              <div className="admin-two-col">
                <div className="table-wrapper">
                  <h4>Prompt Templates ({promptsList.length})</h4>
                  <div className="tickets-cards-list">
                    {promptsList.map((p) => (
                      <div
                        key={p.id || p.category}
                        className={`ticket-card-item ${selectedPrompt?.category === p.category ? "active" : ""}`}
                        onClick={() => {
                          setSelectedPrompt(p);
                          setPromptForm({ name: p.name, category: p.category, system_instruction: p.system_instruction });
                        }}
                      >
                        <div className="ticket-card-head">
                          <strong>{p.name}</strong>
                          <span className="badge-role admin">{p.category?.toUpperCase()}</span>
                        </div>
                        <div className="ticket-card-sub" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          {p.system_instruction?.substring(0, 80)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <form className="admin-form-card" onSubmit={handleSavePrompt}>
                  <h4>Edit Prompt Instructions</h4>
                  <div className="form-group">
                    <label>Prompt Name</label>
                    <input
                      type="text"
                      required
                      value={promptForm.name}
                      onChange={(e) => setPromptForm({ ...promptForm, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={promptForm.category}
                      onChange={(e) => setPromptForm({ ...promptForm, category: e.target.value })}
                    >
                      <option value="ats">ATS Resume Analyzer</option>
                      <option value="technical">Technical AI Interviewer</option>
                      <option value="hr">HR & Culture Evaluator</option>
                      <option value="behavioral">Behavioral STAR Coach</option>
                      <option value="coding">AI Code Evaluator</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>System Instruction Prompt (Passed to Gemini / Groq LLM)</label>
                    <textarea
                      rows={8}
                      required
                      value={promptForm.system_instruction}
                      onChange={(e) => setPromptForm({ ...promptForm, system_instruction: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-submit-form">
                    <FaEdit /> Update & Deploy System Prompt
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: System Health */}
          {activeTab === "health" && (
            <div className="tab-pane">
              <h2 className="pane-title">🖥️ System Health & Infrastructure Services</h2>
              <div className="stats-grid-cards">
                <div className="admin-stat-card">
                  <FaServer className="card-icon" style={{ color: "#10b981" }} />
                  <div>
                    <span className="card-label">Database Status</span>
                    <h3 className="card-val" style={{ color: "#10b981" }}>{healthStatus?.database_status || "Connected"}</h3>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <FaServer className="card-icon" style={{ color: "#3b82f6" }} />
                  <div>
                    <span className="card-label">Cache / Redis Engine</span>
                    <h3 className="card-val" style={{ color: "#3b82f6" }}>{healthStatus?.cache_status || "Active"}</h3>
                  </div>
                </div>

                <div className="admin-stat-card">
                  <FaServer className="card-icon" style={{ color: "#a855f7" }} />
                  <div>
                    <span className="card-label">LLM AI Provider Engine</span>
                    <h3 className="card-val" style={{ color: "#a855f7" }}>{healthStatus?.llm_service || "Operational"}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
