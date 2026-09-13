import re
from typing import List, Dict, Any, Optional


# Common high-impact action verbs
ACTION_VERBS = [
    "architected", "spearheaded", "engineered", "optimized", "accelerated",
    "designed", "delivered", "implemented", "scaled", "led", "developed",
    "automated", "decreased", "increased", "built", "reduced", "managed",
    "created", "launched", "owned", "negotiated", "mentored", "coordinated",
    "deployed", "integrated", "refactored", "streamlined", "boosted", "generated"
]

# Tier-1 ATS keywords by role category
ROLE_KEYWORDS = {
    "software": ["react", "node.js", "python", "typescript", "rest api", "docker", "git",
                 "kubernetes", "ci/cd", "sql", "aws", "microservices", "agile", "scrum"],
    "data": ["machine learning", "python", "tensorflow", "pandas", "sql", "data pipeline",
             "tableau", "power bi", "etl", "spark", "numpy", "visualization"],
    "devops": ["docker", "kubernetes", "ci/cd", "terraform", "aws", "jenkins", "linux",
               "ansible", "prometheus", "grafana", "bash", "cloud"],
    "design": ["figma", "ux", "ui", "wireframe", "user research", "prototype", "design system",
                "accessibility", "typography", "sketch", "adobe xd"],
    "marketing": ["seo", "analytics", "campaign", "roi", "engagement", "content", "crm",
                  "brand", "digital marketing", "social media", "conversion"],
    "default": ["project management", "communication", "collaboration", "leadership",
                "problem solving", "analytical", "strategic", "stakeholder"]
}


class ScoringService:

    # ── Legacy interview scoring (kept for backward compatibility) ────────────

    @staticmethod
    def calculate_overall_rating(scores: List[int]) -> int:
        if not scores:
            return 0
        return int(sum(scores) / len(scores))

    @staticmethod
    def generate_breakdown(communication_score: int, technical_score: int, confidence_score: int) -> Dict[str, int]:
        return {
            "communication": communication_score,
            "technical": technical_score,
            "confidence": confidence_score
        }

    # ── Resume Quality Scoring ────────────────────────────────────────────────

    @staticmethod
    def score_completeness(resume_data: dict) -> Dict[str, Any]:
        """
        Checks if all required resume sections are properly filled out.
        Returns a score out of 30 with per-field feedback.
        """
        score = 0
        missing = []
        personal = resume_data.get("personal", {})

        if personal.get("name", "").strip():
            score += 5
        else:
            missing.append("Full Name")

        if personal.get("email", "").strip():
            score += 4
        else:
            missing.append("Email Address")

        if personal.get("phone", "").strip():
            score += 3
        else:
            missing.append("Phone Number")

        if personal.get("linkedin", "").strip() or personal.get("github", "").strip():
            score += 2
        else:
            missing.append("LinkedIn or GitHub URL")

        # Summary
        summary = resume_data.get("summary", "")
        if summary and len(summary) >= 60:
            score += 5
        elif summary and len(summary) > 0:
            score += 2
            missing.append("Summary is too short (aim for 60+ chars)")
        else:
            missing.append("Professional Summary")

        # Experience
        experience = resume_data.get("experience", [])
        valid_exp = [e for e in experience if isinstance(e, dict) and e.get("company") and e.get("role")]
        if len(valid_exp) >= 2:
            score += 5
        elif len(valid_exp) == 1:
            score += 3
        else:
            missing.append("Work Experience")

        # Skills
        skills = resume_data.get("skills", [])
        if isinstance(skills, list) and len(skills) >= 5:
            score += 3
        elif isinstance(skills, list) and len(skills) > 0:
            score += 1
            missing.append("Add at least 5 skills")
        else:
            missing.append("Technical Skills")

        # Education
        education = resume_data.get("education", [])
        if education and isinstance(education, list) and education[0].get("institution"):
            score += 2
        else:
            missing.append("Education")

        # Projects
        projects = resume_data.get("projects", [])
        if projects and isinstance(projects, list) and projects[0].get("name"):
            score += 1

        return {
            "score": min(30, score),
            "max": 30,
            "missing_fields": missing,
            "label": "Completeness"
        }

    @staticmethod
    def score_impact(resume_data: dict) -> Dict[str, Any]:
        """
        Checks for quantified metrics, strong action verbs, and achievement statements.
        Returns a score out of 35 with specific feedback.
        """
        score = 0
        feedback = []

        # Aggregate all text content
        text_parts = [resume_data.get("summary", "")]
        for exp in resume_data.get("experience", []):
            if isinstance(exp, dict):
                text_parts.append(exp.get("details", ""))
        for proj in resume_data.get("projects", []):
            if isinstance(proj, dict):
                text_parts.append(proj.get("description", ""))
        full_text = " ".join(text_parts).lower()

        # 1. Quantified metrics (max 15 pts)
        metrics = re.findall(
            r'\b\d+%|\$\d+[\w]*|\b\d+\+|\b\d+x\b|\b\d+k\b|\b\d+\s*(users|clients|percent|million|speed|reduction|growth|requests|teams|projects)',
            full_text
        )
        metric_count = len(metrics)
        if metric_count >= 4:
            score += 15
        elif metric_count >= 2:
            score += 10
            feedback.append("Add more quantified metrics (e.g. '35% faster', '$20k savings')")
        elif metric_count == 1:
            score += 5
            feedback.append("Quantify your achievements in at least 3 places")
        else:
            feedback.append("No quantified metrics found — add % gains, cost savings, or user counts")

        # 2. Action verbs (max 15 pts)
        found_verbs = [v for v in ACTION_VERBS if v in full_text]
        verb_count = len(found_verbs)
        if verb_count >= 7:
            score += 15
        elif verb_count >= 4:
            score += 10
            feedback.append("Use more strong action verbs (Architected, Spearheaded, Engineered)")
        elif verb_count >= 2:
            score += 6
            feedback.append("Start bullet points with strong action verbs")
        else:
            feedback.append("No strong action verbs detected — replace passive language")

        # 3. Achievement vs duty language (max 5 pts)
        achievement_markers = ["improved", "increased", "decreased", "saved", "launched", "delivered", "achieved", "exceeded", "awarded"]
        duty_markers = ["responsible for", "duties included", "tasked with", "helped", "assisted"]
        has_achievement = any(m in full_text for m in achievement_markers)
        has_duty = any(m in full_text for m in duty_markers)

        if has_achievement and not has_duty:
            score += 5
        elif has_achievement:
            score += 2
            feedback.append("Remove duty-focused language ('responsible for') and replace with achievements")
        else:
            feedback.append("Use achievement-focused language instead of duty descriptions")

        return {
            "score": min(35, score),
            "max": 35,
            "metrics_found": metric_count,
            "verbs_found": verb_count,
            "feedback": feedback,
            "label": "Impact & Achievements"
        }

    @staticmethod
    def score_keyword_density(resume_data: dict, target_role: str = "") -> Dict[str, Any]:
        """
        Checks role-relevant keyword presence against common ATS keyword lists.
        Returns a score out of 20 with matched and missing keywords.
        """
        text_parts = [
            resume_data.get("summary", ""),
            " ".join(resume_data.get("skills", []) if isinstance(resume_data.get("skills"), list) else [])
        ]
        for exp in resume_data.get("experience", []):
            if isinstance(exp, dict):
                text_parts.append(exp.get("details", ""))
        full_text = " ".join(text_parts).lower()

        # Detect role category from target_role or resume role
        role_lower = (target_role or resume_data.get("personal", {}).get("role", "")).lower()
        category = "default"
        if any(k in role_lower for k in ["software", "engineer", "developer", "frontend", "backend", "fullstack", "web"]):
            category = "software"
        elif any(k in role_lower for k in ["data", "analyst", "scientist", "ml", "ai", "machine"]):
            category = "data"
        elif any(k in role_lower for k in ["devops", "cloud", "sre", "infrastructure", "platform"]):
            category = "devops"
        elif any(k in role_lower for k in ["design", "ux", "ui", "product designer"]):
            category = "design"
        elif any(k in role_lower for k in ["marketing", "growth", "seo", "content"]):
            category = "marketing"

        keywords = ROLE_KEYWORDS.get(category, ROLE_KEYWORDS["default"])
        matched = [kw for kw in keywords if kw in full_text]
        missing = [kw for kw in keywords if kw not in full_text][:5]

        match_ratio = len(matched) / max(len(keywords), 1)
        score = min(20, int(match_ratio * 20))

        return {
            "score": score,
            "max": 20,
            "matched_keywords": matched,
            "missing_keywords": missing,
            "role_category": category,
            "label": "Keyword Density"
        }

    @staticmethod
    def score_structure(resume_data: dict) -> Dict[str, Any]:
        """
        Awards points for clean formatting signals: multiple experiences,
        education entries, projects, certifications, and links.
        Returns a score out of 15.
        """
        score = 0
        feedback = []

        exp = resume_data.get("experience", [])
        if len(exp) >= 2:
            score += 4
        elif len(exp) == 1:
            score += 2
            feedback.append("Add more work experience entries if available")

        edu = resume_data.get("education", [])
        if edu:
            score += 3

        projects = resume_data.get("projects", [])
        if len(projects) >= 2:
            score += 3
        elif len(projects) == 1:
            score += 1

        certs = resume_data.get("certifications", [])
        if certs:
            score += 2

        personal = resume_data.get("personal", {})
        has_links = personal.get("linkedin") or personal.get("github") or personal.get("portfolio")
        if has_links:
            score += 3
        else:
            feedback.append("Add LinkedIn / GitHub / Portfolio links to boost credibility")

        return {
            "score": min(15, score),
            "max": 15,
            "feedback": feedback,
            "label": "Structure & Formatting"
        }

    @staticmethod
    def get_full_resume_score(resume_data: dict, target_role: str = "") -> Dict[str, Any]:
        """
        Combines all scoring dimensions into a single comprehensive resume score.
        Returns a score out of 100 with full breakdown and actionable advice.
        """
        completeness = ScoringService.score_completeness(resume_data)
        impact = ScoringService.score_impact(resume_data)
        keywords = ScoringService.score_keyword_density(resume_data, target_role)
        structure = ScoringService.score_structure(resume_data)

        total = completeness["score"] + impact["score"] + keywords["score"] + structure["score"]
        total = min(99, max(20, total))

        # Determine grade
        if total >= 88:
            grade = "A+"
            verdict = "Excellent — Ready to impress top recruiters"
        elif total >= 78:
            grade = "A"
            verdict = "Very Good — A few tweaks and you're ready"
        elif total >= 65:
            grade = "B"
            verdict = "Good — Needs improvement in key areas"
        elif total >= 50:
            grade = "C"
            verdict = "Fair — Significant improvements recommended"
        else:
            grade = "D"
            verdict = "Needs Significant Work — Major gaps identified"

        # Collect all feedback
        all_tips = []
        all_tips.extend(completeness.get("missing_fields", []))
        all_tips.extend(impact.get("feedback", []))
        all_tips.extend(keywords.get("missing_keywords", []))
        all_tips.extend(structure.get("feedback", []))
        top_tips = list(dict.fromkeys(all_tips))[:5]

        return {
            "total_score": total,
            "grade": grade,
            "verdict": verdict,
            "breakdown": {
                "completeness": completeness,
                "impact": impact,
                "keywords": keywords,
                "structure": structure
            },
            "top_improvement_tips": top_tips
        }
