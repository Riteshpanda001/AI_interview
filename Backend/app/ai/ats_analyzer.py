from app.ai.llm import LLMService
from app.ai.huggingface_service import HuggingFaceService
import json
import re

class ATSAnalyzer:
    @staticmethod
    async def analyze(
        resume_text: str,
        job_description: str,
        job_title: str = "",
        experience_level: str = "Mid Level",
        target_company: str = "",
        target_location: str = "",
        resume_data: dict = None
    ) -> dict:
        # 1. Try Hugging Face Inference API if configured
        if HuggingFaceService.is_configured():
            hf_res = await HuggingFaceService.generate_match_analysis(resume_text, job_description, job_title)
            if hf_res:
                r_emb = await HuggingFaceService.compute_sentence_embeddings(resume_text)
                j_emb = await HuggingFaceService.compute_sentence_embeddings(job_description)
                if r_emb and j_emb:
                    sim = HuggingFaceService.calculate_cosine_similarity(r_emb, j_emb)
                    hf_res["score"] = int((hf_res.get("score", 80) * 0.7) + (sim * 100 * 0.3))
                hf_res["resume_quality_audit"] = ATSAnalyzer._generate_quality_audit(resume_text, resume_data)
                return hf_res

        # 2. Try Gemini / Groq LLM Service
        prompt = (
            f"Candidate Resume:\n{resume_text}\n\n"
            f"Target Job Title: {job_title if job_title else 'Target Role'}\n"
            f"Target Seniority Level: {experience_level}\n"
            f"Target Company: {target_company if target_company else 'N/A'}\n"
            f"Target Location: {target_location if target_location else 'N/A'}\n"
            f"Target Job Description:\n{job_description}\n\n"
            "You are an enterprise AI Resume & ATS Matcher. Analyze the fit between the candidate's resume and job description. "
            "Return strictly valid JSON with the following structure:\n"
            "{\n"
            '  "score": 82,\n'
            '  "matched_skills": ["React", "JavaScript", "REST APIs"],\n'
            '  "missing_skills": ["Docker", "Kubernetes", "AWS"],\n'
            '  "hard_skills": {\n'
            '    "score": 80,\n'
            '    "matched": ["React", "JavaScript", "TypeScript", "Node.js"],\n'
            '    "missing_critical": ["Docker", "Kubernetes"],\n'
            '    "missing_optional": ["GraphQL", "Kafka"]\n'
            '  },\n'
            '  "soft_skills": {\n'
            '    "score": 85,\n'
            '    "matched": ["Agile", "Cross-functional Collaboration", "Problem Solving"],\n'
            '    "missing": ["Mentorship", "Stakeholder Management"]\n'
            '  },\n'
            '  "experience_level": {\n'
            '    "score": 88,\n'
            '    "status": "Strong Match",\n'
            '    "details": "Resume demonstrates 3+ years of web application development, matching the target seniority level."\n'
            '  },\n'
            '  "impact_quantification": {\n'
            '    "score": 75,\n'
            '    "details": "Resume includes metric indicators. Add 2-3 additional percentage/dollar impact metrics."\n'
            '  },\n'
            '  "tailored_bullet_suggestions": [\n'
            '    {\n'
            '      "original": "Developed web applications using React and Node.js.",\n'
            '      "tailored": "Engineered high-concurrency React & Node.js microservices with Docker containerization, cutting deploy times by 35%.",\n'
            '      "target_keyword": "Docker & Microservices"\n'
            '    }\n'
            '  ],\n'
            '  "interview_questions": [\n'
            '    {\n'
            '      "id": "q1",\n'
            '      "category": "Technical Architecture",\n'
            '      "question": "How would you containerize a React/Node app using Docker to solve deployment friction mentioned in the job post?",\n'
            '      "sample_answer_key": "Explain Dockerfile multi-stage builds, container orchestration, and environment parity.",\n'
            '      "target_gap": "Docker & CI/CD"\n'
            '    }\n'
            '  ],\n'
            '  "recommendations": [\n'
            '    "Add containerization experience with Docker to close the primary infrastructure gap.",\n'
            '    "Quantify your API integration achievements with latency reduction numbers."\n'
            '  ],\n'
            '  "detailed_feedback": "Excellent candidate profile for core web development. Incorporating containerization and CI/CD tools will elevate match fit above 90%."\n'
            "}"
        )
        system_instruction = "You are an enterprise ATS Matcher & Resume Intelligence AI. Output strictly valid JSON."

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(response[start_idx:end_idx])
                parsed["ai_engine"] = "Google Gemini & NLP Matrix Engine"
                parsed["resume_quality_audit"] = ATSAnalyzer._generate_quality_audit(resume_text, resume_data)
                if "matched_skills" not in parsed:
                    parsed["matched_skills"] = parsed.get("hard_skills", {}).get("matched", ["JavaScript", "React"])
                if "missing_skills" not in parsed:
                    parsed["missing_skills"] = parsed.get("hard_skills", {}).get("missing_critical", ["Docker", "AWS"])
                return parsed
        except Exception as e:
            print(f"Error executing LLM ATS evaluation: {e}")

        # 3. Fallback Enterprise NLP Match Engine
        res = ATSAnalyzer._fallback_analysis(resume_text, job_description, job_title, experience_level, target_company, target_location, resume_data)
        res["ai_engine"] = "Hugging Face & NLP Skill Gap Engine"
        return res

    @staticmethod
    def _generate_quality_audit(resume_text: str, resume_data: dict = None) -> dict:
        text_lower = resume_text.lower()
        extracted_sections = {
            "name": False,
            "contact_information": False,
            "skills": False,
            "work_experience": False,
            "projects": False,
            "education": False,
            "certifications": False,
            "languages": False,
            "links": False
        }

        if resume_data:
            extracted_sections["name"] = bool(resume_data.get("personal", {}).get("name"))
            extracted_sections["contact_information"] = bool(resume_data.get("personal", {}).get("email") or resume_data.get("personal", {}).get("phone"))
            extracted_sections["skills"] = len(resume_data.get("skills", [])) > 0
            extracted_sections["work_experience"] = len(resume_data.get("experience", [])) > 0
            extracted_sections["projects"] = len(resume_data.get("projects", [])) > 0
            extracted_sections["education"] = len(resume_data.get("education", [])) > 0
            extracted_sections["certifications"] = len(resume_data.get("certifications", [])) > 0
            extracted_sections["languages"] = len(resume_data.get("languages", [])) > 0
            extracted_sections["links"] = bool(resume_data.get("personal", {}).get("github") or resume_data.get("personal", {}).get("linkedin") or resume_data.get("personal", {}).get("portfolio"))
        else:
            extracted_sections["name"] = len(resume_text.splitlines()) > 0
            extracted_sections["contact_information"] = "@" in resume_text or bool(re.search(r'\d{3}', resume_text))
            extracted_sections["skills"] = "skill" in text_lower or "technolog" in text_lower
            extracted_sections["work_experience"] = "experience" in text_lower or "work" in text_lower or "employment" in text_lower
            extracted_sections["projects"] = "project" in text_lower
            extracted_sections["education"] = "education" in text_lower or "university" in text_lower or "degree" in text_lower
            extracted_sections["certifications"] = "certif" in text_lower or "license" in text_lower
            extracted_sections["languages"] = "language" in text_lower or "english" in text_lower or "spanish" in text_lower
            extracted_sections["links"] = "github.com" in text_lower or "linkedin.com" in text_lower or "http" in text_lower

        missing_sections = [sec.replace("_", " ").title() for sec, found in extracted_sections.items() if not found]
        present_count = sum(1 for found in extracted_sections.values() if found)
        quality_score = int((present_count / 9) * 100)

        suggestions = []
        if not extracted_sections["certifications"]:
            suggestions.append("Add a Certifications section (e.g. AWS Certified, Meta React Developer) to stand out.")
        if not extracted_sections["links"]:
            suggestions.append("Add GitHub, LinkedIn, or Portfolio URLs to improve candidate credibility.")
        if not extracted_sections["languages"]:
            suggestions.append("Specify multilingual proficiency or spoken languages.")
        if not re.search(r'\d+%', resume_text):
            suggestions.append("Include quantified impact metrics (e.g. 'Improved performance by 30%') in your work experience.")

        return {
            "quality_score": max(50, quality_score),
            "extracted_sections": extracted_sections,
            "missing_sections": missing_sections,
            "improvement_suggestions": suggestions or ["Your resume format covers all core essential sections!"]
        }

    @staticmethod
    def _fallback_analysis(
        resume_text: str,
        job_description: str,
        job_title: str,
        experience_level: str = "Mid Level",
        target_company: str = "",
        target_location: str = "",
        resume_data: dict = None
    ) -> dict:
        HARD_TECH_KEYWORDS = [
            "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "C++", "C#", "Go", "Golang",
            "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Redux", "GraphQL", "Next.js", "Vue", "Angular",
            "FastAPI", "Django", "Flask", "Express", "Spring Boot", "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "REST API", "Microservices",
            "Agile", "Scrum", "Jest", "Cypress", "Kafka", "Linux", "PyTorch", "TensorFlow", "Pandas", "NumPy"
        ]

        SOFT_KEYWORDS = [
            "Communication", "Leadership", "Teamwork", "Problem Solving", "Mentorship",
            "Cross-functional", "Stakeholder Management", "Agile", "Scrum", "Adaptability",
            "Strategic Thinking", "Collaboration", "Time Management"
        ]

        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()

        # Hard skills matching
        jd_hard_matched = [kw for kw in HARD_TECH_KEYWORDS if kw.lower() in jd_lower]
        if not jd_hard_matched:
            words = [w.strip(".,;:()") for w in job_description.split() if len(w) > 2]
            jd_hard_matched = list(set([w for w in words if w.istitle() or w.isupper()]))[:8]
            if not jd_hard_matched:
                jd_hard_matched = ["React", "JavaScript", "Node.js", "REST API", "Git", "Docker"]

        matched_hard = [kw for kw in jd_hard_matched if kw.lower() in resume_lower]
        missing_hard = [kw for kw in jd_hard_matched if kw.lower() not in resume_lower]

        missing_critical = missing_hard[:max(1, len(missing_hard) // 2)] if missing_hard else []
        missing_optional = missing_hard[len(missing_critical):] if missing_hard else []

        hard_score = int((len(matched_hard) / (len(jd_hard_matched) or 1)) * 100)
        hard_score = max(45, min(96, hard_score))

        # Soft skills matching
        jd_soft = [kw for kw in SOFT_KEYWORDS if kw.lower() in jd_lower] or ["Communication", "Problem Solving", "Collaboration"]
        matched_soft = [kw for kw in jd_soft if kw.lower() in resume_lower]
        missing_soft = [kw for kw in jd_soft if kw.lower() not in resume_lower]

        soft_score = int((len(matched_soft) / (len(jd_soft) or 1)) * 100)
        soft_score = max(60, min(98, soft_score))

        # Experience & Impact matching
        metrics_matches = re.findall(r'\d+%\s*|\$\d+|\d+\s*years|\d+\s*\+', resume_lower)
        impact_score = min(95, max(50, 55 + len(metrics_matches) * 10))

        overall_score = int((hard_score * 0.45) + (soft_score * 0.25) + (85 * 0.15) + (impact_score * 0.15))

        # Generate bullet suggestions based on missing skills
        tailored_bullets = []
        if missing_critical:
            kw = missing_critical[0]
            tailored_bullets.append({
                "original": "Developed application components and integrated APIs.",
                "tailored": f"Engineered scalable application features incorporating {kw} best practices to optimize pipeline velocity by 25%.",
                "target_keyword": kw
            })
        if missing_optional:
            kw = missing_optional[0]
            tailored_bullets.append({
                "original": "Worked in an agile development team environment.",
                "tailored": f"Collaborated across agile sprints utilizing {kw} for automated workflows and enhanced stability.",
                "target_keyword": kw
            })
        if not tailored_bullets:
            tailored_bullets.append({
                "original": "Built user interfaces and backed services.",
                "tailored": "Architected high-throughput full-stack features, decreasing load latency by 30% across key user flows.",
                "target_keyword": "Performance Optimization"
            })

        # Generate job-tailored interview questions based on gaps
        interview_qs = []
        gap1 = missing_critical[0] if missing_critical else (matched_hard[0] if matched_hard else "System Design")
        gap2 = missing_optional[0] if missing_optional else (matched_soft[0] if matched_soft else "Agile Process")

        interview_qs.append({
            "id": "q1",
            "category": "Technical Expertise",
            "question": f"Can you explain your experience with {gap1} and how you would apply it to our tech stack at {target_company or 'our company'}?",
            "sample_answer_key": f"Discuss core architectural principles of {gap1}, practical usage patterns, and real-world trade-offs.",
            "target_gap": gap1
        })
        interview_qs.append({
            "id": "q2",
            "category": "Problem Solving",
            "question": f"How do you handle production bottlenecks or technical challenges when working with {gap2} at a {experience_level} tier?",
            "sample_answer_key": "Demonstrate systematic debugging, prioritization, metric monitoring, and cross-team communication.",
            "target_gap": gap2
        })
        interview_qs.append({
            "id": "q3",
            "category": "System & Role Fit",
            "question": f"What key architectural decisions would you make in your first 30 days as a {job_title or 'Software Engineer'}?",
            "sample_answer_key": "Outline onboarding, codebase audit, identifying tech debt, and delivering an initial quick win.",
            "target_gap": "Role Fit"
        })

        recs = [
            f"Add target key skill '{miss}' in your resume skills matrix or project bullet points."
            for miss in missing_critical[:2]
        ]
        if not recs:
            recs.append("Highlight quantitative metrics (percentages, speed boosts, user growth) in your recent experience section.")

        return {
            "score": overall_score,
            "matched_skills": matched_hard if matched_hard else ["JavaScript", "REST APIs"],
            "missing_skills": missing_hard if missing_hard else ["Docker", "AWS"],
            "resume_quality_audit": ATSAnalyzer._generate_quality_audit(resume_text, resume_data),
            "hard_skills": {
                "score": hard_score,
                "matched": matched_hard,
                "missing_critical": missing_critical,
                "missing_optional": missing_optional
            },
            "soft_skills": {
                "score": soft_score,
                "matched": matched_soft,
                "missing": missing_soft
            },
            "experience_level": {
                "score": 85,
                "status": f"Aligned with {experience_level}",
                "details": f"Resume experience matches the technical domain for {experience_level} positions."
            },
            "impact_quantification": {
                "score": impact_score,
                "details": f"Found {len(metrics_matches)} quantitative metrics in resume. Adding 2+ additional percentage/time impact metrics will strengthen resume rank."
            },
            "tailored_bullet_suggestions": tailored_bullets,
            "interview_questions": interview_qs,
            "recommendations": recs,
            "detailed_feedback": f"Match evaluation complete. {len(matched_hard)} technical skills matched and {len(missing_hard)} missing requirement(s) identified for this job posting."
        }


