import React, { useState } from "react";
import "./ATSResumeScore.css";

const KEYWORD_DICTIONARY = [
  // Languages
  "javascript", "typescript", "python", "java", "go", "golang", "c++", "ruby", "php", "swift", "rust", "sql", "html", "css", "sass", "kotlin",
  // Libraries & Frameworks
  "react", "angular", "vue", "next.js", "node.js", "express", "fastapi", "django", "spring boot", "flask", "redux", "tailwind", "bootstrap", "graphql", "pytorch", "tensorflow",
  // Cloud & Infrastructure
  "aws", "azure", "gcp", "docker", "kubernetes", "firebase", "postgresql", "mongodb", "mysql", "redis", "dynamodb", "terraform", "jenkins", "ci/cd",
  // Concepts / Methodologies
  "rest api", "agile", "scrum", "git", "github", "testing", "security", "microservices", "serverless", "machine learning", "ui/ux", "project management"
];

const CASING_MAP = {
  "javascript": "JavaScript",
  "typescript": "TypeScript",
  "python": "Python",
  "java": "Java",
  "go": "Go",
  "golang": "Go/Golang",
  "c++": "C++",
  "ruby": "Ruby",
  "php": "PHP",
  "swift": "Swift",
  "rust": "Rust",
  "sql": "SQL",
  "html": "HTML",
  "css": "CSS",
  "sass": "Sass",
  "kotlin": "Kotlin",
  "react": "React",
  "angular": "Angular",
  "vue": "Vue",
  "next.js": "Next.js",
  "node.js": "Node.js",
  "express": "Express",
  "fastapi": "FastAPI",
  "django": "Django",
  "spring boot": "Spring Boot",
  "flask": "Flask",
  "redux": "Redux",
  "tailwind": "TailwindCSS",
  "bootstrap": "Bootstrap",
  "graphql": "GraphQL",
  "pytorch": "PyTorch",
  "tensorflow": "TensorFlow",
  "aws": "AWS",
  "azure": "Azure",
  "gcp": "GCP",
  "docker": "Docker",
  "kubernetes": "Kubernetes",
  "firebase": "Firebase",
  "postgresql": "PostgreSQL",
  "mongodb": "MongoDB",
  "mysql": "MySQL",
  "redis": "Redis",
  "dynamodb": "DynamoDB",
  "terraform": "Terraform",
  "jenkins": "Jenkins",
  "ci/cd": "CI/CD",
  "rest api": "REST APIs",
  "agile": "Agile",
  "scrum": "Scrum",
  "git": "Git",
  "github": "GitHub",
  "testing": "Testing",
  "security": "Security",
  "microservices": "Microservices",
  "serverless": "Serverless",
  "machine learning": "Machine Learning",
  "ui/ux": "UI/UX",
  "project management": "Project Management"
};

const ATSResumeScore = ({ resumeData }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Convert the entire resume text into a single lowercase string for matching
  const getResumeText = () => {
    let text = "";
    if (resumeData.personal) {
      text += ` ${resumeData.personal.name || ""} ${resumeData.personal.role || ""} ${resumeData.personal.email || ""} ${resumeData.personal.linkedin || ""}`;
    }
    if (resumeData.summary) {
      text += ` ${resumeData.summary}`;
    }
    if (resumeData.skills) {
      text += ` ${resumeData.skills.join(" ")}`;
    }
    if (resumeData.experience) {
      resumeData.experience.forEach((exp) => {
        text += ` ${exp.company || ""} ${exp.role || ""} ${exp.details || ""}`;
      });
    }
    if (resumeData.projects) {
      resumeData.projects.forEach((proj) => {
        text += ` ${proj.name || ""} ${proj.description || ""}`;
      });
    }
    if (resumeData.education) {
      resumeData.education.forEach((edu) => {
        text += ` ${edu.institution || ""} ${edu.degree || ""}`;
      });
    }
    return text.toLowerCase();
  };

  // Extract keywords from the job description input, or use default rules based on candidate role
  const getRequiredKeywords = () => {
    if (!jobDescription.trim()) {
      const role = (resumeData.personal?.role || "").toLowerCase();
      if (role.includes("front") || role.includes("ui") || role.includes("web")) {
        return ["React", "JavaScript", "TypeScript", "CSS", "HTML", "Redux", "Git", "REST APIs"];
      } else if (role.includes("back") || role.includes("api") || role.includes("cloud")) {
        return ["Node.js", "Python", "FastAPI", "PostgreSQL", "Docker", "REST APIs", "GraphQL", "Redis"];
      } else if (role.includes("devops") || role.includes("infra") || role.includes("platform")) {
        return ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Git", "Jenkins"];
      } else if (role.includes("data") || role.includes("ml") || role.includes("ai") || role.includes("science")) {
        return ["Python", "PyTorch", "TensorFlow", "Pandas", "SQL", "Machine Learning", "Git"];
      }
      return ["AWS", "Docker", "Kubernetes", "CI/CD", "TypeScript", "GraphQL", "Git", "React"];
    }

    const jdLower = jobDescription.toLowerCase();
    const matched = KEYWORD_DICTIONARY.filter((kw) => {
      const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKw}\\b`, "i");
      return regex.test(jdLower);
    });

    const result = matched.map((kw) => CASING_MAP[kw] || kw);
    if (result.length === 0) {
      return ["AWS", "Docker", "Kubernetes", "CI/CD", "TypeScript", "GraphQL"];
    }
    return result;
  };

  const requiredKeywords = getRequiredKeywords();
  const resumeTextLower = getResumeText();

  // Categorize matched vs missing keywords
  const matchingKeywords = [];
  const missingKeywords = [];

  requiredKeywords.forEach((kw) => {
    const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKw}\\b`, "i");
    const isPresent = regex.test(resumeTextLower) || resumeTextLower.includes(kw.toLowerCase());

    if (isPresent) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  // Score calculation
  // 1. Keyword match score (weight: 50% of the total score)
  const keywordScore = requiredKeywords.length > 0 
    ? (matchingKeywords.length / requiredKeywords.length) * 50 
    : 50;

  // 2. Formatting / Checklist score (weight: 50% of the total score)
  let checklistScore = 0;
  const hasSummary = resumeData.summary && resumeData.summary.length > 50;
  const hasExperience = resumeData.experience && resumeData.experience.length > 0;
  const hasSkills = resumeData.skills && resumeData.skills.length >= 5;
  const hasProjects = resumeData.projects && resumeData.projects.length > 0;
  const hasContact = resumeData.personal && resumeData.personal.email && resumeData.personal.phone;

  if (hasSummary) checklistScore += 10;
  if (hasExperience) checklistScore += 15;
  if (hasSkills) checklistScore += 10;
  if (hasProjects) checklistScore += 10;
  if (hasContact) checklistScore += 5;

  const atsScore = Math.min(100, Math.round(keywordScore + checklistScore));

  const getSuggestions = () => {
    const list = [];
    if (missingKeywords.length > 0) {
      list.push(`Integrate missing keywords: "${missingKeywords.slice(0, 3).join(", ")}" into your Skills or Professional Summary.`);
    }
    if (!hasSummary) {
      list.push("Add a Professional Summary introducing your core value proposition (at least 50 characters).");
    }
    if (!hasExperience) {
      list.push("Include at least one Work Experience entry showing achievements with measurable metrics (e.g. %, $).");
    }
    if ((resumeData.skills || []).length < 5) {
      list.push("Add at least 5 key technical skills to help ATS parsers categorize your expertise.");
    }
    if (!hasProjects) {
      list.push("Add a Projects section to showcase practical applications of your skills.");
    }
    return list;
  };

  const suggestions = getSuggestions();

  return (
    <section className="ats-score-section">
      <div className="section-header">
        <span className="ats-score-badge">📊 ATS METRICS</span>
        <h2 className="section-title">
          Real-Time <span>ATS Scanner</span>
        </h2>
        <p className="section-subtitle">
          Ensure your resume passes automatic parsers. Paste a job description to dynamically analyze how your keywords align with requirements.
        </p>
      </div>

      <div className="ats-score-container">
        {/* Dynamic Inputs at the top (full-width span in grid) */}
        <div className="ats-card full-width jd-input-card">
          <h3>🎯 Target Job Profiler</h3>
          <p className="input-tip">
            Specify the role and paste the job description. The scanner will instantly extract requested core skills, tools, and methodologies and scan your resume structure.
          </p>
          <div className="jd-grid">
            <div className="jd-input-group">
              <label>Target Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="jd-input-group">
              <label>Paste Job Description / Requirements</label>
              <textarea
                rows={4}
                placeholder="Paste responsibilities, technology stack, and requirements here to run keyword optimization..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Left Side: Score Circle */}
        <div className="ats-card score-gauge-card">
          <h3>ATS Score Dial</h3>
          <div className="gauge-outer">
            <svg viewBox="0 0 100 100">
              <circle className="gauge-bg" cx="50" cy="50" r="45"></circle>
              <circle
                className="gauge-fill"
                cx="50"
                cy="50"
                r="45"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * atsScore) / 100}
                style={{
                  stroke: atsScore > 85 ? "#10b981" : atsScore > 70 ? "#7c3aed" : "#f59e0b"
                }}
              ></circle>
            </svg>
            <div className="gauge-text">
              <h2>{atsScore}%</h2>
              <span>{atsScore > 85 ? "Excellent" : atsScore > 70 ? "Good" : "Needs Work"}</span>
            </div>
          </div>
          <p className="gauge-summary">
            A score above 80% is recommended for competitive roles in Tech.
          </p>

          {/* AI ATS Optimization Tips */}
          {suggestions.length > 0 && (
            <div className="ats-suggestions-block">
              <h5>💡 Optimization Guide</h5>
              <ul>
                {suggestions.map((sug, i) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Side: Critical Missing Details */}
        <div className="ats-card keyword-feedback-card">
          <div className="feedback-block">
            <h4>Keyword Analysis</h4>
            {jobDescription.trim() ? (
              <p className="keyword-source-lbl">Extracted from job description:</p>
            ) : (
              <p className="keyword-source-lbl">Default baseline keywords for {resumeData.personal?.role || "Software Engineer"}:</p>
            )}

            {matchingKeywords.length > 0 && (
              <div className="kw-section">
                <span className="kw-status-lbl match">✓ Matching Keywords ({matchingKeywords.length})</span>
                <div className="kw-tags-grid">
                  {matchingKeywords.map((kw) => (
                    <span key={kw} className="kw-tag matching">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="kw-section kw-section-missing">
              <span className="kw-status-lbl missing">⚠️ Missing Keywords ({missingKeywords.length})</span>
              {missingKeywords.length === 0 ? (
                <p className="success-msg">✓ Excellent! All required keywords detected in your resume.</p>
              ) : (
                <div className="kw-tags-grid">
                  {missingKeywords.map((kw) => (
                    <span key={kw} className="kw-tag missing">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="feedback-block feedback-block-checklist">
            <h4>Resume Parser Checklist</h4>
            <ul className="checklist">
              <li className={hasSummary ? "checked" : ""}>
                <span className="chk-icon"></span> Professional Summary Present
              </li>
              <li className={hasExperience ? "checked" : ""}>
                <span className="chk-icon"></span> Structured Work History
              </li>
              <li className={hasSkills ? "checked" : ""}>
                <span className="chk-icon"></span> Skill Grid Optimization (5+ skills)
              </li>
              <li className={hasProjects ? "checked" : ""}>
                <span className="chk-icon"></span> Projects Section Present
              </li>
              <li className={hasContact ? "checked" : ""}>
                <span className="chk-icon"></span> Valid Contact Details (Email + Phone)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ATSResumeScore;
