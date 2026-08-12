import json
import re
from typing import Dict, Any, List
from app.ai.llm import LLMService
from app.ai.huggingface_service import HuggingFaceService

class ATSAnalyzer:
    """
    Enterprise ATS Analyzer Engine.
    Calculates a 100% deterministic score based on 7 weighted categories (Total 100%),
    and uses LLM / Hugging Face to generate qualitative explanations, recommendations,
    tailored bullet suggestions, and targeted interview questions.
    """

    @staticmethod
    def compute_deterministic_score(
        resume_text: str,
        job_description: str,
        job_title: str = "",
        experience_level: str = "Mid Level",
        resume_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        resume_lower = resume_text.lower()
        jd_lower = job_description.lower()

        # Database of industry tech keywords
        TECH_KEYWORDS = [
            "React", "JavaScript", "TypeScript", "Node.js", "Python", "Java", "C++", "C#", "Go", "Golang",
            "HTML", "CSS", "Sass", "Tailwind", "Bootstrap", "Redux", "GraphQL", "Next.js", "Vue", "Angular",
            "FastAPI", "Django", "Flask", "Express", "Spring Boot", "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis",
            "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Git", "GitHub", "REST API", "Microservices",
            "Agile", "Scrum", "Jest", "Cypress", "Kafka", "Linux", "PyTorch", "TensorFlow", "Pandas", "NumPy"
        ]

        # Extract required skills from JD
        jd_skills = [kw for kw in TECH_KEYWORDS if kw.lower() in jd_lower]
        if not jd_skills:
            words = [w.strip(".,;:()") for w in job_description.split() if len(w) > 2]
            jd_skills = list(set([w for w in words if w.istitle() or w.isupper()]))[:8]
            if not jd_skills:
                jd_skills = ["Software Engineering", "Problem Solving", "API Integration", "Database Management"]

        # 1. Skills Match (Max 25%)
        skills_in_resume = resume_data.get("skills", []) if (resume_data and isinstance(resume_data.get("skills"), list)) else []
        matched_skills = []
        for sk in jd_skills:
            if sk.lower() in resume_lower or any(sk.lower() in str(s).lower() for s in skills_in_resume):
                matched_skills.append(sk)
        missing_skills = [sk for sk in jd_skills if sk not in matched_skills]
        
        skills_ratio = len(matched_skills) / (len(jd_skills) or 1)
        skills_score = int(round(min(25, max(0, skills_ratio * 25))))

        # 2. Keyword Match (Max 20%)
        jd_words = set([w.lower().strip(".,;:()") for w in job_description.split() if len(w) > 3])
        matched_keywords = [w for w in jd_words if w in resume_lower]
        keyword_ratio = len(matched_keywords) / (len(jd_words) or 1)
        keyword_score = int(round(min(20, max(0, keyword_ratio * 20 * 1.8))))

        # 3. Experience Match (Max 15%)
        exp_score = 0
        experiences = resume_data.get("experience", []) if (resume_data and isinstance(resume_data.get("experience"), list)) else []
        exp_count = len(experiences) if experiences else len(re.findall(r'experience|worked|managed|developed', resume_lower))
        if exp_count >= 3: exp_score += 5
        elif exp_count >= 1: exp_score += 3

        ACTION_VERBS = ["architected", "spearheaded", "engineered", "optimized", "accelerated", "designed", "delivered", "implemented", "scaled", "automated", "reduced", "increased"]
        found_verbs = [v for v in ACTION_VERBS if v in resume_lower]
        if len(found_verbs) >= 4: exp_score += 5
        elif len(found_verbs) >= 1: exp_score += 3

        metrics = re.findall(r'\b\d+%\b|\$\d+|\b\d+\+\b|\b\d+x\b|\b\d+k\b', resume_lower)
        if len(metrics) >= 3: exp_score += 5
        elif len(metrics) >= 1: exp_score += 3
        exp_score = min(15, exp_score)

        # 4. Projects Match (Max 10%)
        projects = resume_data.get("projects", []) if (resume_data and isinstance(resume_data.get("projects"), list)) else []
        proj_score = 0
        if len(projects) >= 2 or "project" in resume_lower:
            proj_score += 5
            proj_text = " ".join([f"{p.get('name', '')} {p.get('description', '')}" for p in projects if isinstance(p, dict)]).lower()
            if any(sk.lower() in proj_text for sk in matched_skills):
                proj_score += 5
            else:
                proj_score += 3
        proj_score = min(10, proj_score)

        # 5. Education Match (Max 10%)
        edu_score = 0
        education = resume_data.get("education", []) if (resume_data and isinstance(resume_data.get("education"), list)) else []
        if education or "degree" in resume_lower or "university" in resume_lower or "bachelor" in resume_lower or "master" in resume_lower:
            edu_score += 6
            if "computer science" in resume_lower or "engineering" in resume_lower or "technology" in resume_lower or "b.s" in resume_lower or "m.s" in resume_lower:
                edu_score += 4
            else:
                edu_score += 2
        edu_score = min(10, edu_score)

        # 6. Resume Structure (Max 10%)
        struct_score = 0
        if resume_data:
            if resume_data.get("personal", {}).get("name") and resume_data.get("personal", {}).get("email"): struct_score += 2
            if resume_data.get("summary"): struct_score += 2
            if len(resume_data.get("skills", [])) > 0: struct_score += 2
            if len(resume_data.get("experience", [])) > 0: struct_score += 2
            if len(resume_data.get("education", [])) > 0 or len(resume_data.get("projects", [])) > 0: struct_score += 2
        else:
            if "@" in resume_text: struct_score += 3
            if "experience" in resume_lower: struct_score += 3
            if "skills" in resume_lower: struct_score += 2
            if "education" in resume_lower: struct_score += 2
        struct_score = min(10, struct_score)

        # 7. Job Relevance (Max 10%)
        relevance_score = 0
        target_role = (job_title or "Software Engineer").lower()
        if target_role in resume_lower or any(word in resume_lower for word in target_role.split() if len(word) > 3):
            relevance_score += 6
        else:
            relevance_score += 3

        if experience_level.lower() in resume_lower or "senior" in resume_lower or "mid" in resume_lower:
            relevance_score += 4
        else:
            relevance_score += 2
        relevance_score = min(10, relevance_score)

        # Total 100%
        total_score = min(99, max(25, skills_score + keyword_score + exp_score + proj_score + edu_score + struct_score + relevance_score))

        return {
            "score": total_score,
            "category_breakdown": {
                "skills_match": {"score": skills_score, "max": 25, "weight": "25%"},
                "keyword_match": {"score": keyword_score, "max": 20, "weight": "20%"},
                "experience_match": {"score": exp_score, "max": 15, "weight": "15%"},
                "projects_match": {"score": proj_score, "max": 10, "weight": "10%"},
                "education": {"score": edu_score, "max": 10, "weight": "10%"},
                "resume_structure": {"score": struct_score, "max": 10, "weight": "10%"},
                "job_relevance": {"score": relevance_score, "max": 10, "weight": "10%"}
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        }

    @staticmethod
    async def analyze(
        resume_text: str,
        job_description: str,
        job_title: str = "",
        experience_level: str = "Mid Level",
        target_company: str = "",
        target_location: str = "",
        resume_data: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        # 1. Calculate 100% Deterministic Ground Truth Score Matrix
        deterministic_res = ATSAnalyzer.compute_deterministic_score(
            resume_text=resume_text,
            job_description=job_description,
            job_title=job_title,
            experience_level=experience_level,
            resume_data=resume_data
        )

        calc_score = deterministic_res["score"]
        breakdown = deterministic_res["category_breakdown"]
        matched_skills = deterministic_res["matched_skills"]
        missing_skills = deterministic_res["missing_skills"]

        # Default structured result with deterministic score
        result = {
            "score": calc_score,
            "category_breakdown": breakdown,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "hard_skills": {
                "score": breakdown["skills_match"]["score"] * 4,
                "matched": matched_skills,
                "missing_critical": missing_skills[:3],
                "missing_optional": missing_skills[3:]
            },
            "soft_skills": {
                "score": breakdown["keyword_match"]["score"] * 5,
                "matched": ["Communication", "Problem Solving", "Collaboration"],
                "missing": ["Mentorship", "Strategic Planning"]
            },
            "experience_level": {
                "score": int((breakdown["experience_match"]["score"] / 15) * 100),
                "status": "Aligned",
                "details": f"Work history matches technical expectations for {experience_level} tier."
            },
            "impact_quantification": {
                "score": int((breakdown["experience_match"]["score"] / 15) * 100),
                "details": f"Experience evaluation highlights quantitative metrics and active verb density."
            },
            "resume_quality_audit": ATSAnalyzer._generate_quality_audit(resume_text, resume_data),
            "ai_engine": "Deterministic Matrix & Gemini Explanation Engine"
        }

        # 2. Use LLM to EXPLAIN and IMPROVE the deterministic score
        prompt = (
            f"Ground Truth Deterministic ATS Evaluation Score: {calc_score}%\n"
            f"Category Breakdown (7 Weighted Categories out of 100%):\n"
            f"- Skills Match (25%): {breakdown['skills_match']['score']}/25 (Matched: {', '.join(matched_skills[:6])}; Missing: {', '.join(missing_skills[:6])})\n"
            f"- Keyword Match (20%): {breakdown['keyword_match']['score']}/20\n"
            f"- Experience Match (15%): {breakdown['experience_match']['score']}/15\n"
            f"- Projects Match (10%): {breakdown['projects_match']['score']}/10\n"
            f"- Education (10%): {breakdown['education']['score']}/10\n"
            f"- Resume Structure (10%): {breakdown['resume_structure']['score']}/10\n"
            f"- Job Relevance (10%): {breakdown['job_relevance']['score']}/10\n\n"
            f"Target Job Title: {job_title if job_title else 'Target Role'}\n"
            f"Target Seniority: {experience_level}\n"
            f"Target Company: {target_company if target_company else 'N/A'}\n"
            f"Target Location: {target_location if target_location else 'N/A'}\n\n"
            f"Job Description:\n{job_description[:1200]}\n\n"
            f"Candidate Resume:\n{resume_text[:1500]}\n\n"
            "Task: You are an enterprise ATS Resume Explainer AI. Explain this exact calculated score and generate actionable improvements. "
            "DO NOT change the overall score. Return strictly valid JSON matching this structure:\n"
            "{\n"
            '  "detailed_feedback": "Detailed explanation of why the candidate received ' + str(calc_score) + '% overall...",\n'
            '  "tailored_bullet_suggestions": [\n'
            '    {\n'
            '      "original": "Worked on web applications.",\n'
            '      "tailored": "Engineered high-concurrency microservices incorporating ' + (missing_skills[0] if missing_skills else 'Docker') + ', reducing deploy latency by 35%.",\n'
            '      "target_keyword": "' + (missing_skills[0] if missing_skills else 'Docker') + '"\n'
            '    }\n'
            '  ],\n'
            '  "interview_questions": [\n'
            '    {\n'
            '      "id": "q1",\n'
            '      "category": "Technical Architecture",\n'
            '      "question": "How do you implement ' + (missing_skills[0] if missing_skills else 'scalable architecture') + ' in production?",\n'
            '      "sample_answer_key": "Explain trade-offs...",\n'
            '      "target_gap": "' + (missing_skills[0] if missing_skills else 'Architecture') + '"\n'
            '    }\n'
            '  ],\n'
            '  "recommendations": [\n'
            '    "Add ' + (missing_skills[0] if missing_skills else 'key skill') + ' to skills section and recent project experience.",\n'
            '    "Quantify work achievements with percentage metrics."\n'
            '  ]\n'
            "}"
        )
        system_instruction = "You are an AI ATS Explainer. Output strictly valid JSON."

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("{")
            end_idx = response.rfind("}") + 1
            if start_idx != -1 and end_idx != -1:
                parsed = json.loads(response[start_idx:end_idx])
                if "detailed_feedback" in parsed:
                    result["detailed_feedback"] = parsed["detailed_feedback"]
                if "tailored_bullet_suggestions" in parsed and isinstance(parsed["tailored_bullet_suggestions"], list):
                    result["tailored_bullet_suggestions"] = parsed["tailored_bullet_suggestions"]
                if "interview_questions" in parsed and isinstance(parsed["interview_questions"], list):
                    result["interview_questions"] = parsed["interview_questions"]
                if "recommendations" in parsed and isinstance(parsed["recommendations"], list):
                    result["recommendations"] = parsed["recommendations"]
        except Exception as e:
            print(f"Error calling LLM for ATS explanation: {e}")

        # Generate high-impact optimized professional summary
        candidate_name = (resume_data.get("personal_info", {}).get("name") if resume_data else "") or "Candidate"
        top_skills_str = ", ".join(matched_skills[:4]) if matched_skills else "modern software development & system architecture"
        target_role_str = job_title if job_title else "Software Engineer"
        
        result["optimized_summary"] = (
            f"Results-driven {target_role_str} with expertise in {top_skills_str}. "
            f"Proven track record of architecting scalable applications, optimizing system performance, and delivering robust end-to-end solutions. "
            f"Skilled in Agile collaboration, technical problem-solving, and driving high-impact software initiatives."
        )

        # Detect weak / passive words and clichés
        resume_lower = resume_text.lower()
        WEAK_WORDS = ["worked on", "responsible for", "helped with", "handled", "assisted", "did", "participated in", "tried to"]
        found_weak = [w for w in WEAK_WORDS if w in resume_lower]
        if not found_weak:
            found_weak = ["worked on", "responsible for"]

        result["weak_keywords_audit"] = {
            "weak_words_found": found_weak,
            "suggested_power_verbs": ["Architected", "Spearheaded", "Engineered", "Orchestrated", "Accelerated", "Delivered"],
            "overused_cliches": [c for c in ["team player", "hard worker", "go-getter", "self-starter"] if c in resume_lower],
            "action_verb_score": 85 if len(found_weak) <= 1 else 65
        }

        # Projects optimization (STAR Framework)
        projects_input = (resume_data.get("projects", []) if (resume_data and isinstance(resume_data.get("projects"), list)) else [])
        tailored_projects_list = []
        
        if projects_input:
            for p in projects_input[:3]:
                if isinstance(p, dict):
                    p_name = p.get("name") or p.get("title") or "Enterprise Project"
                    p_desc = p.get("description") or "Developed web platform features."
                    tailored_projects_list.append({
                        "name": p_name,
                        "original_description": p_desc,
                        "optimized_star_description": f"Architected {p_name} utilizing {', '.join(matched_skills[:2]) if matched_skills else 'scalable architecture'}. Engineered high-throughput endpoints, reduced response latency by 32%, and delivered robust fault-tolerant workflows.",
                        "highlighted_tech": matched_skills[:3]
                    })

        if not tailored_projects_list:
            tailored_projects_list = [
                {
                    "name": f"{target_role_str} Cloud Platform",
                    "original_description": "Built backend APIs and frontend dashboard features.",
                    "optimized_star_description": f"Engineered scalable cloud platform incorporating {missing_skills[0] if missing_skills else 'microservices'}, improving system query performance by 40% and expanding deployment reliability.",
                    "highlighted_tech": matched_skills[:2] + missing_skills[:1]
                }
            ]
            
        result["tailored_projects"] = tailored_projects_list

        # Fallback offline explanations if LLM call fails
        if "detailed_feedback" not in result:
            result["detailed_feedback"] = (
                f"Candidate achieved a deterministic ATS match score of {calc_score}%. "
                f"Skills match score is {breakdown['skills_match']['score']}/25, with {len(matched_skills)} matched skill(s) "
                f"and {len(missing_skills)} gap(s) identified."
            )
        if "recommendations" not in result:
            result["recommendations"] = [
                f"Incorporate target skill '{missing_skills[0]}' into work experience bullets." if missing_skills else "Quantify experience with impact metrics.",
                "Ensure project descriptions highlight modern cloud architecture."
            ]
        if "tailored_bullet_suggestions" not in result:
            result["tailored_bullet_suggestions"] = [
                {
                    "original": "Built web application components and REST APIs.",
                    "tailored": f"Architected high-performance web APIs incorporating {missing_skills[0] if missing_skills else 'Docker'}, improving response times by 35%.",
                    "target_keyword": missing_skills[0] if missing_skills else "REST APIs"
                }
            ]
        if "interview_questions" not in result:
            result["interview_questions"] = [
                {
                    "id": "q1",
                    "category": "Technical Gap",
                    "question": f"How would you approach learning and deploying {missing_skills[0] if missing_skills else 'system scaling'} in our tech stack?",
                    "sample_answer_key": "Demonstrate technical adaptability, documentation review, and hands-on proof-of-concept building.",
                    "target_gap": missing_skills[0] if missing_skills else "System Scaling"
                }
            ]

        return result

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
