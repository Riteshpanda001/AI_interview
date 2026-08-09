import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaTimes, FaPlus, FaTrash, FaEdit, FaDatabase, FaSave, FaCheckCircle, FaSpinner } from "react-icons/fa";
import "./AdminCompanyManager.css";

const API_BASE_URL = "http://localhost:8000/api";

const AdminCompanyManager = ({ isOpen, onClose, onRefreshData }) => {
  const { authFetch } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [selectedCompanySlug, setSelectedCompanySlug] = useState("");
  const [companyQuestions, setCompanyQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState("companies"); // "companies" | "questions"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    name: "",
    slug: "",
    description: "",
    industry: "Technology",
    difficulty_rating: "Hard",
    eligibility_degree: "B.E. / B.Tech / M.Tech / MCA",
    eligibility_min_cgpa: "7.0 CGPA / 65%",
    eligibility_batch: "Current & Recent Batches (0-3 yrs)",
    eligibility_backlogs: "0 Active Backlogs",
    oa_platform: "HackerRank / CodeSignal",
    oa_duration: 90,
    oa_cutoff: "85%"
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    id: null,
    company_slug: "",
    category: "dsa",
    title: "",
    difficulty: "Medium",
    instructions: "",
    code_template: "",
    solution_explanation: ""
  });

  const [editingQuestionId, setEditingQuestionId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedCompanySlug) {
      fetchCompanyQuestions(selectedCompanySlug);
    }
  }, [selectedCompanySlug]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/company/all`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
        if (data.length > 0 && !selectedCompanySlug) {
          setSelectedCompanySlug(data[0].slug);
          setQuestionForm(prev => ({ ...prev, company_slug: data[0].slug }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyQuestions = async (slug) => {
    try {
      const res = await fetch(`${API_BASE_URL}/company/${slug}/questions`);
      if (res.ok) {
        const data = await res.json();
        setCompanyQuestions(data);
      }
    } catch (err) {
      console.error("Failed to fetch questions:", err);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyForm.name) return;

    setLoading(true);
    setMessage("");

    const payload = {
      name: companyForm.name,
      slug: companyForm.slug || companyForm.name.toLowerCase().replace(/\s+/g, "-"),
      description: companyForm.description,
      industry: companyForm.industry,
      difficulty_rating: companyForm.difficulty_rating,
      eligibility: {
        degree: companyForm.eligibility_degree,
        min_cgpa: companyForm.eligibility_min_cgpa,
        batch_eligibility: companyForm.eligibility_batch,
        backlogs_allowed: companyForm.eligibility_backlogs
      },
      online_assessment_specs: {
        platform: companyForm.oa_platform,
        duration_mins: parseInt(companyForm.oa_duration) || 90,
        sections: ["Coding Challenges", "Technical CS Fundamentals"],
        cutoff_percentage: companyForm.oa_cutoff
      }
    };

    try {
      const res = await authFetch(`${API_BASE_URL}/company/admin/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage("✅ Company saved successfully!");
        fetchCompanies();
        if (onRefreshData) onRefreshData();
      } else {
        setMessage("❌ Failed to save company.");
      }
    } catch (err) {
      setMessage("❌ Error saving company: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId, companySlug) => {
    if (!window.confirm(`Are you sure you want to delete company '${companySlug}'?`)) return;

    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/company/admin/${companyId || companySlug}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setMessage("🗑️ Company deleted.");
        fetchCompanies();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMessage("❌ Delete failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionForm.title || !selectedCompanySlug) return;

    setLoading(true);
    setMessage("");

    const payload = {
      ...questionForm,
      company_slug: selectedCompanySlug
    };

    const isEdit = !!editingQuestionId;
    const url = isEdit
      ? `${API_BASE_URL}/company/admin/question/${editingQuestionId}`
      : `${API_BASE_URL}/company/admin/question`;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMessage(isEdit ? "✅ Question updated!" : "✅ Question added!");
        setQuestionForm({
          id: null,
          company_slug: selectedCompanySlug,
          category: "dsa",
          title: "",
          difficulty: "Medium",
          instructions: "",
          code_template: "",
          solution_explanation: ""
        });
        setEditingQuestionId(null);
        fetchCompanyQuestions(selectedCompanySlug);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMessage("❌ Failed saving question: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Delete this question?")) return;

    try {
      const res = await authFetch(`${API_BASE_URL}/company/admin/question/${qId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchCompanyQuestions(selectedCompanySlug);
        setMessage("🗑️ Question removed.");
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMessage("❌ Delete error: " + err.message);
    }
  };

  const handleTriggerSeed = async () => {
    if (!window.confirm("Re-seed company database with initial dataset? This will update company profiles and questions.")) return;

    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/company/admin/seed`, { method: "POST" });
      if (res.ok) {
        setMessage("🌱 Database re-seeded successfully!");
        fetchCompanies();
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      setMessage("❌ Seed error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal-container">
        <div className="admin-modal-header">
          <div className="admin-header-title">
            <FaDatabase style={{ color: "#a855f7" }} />
            <h3>Company & Question Database Admin Manager</h3>
          </div>
          <button className="admin-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {message && <div className="admin-status-banner">{message}</div>}

        <div className="admin-tabs-nav">
          <button
            className={`admin-tab-btn ${activeTab === "companies" ? "active" : ""}`}
            onClick={() => setActiveTab("companies")}
          >
            🏢 Manage Companies ({companies.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "questions" ? "active" : ""}`}
            onClick={() => setActiveTab("questions")}
          >
            ❓ Manage Questions ({companyQuestions.length})
          </button>
          <button className="admin-seed-btn" onClick={handleTriggerSeed} disabled={loading}>
            <FaDatabase /> Re-Seed Initial Data
          </button>
        </div>

        {activeTab === "companies" && (
          <div className="admin-tab-content">
            <div className="admin-two-col">
              {/* Existing Companies List */}
              <div className="admin-card-list">
                <h4>Existing DB Companies</h4>
                {loading && <p><FaSpinner className="spin" /> Loading...</p>}
                <div className="company-items-wrapper">
                  {companies.map((c) => (
                    <div key={c.id || c.slug} className={`company-item-card ${selectedCompanySlug === c.slug ? "active" : ""}`}>
                      <div>
                        <strong>{c.name}</strong>
                        <span className="slug-tag">/{c.slug}</span>
                        <div className="ind-tag">{c.industry}</div>
                      </div>
                      <div className="item-actions">
                        <button
                          className="action-btn select"
                          onClick={() => {
                            setSelectedCompanySlug(c.slug);
                            setCompanyForm({
                              name: c.name || "",
                              slug: c.slug || "",
                              description: c.description || "",
                              industry: c.industry || "Technology",
                              difficulty_rating: c.difficulty_rating || "Hard",
                              eligibility_degree: c.eligibility?.degree || "",
                              eligibility_min_cgpa: c.eligibility?.min_cgpa || "",
                              eligibility_batch: c.eligibility?.batch_eligibility || "",
                              eligibility_backlogs: c.eligibility?.backlogs_allowed || "",
                              oa_platform: c.online_assessment_specs?.platform || "",
                              oa_duration: c.online_assessment_specs?.duration_mins || 90,
                              oa_cutoff: c.online_assessment_specs?.cutoff_percentage || "85%"
                            });
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDeleteCompany(c.id, c.slug)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Company Form */}
              <form className="admin-form" onSubmit={handleSaveCompany}>
                <h4>Add / Edit Company Profile</h4>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Slug Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. netflix"
                    value={companyForm.slug}
                    onChange={(e) => setCompanyForm({ ...companyForm, slug: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Streaming / Cloud Tech"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Overview of company culture and tech bar..."
                    value={companyForm.description}
                    onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  />
                </div>

                <h5>Eligibility Specs</h5>
                <div className="form-row">
                  <div className="form-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={companyForm.eligibility_degree}
                      onChange={(e) => setCompanyForm({ ...companyForm, eligibility_degree: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Min CGPA</label>
                    <input
                      type="text"
                      value={companyForm.eligibility_min_cgpa}
                      onChange={(e) => setCompanyForm({ ...companyForm, eligibility_min_cgpa: e.target.value })}
                    />
                  </div>
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  <FaSave /> Save Company Profile
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="admin-tab-content">
            <div className="company-select-bar">
              <label>Target Company:</label>
              <select
                value={selectedCompanySlug}
                onChange={(e) => setSelectedCompanySlug(e.target.value)}
              >
                {companies.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-two-col">
              {/* Question Bank List */}
              <div className="admin-card-list">
                <h4>Questions for {selectedCompanySlug.toUpperCase()}</h4>
                <div className="questions-items-wrapper">
                  {companyQuestions.length === 0 && <p style={{ color: "#94a3b8" }}>No questions added for this company yet.</p>}
                  {companyQuestions.map((q) => (
                    <div key={q.id || q._id} className="question-item-card">
                      <div>
                        <span className={`cat-badge ${q.category}`}>{q.category?.toUpperCase()}</span>
                        <strong style={{ marginLeft: "8px" }}>{q.title}</strong>
                        <span className={`diff-badge ${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                      </div>
                      <div className="item-actions">
                        <button
                          className="action-btn select"
                          onClick={() => {
                            setEditingQuestionId(q.id || q._id);
                            setQuestionForm({
                              id: q.id || q._id,
                              company_slug: selectedCompanySlug,
                              category: q.category || "dsa",
                              title: q.title || "",
                              difficulty: q.difficulty || "Medium",
                              instructions: q.instructions || "",
                              code_template: q.code_template || "",
                              solution_explanation: q.solution_explanation || ""
                            });
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteQuestion(q.id || q._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add/Edit Question Form */}
              <form className="admin-form" onSubmit={handleSaveQuestion}>
                <h4>{editingQuestionId ? "Edit Question" : "Add New Question"}</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm({ ...questionForm, category: e.target.value })}
                    >
                      <option value="dsa">DSA (Algorithmic)</option>
                      <option value="technical">Technical / System Design</option>
                      <option value="hr">HR Round</option>
                      <option value="behavioral">Behavioral STAR</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Question Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LRU Cache Implementation"
                    value={questionForm.title}
                    onChange={(e) => setQuestionForm({ ...questionForm, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Problem Statement / Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed question specs..."
                    value={questionForm.instructions}
                    onChange={(e) => setQuestionForm({ ...questionForm, instructions: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Starter Code / Template</label>
                  <textarea
                    rows={3}
                    placeholder="Starter code snippet..."
                    value={questionForm.code_template}
                    onChange={(e) => setQuestionForm({ ...questionForm, code_template: e.target.value })}
                  />
                </div>

                <button type="submit" className="save-btn" disabled={loading}>
                  <FaSave /> {editingQuestionId ? "Update Question" : "Insert Question"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCompanyManager;
