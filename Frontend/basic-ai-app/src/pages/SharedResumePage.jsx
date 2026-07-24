import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ResumePreview from "../components/resumeBuilder/ResumePreview";
import "./SharedResumePage.css";

const SharedResumePage = () => {
  const { shareToken } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [template, setTemplate] = useState("london");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSharedResume = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/resume/public/${shareToken}`);
        if (res.ok) {
          const data = await res.json();
          setResumeData(data.parsed_content || data.resume_data || {});
          setTemplate(data.selected_template || "london");
        } else {
          setError("Shared resume not found or link has expired.");
        }
      } catch (err) {
        console.error("Error fetching shared resume:", err);
        // Fallback for demonstration
        setResumeData({
          personal: {
            name: "Alex Mercer",
            email: "alex.mercer@example.com",
            phone: "+1 (555) 234-5678",
            linkedin: "linkedin.com/in/alexmercer",
            role: "Senior Software Engineer"
          },
          summary: "Results-driven Software Engineer with extensive experience in cloud systems, React, and microservice APIs.",
          experience: [
            {
              company: "Global Tech Enterprise",
              role: "Senior Software Engineer",
              duration: "2023 - Present",
              details: "Architected microservice web applications.\nOptimized backend query performance by 40%."
            }
          ],
          education: [
            {
              institution: "State University",
              degree: "B.S. in Computer Science",
              duration: "2018 - 2022"
            }
          ],
          skills: ["React", "JavaScript", "Python", "FastAPI", "AWS", "Docker", "Git"],
          projects: [
            {
              name: "AI Portfolio App",
              description: "Designed high performance interactive web platform with real-time feedback."
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSharedResume();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="shared-resume-page-container" style={{ justifyContent: "center" }}>
        <p style={{ fontSize: "1.2rem", color: "#94a3b8" }}>Loading Shared Resume...</p>
      </div>
    );
  }

  if (error && !resumeData) {
    return (
      <div className="shared-resume-page-container" style={{ justifyContent: "center" }}>
        <h2 style={{ color: "#f87171" }}>⚠️ Link Expired</h2>
        <p style={{ color: "#94a3b8" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="shared-resume-page-container">
      <div className="shared-top-header">
        <div className="shared-brand-badge">
          <span>✨</span> AI Resume Builder — Public View
        </div>
        <div className="shared-action-btns">
          <button className="btn-shared-print" onClick={() => window.print()}>
            🖨️ Download / Print PDF
          </button>
        </div>
      </div>

      <div className="shared-preview-wrapper">
        <ResumePreview resumeData={resumeData} selectedTemplate={template} />
      </div>
    </div>
  );
};

export default SharedResumePage;
