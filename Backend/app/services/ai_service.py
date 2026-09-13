import json
from typing import Optional, Dict, Any
from app.ai.llm import LLMService


class AIService:
    """
    Centralized AI gateway for all AI-powered features across the Resume Builder.
    Routes requests to LLMService (Gemini / Groq) with structured prompts.
    Falls back to high-quality offline responses when AI is unavailable.
    """

    # ── Core LLM gateway (kept for backward compat) ───────────────────────────

    @staticmethod
    async def chat_generate(prompt: str, system_instruction: str = None) -> str:
        return await LLMService.generate_response(prompt, system_instruction)

    # ── Internal JSON parsing helper ──────────────────────────────────────────

    @staticmethod
    def _parse_json(response: str) -> Optional[dict]:
        try:
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end > start:
                return json.loads(response[start:end])
        except Exception:
            pass
        return None

    # ── Resume Suggestions ────────────────────────────────────────────────────

    @staticmethod
    async def generate_resume_suggestions(resume_data: dict, target_role: str = "") -> Dict[str, Any]:
        """
        Generate 3-5 AI-powered targeted improvement suggestions for a resume.
        Each suggestion includes section, reason, before text, and after text.
        """
        role = target_role or resume_data.get("personal", {}).get("role", "Software Engineer")
        resume_json = json.dumps(resume_data, indent=2)

        system_instruction = (
            "You are an expert resume coach and ATS optimization specialist. "
            "Return strictly valid JSON with no markdown."
        )
        prompt = (
            f"Target Role: {role}\n"
            f"Resume Data:\n{resume_json}\n\n"
            "Task: Generate 4 actionable resume improvement suggestions.\n"
            "Each suggestion must include:\n"
            "- section: the resume section name (e.g. 'Summary', 'Experience', 'Skills')\n"
            "- reason: why this improvement is needed (1 sentence)\n"
            "- before: the original weak text\n"
            "- after: the improved, ATS-optimized text\n"
            "Output JSON format: {\"suggestions\": [{\"section\": ..., \"reason\": ..., \"before\": ..., \"after\": ...}]}"
        )

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            parsed = AIService._parse_json(response)
            if parsed and "suggestions" in parsed:
                return parsed
        except Exception as e:
            print(f"[AIService] generate_resume_suggestions failed: {e}")

        # High-quality offline fallback
        summary = resume_data.get("summary", "Experienced professional.")
        skills = resume_data.get("skills", [])
        exp = resume_data.get("experience", [{}])
        exp_details = exp[0].get("details", "Worked on various projects.") if exp else "Worked on various projects."

        return {
            "suggestions": [
                {
                    "id": 1,
                    "section": "Summary",
                    "reason": "Summary lacks quantified impact and executive-level positioning.",
                    "before": summary[:120],
                    "after": f"Results-driven {role} with proven expertise in delivering scalable, high-performance solutions. "
                             f"Spearheaded cross-functional engineering initiatives generating 35% operational efficiency gains. "
                             f"Passionate about modern architecture and accelerating team delivery."
                },
                {
                    "id": 2,
                    "section": "Experience",
                    "reason": "Experience bullet points use passive language and lack quantified achievements.",
                    "before": exp_details[:150],
                    "after": "• Architected and deployed microservices platform serving 50k+ daily active users, "
                             "reducing API response times by 40%.\n"
                             "• Spearheaded CI/CD pipeline automation, cutting deployment cycle from 3 days to 45 minutes.\n"
                             "• Mentored a team of 4 engineers, accelerating sprint velocity by 30%."
                },
                {
                    "id": 3,
                    "section": "Skills",
                    "reason": "Skills list is missing critical ATS keywords for this role.",
                    "before": ", ".join(skills[:6]) if skills else "JavaScript, Python",
                    "after": ", ".join(skills[:6]) + ", Docker, Kubernetes, CI/CD, REST APIs, Agile/Scrum" if skills
                             else "JavaScript, TypeScript, React, Node.js, Python, Docker, Kubernetes, REST APIs, Git, CI/CD"
                },
                {
                    "id": 4,
                    "section": "Projects",
                    "reason": "Project descriptions lack tech stack details and quantified user impact.",
                    "before": "Built a web application for users.",
                    "after": f"Engineered a full-stack {role} platform (React + FastAPI + PostgreSQL) supporting "
                             "10k+ monthly active users with 99.9% uptime. Integrated real-time analytics dashboard "
                             "reducing data processing latency by 60%."
                }
            ]
        }

    # ── Cover Letter Generation ───────────────────────────────────────────────

    @staticmethod
    async def generate_cover_letter(resume_data: dict, job_description: str, target_role: str = "") -> Dict[str, Any]:
        """
        Generate a professional, personalized cover letter based on resume data and job description.
        """
        name = resume_data.get("personal", {}).get("name", "Candidate")
        role = target_role or resume_data.get("personal", {}).get("role", "Software Engineer")
        summary = resume_data.get("summary", "")
        skills = resume_data.get("skills", [])
        exp = resume_data.get("experience", [])
        exp_summary = f"{exp[0].get('role', '')} at {exp[0].get('company', '')}" if exp else role

        system_instruction = (
            "You are a professional cover letter writer. "
            "Write compelling, tailored cover letters that match the candidate's background to the job. "
            "Output must be a JSON object with field 'cover_letter' containing the full letter text."
        )
        prompt = (
            f"Candidate Name: {name}\n"
            f"Target Role: {role}\n"
            f"Candidate Summary: {summary}\n"
            f"Key Skills: {', '.join(skills[:10]) if isinstance(skills, list) else skills}\n"
            f"Most Recent Role: {exp_summary}\n"
            f"Job Description:\n{job_description[:1500]}\n\n"
            "Write a 3-paragraph professional cover letter. "
            "Paragraph 1: Compelling opening with role enthusiasm and top qualifier. "
            "Paragraph 2: Key achievements and how they map to the JD requirements. "
            "Paragraph 3: Call to action and enthusiasm for the role. "
            "Output: {\"cover_letter\": \"...full letter text...\"}"
        )

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            parsed = AIService._parse_json(response)
            if parsed and "cover_letter" in parsed:
                return parsed
        except Exception as e:
            print(f"[AIService] generate_cover_letter failed: {e}")

        # Offline fallback
        skills_str = ", ".join(skills[:6]) if isinstance(skills, list) else str(skills)
        cover_letter = (
            f"Dear Hiring Manager,\n\n"
            f"I am writing to express my enthusiastic interest in the {role} position. "
            f"With my background as a {exp_summary} and expertise in {skills_str}, "
            f"I am confident in my ability to make a meaningful contribution to your team.\n\n"
            f"Throughout my career, I have consistently delivered impactful results — from architecting "
            f"scalable systems to optimizing engineering workflows by 35%. My technical depth combined "
            f"with my collaborative mindset directly aligns with the core requirements outlined in your job description.\n\n"
            f"I would welcome the opportunity to discuss how my experience and passion align with your team's goals. "
            f"Thank you for considering my application — I look forward to speaking with you.\n\n"
            f"Best regards,\n{name}"
        )
        return {"cover_letter": cover_letter}

    # ── Interview Prep Tips ───────────────────────────────────────────────────

    @staticmethod
    async def generate_interview_prep_tips(resume_data: dict) -> Dict[str, Any]:
        """
        Generate personalized interview preparation tips based on the candidate's resume.
        Returns technical topics, behavioral questions, and likely areas of focus.
        """
        role = resume_data.get("personal", {}).get("role", "Software Engineer")
        skills = resume_data.get("skills", [])
        exp = resume_data.get("experience", [])

        system_instruction = (
            "You are an expert interview coach. Analyze the resume and generate targeted interview prep tips. "
            "Return strictly valid JSON with no markdown."
        )
        prompt = (
            f"Candidate Role: {role}\n"
            f"Skills: {', '.join(skills[:12]) if isinstance(skills, list) else skills}\n"
            f"Experience entries: {len(exp)}\n\n"
            "Generate interview preparation tips as JSON:\n"
            "{\n"
            "  \"technical_topics\": [list of 5 technical areas to review],\n"
            "  \"likely_questions\": [list of 5 likely interview questions],\n"
            "  \"behavioral_tips\": [list of 4 behavioral interview tips],\n"
            "  \"strengths_to_highlight\": [list of 3 strengths to emphasize],\n"
            "  \"prep_timeline\": \"e.g. 1 week\"\n"
            "}"
        )

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            parsed = AIService._parse_json(response)
            if parsed and "technical_topics" in parsed:
                return parsed
        except Exception as e:
            print(f"[AIService] generate_interview_prep_tips failed: {e}")

        # Offline fallback
        top_skills = skills[:5] if isinstance(skills, list) and skills else ["JavaScript", "React", "Python", "SQL", "APIs"]
        return {
            "technical_topics": [
                f"Deep-dive into {top_skills[0]} fundamentals and advanced patterns" if top_skills else "System Design",
                "System design: scalability, load balancing, caching",
                "Data structures and algorithms (arrays, trees, graphs)",
                f"Architecture patterns relevant to {role}",
                "Code optimization and performance profiling"
            ],
            "likely_questions": [
                f"Walk me through a complex {role} project you've built end-to-end.",
                "How do you handle conflicting priorities in a fast-paced team?",
                f"Describe a time you improved system performance by a significant margin.",
                f"How do you stay current with {top_skills[0] if top_skills else 'technology'} best practices?",
                "Tell me about your biggest technical failure and what you learned."
            ],
            "behavioral_tips": [
                "Use the STAR method (Situation, Task, Action, Result) for every behavioral question",
                "Prepare 3-4 specific stories that showcase leadership, problem-solving, and impact",
                "Research the company's tech stack and recent engineering blog posts",
                "Prepare thoughtful questions about the team's engineering culture and growth paths"
            ],
            "strengths_to_highlight": [
                f"Hands-on expertise in {', '.join(top_skills[:3]) if top_skills else 'software development'}",
                "Track record of delivering results with quantifiable impact",
                "Strong cross-functional communication and team collaboration skills"
            ],
            "prep_timeline": "1-2 weeks"
        }

    # ── Section-Specific Improvement ──────────────────────────────────────────

    @staticmethod
    async def improve_section(section_name: str, content: Any, target_role: str = "") -> Dict[str, Any]:
        """
        Improve a specific resume section using AI.
        Supports: summary, experience, projects, skills, education.
        """
        role = target_role or "Software Engineer"
        content_str = json.dumps(content) if not isinstance(content, str) else content

        system_instruction = (
            "You are an expert resume writer and ATS optimizer. "
            "Improve the given resume section and return valid JSON only."
        )
        prompt = (
            f"Target Role: {role}\n"
            f"Section: {section_name}\n"
            f"Current Content:\n{content_str}\n\n"
            f"Task: Improve the '{section_name}' section to be more impactful, ATS-optimized, and achievement-focused.\n"
            f"Rules:\n"
            f"1. Use strong action verbs and quantify achievements where possible.\n"
            f"2. Align language and keywords to {role} job requirements.\n"
            f"3. Keep the improved content realistic and truthful to the original.\n"
            f"Output: {{\"improved_{section_name.lower().replace(' ', '_')}\": <improved content matching input type>}}"
        )

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            parsed = AIService._parse_json(response)
            if parsed:
                return parsed
        except Exception as e:
            print(f"[AIService] improve_section failed for '{section_name}': {e}")

        # Offline fallback — return with a polish note
        return {
            f"improved_{section_name.lower().replace(' ', '_')}": content,
            "note": "AI improvement unavailable. Please configure GEMINI_API_KEY or GROQ_API_KEY."
        }
