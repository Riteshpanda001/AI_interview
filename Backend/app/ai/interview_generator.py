from app.ai.llm import LLMService
import json
import uuid

ROLE_QUESTIONS_MATRIX = {
    "ai-ml engineer": {
        "technical": [
            "How do you diagnose and resolve overfitting versus underfitting in deep learning models?",
            "Explain the core architectural components of Transformers and how multi-head self-attention functions.",
            "How do you evaluate Machine Learning models in production beyond standard offline metrics like accuracy?",
            "How would you design a Retrieval-Augmented Generation (RAG) architecture for real-time document search?",
            "Explain hyperparameter tuning strategies like Bayesian Optimization versus Random Search for high-dimensional parameter spaces."
        ],
        "behavioral": [
            "Describe a situation where an ML model degraded or underperformed in production. How did you troubleshoot and resolve it?",
            "Tell me about a time you had to explain a complex model's predictions (e.g. SHAP, LIME) to non-technical stakeholders.",
            "Describe a project where you had to compromise on model accuracy to meet tight latency or memory limits.",
            "How do you handle missing, noisy, or highly imbalanced datasets when starting a new project?",
            "Tell me about a time you collaborated with software engineers to deploy an ML pipeline into CI/CD."
        ],
        "hr": [
            "Why are you passionate about building a long-term career as an AI-ML Engineer?",
            "How do you stay up to date with the latest AI research papers and emerging AI tools?",
            "Where do you see Machine Learning having the biggest impact in our industry over the next 3 to 5 years?",
            "How do you handle ambiguity when project goals or data requirements are not fully defined?",
            "What environment or team culture allows you to do your best engineering work?"
        ]
    },
    "backend developer": {
        "technical": [
            "What are the key trade-offs between REST, gRPC, and GraphQL for microservices communication?",
            "Explain database indexing mechanisms (B-Trees, Hash indexes) and how to optimize slow SQL/NoSQL queries.",
            "How do you implement distributed locking or transaction management across multiple services?",
            "Explain how caching strategies (Write-Through, Cache-Aside, Redis) improve high-throughput systems.",
            "How do you handle concurrency, race conditions, and thread safety in backend API development?"
        ],
        "behavioral": [
            "Tell me about a time a critical production API failed or experienced a bottleneck. How did you investigate and restore service?",
            "Describe a scenario where you had to refactor a legacy codebase while keeping live APIs functional.",
            "Tell me about a disagreement you had with a frontend developer or architect regarding API contracts.",
            "How do you prioritize technical debt reduction against aggressive feature delivery deadlines?",
            "Describe a project where you designed a scalable database schema for high-volume transactions."
        ],
        "hr": [
            "Why do you enjoy Backend Engineering compared to other technical specialization areas?",
            "How do you ensure code quality, documentation, and maintainability in collaborative team repositories?",
            "Where do you see yourself growing in backend engineering over the next 3 years?",
            "What motivates you to write clean, reliable server-side code?",
            "How do you handle constructive feedback during code reviews?"
        ]
    },
    "frontend developer": {
        "technical": [
            "Explain the Virtual DOM and how reconciliation/diffing algorithms work in modern frontend frameworks.",
            "How do you optimize initial page load performance, Core Web Vitals, and bundle sizes?",
            "Explain different state management patterns (Redux, Context API, Zustand) and when to use each.",
            "How do you handle asynchronous data fetching, race conditions, and optimistic UI updates?",
            "Explain CSS layout engines (Flexbox, Grid), responsive design principles, and web accessibility (a11y)."
        ],
        "behavioral": [
            "Describe a time you had to deliver a complex, pixel-perfect user interface under a tight deadline.",
            "Tell me about a situation where a frontend bug severely impacted user experience. How did you fix it?",
            "Describe how you collaborate with UI/UX designers when a design specification is technically challenging.",
            "How do you approach refactoring bloated frontend components into modular, reusable design tokens?",
            "Tell me about a time you advocated for web accessibility or performance improvements in a project."
        ],
        "hr": [
            "What drew you to Frontend Development and crafting user-facing digital experiences?",
            "How do you keep pace with the rapidly evolving frontend ecosystem and modern tools?",
            "Describe your ideal collaboration process between frontend developers, designers, and backend engineers.",
            "How do you balance aesthetic perfection with fast technical execution?",
            "What kind of team culture helps you thrive as a Frontend Developer?"
        ]
    },
    "fullstack developer": {
        "technical": [
            "How do you design end-to-end architecture connecting a modern SPA frontend with scalable microservices?",
            "Explain authentication and authorization strategies (JWT, OAuth2, Session cookies) across full-stack applications.",
            "How do you maintain data consistency between client state and database storage in real-time web apps?",
            "Explain your strategy for building and deploying full-stack Docker containers to cloud providers.",
            "How do you structure API schemas (GraphQL/OpenAPI) to ensure seamless integration between frontend and backend."
        ],
        "behavioral": [
            "Describe a project where you built a complete feature end-to-end from database schema to UI components.",
            "Tell me about a time you had to debug a issue spanning both the frontend client and backend server.",
            "How do you manage your time when context-switching between frontend styling and backend logic?",
            "Tell me about a technical decision you made that significantly sped up development for your team.",
            "Describe how you handled a situation where backend API specifications changed midway through frontend work."
        ],
        "hr": [
            "Why do you prefer working across the full stack rather than specializing solely in frontend or backend?",
            "How do you prioritize learning new technologies across both server-side and client-side domains?",
            "Where do you see yourself advancing your full-stack engineering skills over the next 3 to 5 years?",
            "What makes a collaborative full-stack team successful in your experience?",
            "How do you handle high-pressure release deadlines when building end-to-end features?"
        ]
    },
    "data scientist": {
        "technical": [
            "Explain the mathematical intuition behind feature selection and dimensionality reduction (PCA, t-SNE).",
            "How do you formulate statistical hypothesis testing (A/B testing, p-values, confidence intervals) for product decisions?",
            "What are the differences between gradient boosting algorithms (XGBoost, LightGBM, CatBoost)?",
            "How do you clean and validate raw telemetry data to avoid data leakage during training?",
            "Explain how you measure feature importance and model interpretability in complex ensemble models."
        ],
        "behavioral": [
            "Describe a business problem where your data analysis led to a strategic pivot or major revenue impact.",
            "Tell me about a time when your exploratory data analysis contradicted a stakeholder's initial hypothesis.",
            "Describe how you handle incomplete, corrupted, or highly noisy datasets in critical projects.",
            "Tell me about a data science project that failed to deliver the expected result. What did you learn?",
            "How do you communicate complex statistical findings to non-technical business leaders?"
        ],
        "hr": [
            "What inspired you to pursue Data Science as a career?",
            "How do you balance rigorous scientific exploration with business demand for quick insights?",
            "Where do you see the field of Data Science heading with the rise of Generative AI?",
            "Describe your approach to continuous learning in data engineering, statistics, and machine learning.",
            "What type of organizational data culture empowers your best analytics work?"
        ]
    },
    "product manager": {
        "technical": [
            "How do you define key performance metrics (North Star, DAU/MAU, Retention, CAC, LTV) for a digital product?",
            "How do you prioritize your product roadmap when balancing technical tech debt, bug fixes, and new features?",
            "Explain your framework for conducting customer discovery interviews and translating pain points into spec requirements.",
            "How do you partner with engineering teams to scope complex technical requirements without micromanaging?",
            "Explain your strategy for launching an MVP and iterating based on quantitative and qualitative user data."
        ],
        "behavioral": [
            "Describe a time when a product launch missed its target metrics. How did you analyze the failure and pivot?",
            "Tell me about a conflict between engineering priorities and executive business demands. How did you align them?",
            "Describe how you managed a feature launch with tight cross-functional dependencies across engineering, design, and marketing.",
            "Tell me about a time you had to say 'no' to an important stakeholder or customer feature request.",
            "Describe a situation where user feedback drastically changed your product roadmap."
        ],
        "hr": [
            "Why are you passionate about Product Management and driving user-centric products?",
            "How do you foster trust and strong collaboration within cross-functional product squads?",
            "Where do you see yourself in 3 to 5 years in product leadership?",
            "How do you stay motivated when managing competing priorities and high ambiguity?",
            "What makes our company's product line and mission exciting to you?"
        ]
    },
    "devops engineer": {
        "technical": [
            "Explain Infrastructure as Code (IaC) principles using Terraform or CloudFormation, and how to manage state drift.",
            "How do you design high-availability Kubernetes cluster deployments, ingress routing, and pod autoscaling (HPA)?",
            "What strategies do you use for zero-downtime deployments (Blue-Green, Canary, Rolling updates)?",
            "How do you implement centralized logging and observability (Prometheus, Grafana, ELK stack) across distributed environments?",
            "Explain container security best practices, image scanning, and secrets management in CI/CD pipelines."
        ],
        "behavioral": [
            "Describe a major infrastructure outage or security incident you responded to. How did you resolve and prevent it?",
            "Tell me about a time you automated a manual, error-prone deployment process, saving significant developer hours.",
            "Describe how you handled resistance from developers when enforcing strict security or CI/CD pipeline policies.",
            "Tell me about a project where you optimized cloud infrastructure costs (AWS/GCP/Azure) significantly.",
            "Describe how you manage on-call responsibilities and high-stress production alerts."
        ],
        "hr": [
            "What drew you to DevOps and Cloud Infrastructure engineering?",
            "How do you foster a DevOps culture of shared responsibility between development and operations teams?",
            "Where do you see cloud-native infrastructure evolving over the next 5 years?",
            "How do you prioritize security and compliance alongside rapid continuous deployment?",
            "What kind of team environment enables you to build resilient systems?"
        ]
    }
}

DEFAULT_FALLBACK = {
    "technical": [
        "Explain a core technical concept or framework you use daily and why it is critical for this role.",
        "Describe an architectural or system design decision you made on a recent project.",
        "How do you approach debugging and root-cause analysis when facing an unexpected technical bug?",
        "What strategies do you use to ensure high performance, security, and scalability in your code?",
        "How do you evaluate new technologies or libraries before adopting them in a production project?"
    ],
    "behavioral": [
        "Describe a challenging project you worked on. What difficulties arose and how did you overcome them?",
        "Tell me about a situation where you had a technical disagreement with a teammate. How was it resolved?",
        "Describe a time when you were under pressure to meet a tight deadline. How did you prioritize tasks?",
        "Tell me about a mistake you made on a project. How did you address it and what did you learn?",
        "Describe a project where you took leadership or initiative to improve a process or system."
    ],
    "hr": [
        "Tell me about yourself and what specifically interests you about this target job role.",
        "What are your key professional strengths, and what area are you currently actively working to improve?",
        "Where do you see yourself in 3 to 5 years, and how does this role align with your long-term goals?",
        "What type of work culture, leadership, and team dynamics help you perform at your best?",
        "Why do you believe you are a strong candidate for this position?"
    ]
}

class InterviewGenerator:
    @staticmethod
    async def generate_questions(
        role_target: str,
        interview_type: str,
        experience_level: str = None,
        language: str = None,
        duration: int = None,
        difficulty: str = None,
        resume_text: str = None,
        count: int = 5
    ) -> list:
        norm_type = (interview_type or "technical").lower().strip()
        if "behavior" in norm_type:
            cat_type = "behavioral"
        elif "hr" in norm_type or "fit" in norm_type:
            cat_type = "hr"
        else:
            cat_type = "technical"

        prompt_parts = [
            f"Target Job Role: {role_target}",
            f"Interview Category: {cat_type.upper()}",
            f"Question Count: {count}"
        ]
        if experience_level:
            prompt_parts.append(f"Required Experience Level: {experience_level}")
        if language:
            prompt_parts.append(f"Interview Language: {language}")
        if duration:
            prompt_parts.append(f"Session Duration: {duration} minutes")
        if difficulty:
            prompt_parts.append(f"Difficulty Level: {difficulty}")
        if resume_text:
            prompt_parts.append(f"Candidate Resume Snapshot:\n{resume_text[:2000]}")

        prompt = ", ".join(prompt_parts)

        category_instructions = {
            "technical": (
                f"Focus strictly on TECHNICAL interview questions for the {role_target} role. "
                "Ask about core domain concepts, algorithms, frameworks, architectural design, coding paradigms, "
                "and hands-on engineering problems relevant to this position."
            ),
            "behavioral": (
                f"Focus strictly on BEHAVIORAL interview questions using the STAR method (Situation, Task, Action, Result) for the {role_target} role. "
                "Ask about past project achievements, production incidents, teamwork, conflict resolution, technical debt management, and deadline pressure."
            ),
            "hr": (
                f"Focus strictly on HR & CULTURE FIT interview questions for the {role_target} role. "
                "Ask about career aspirations, company motivation, salary/growth expectations, work ethics, communication style, "
                "and professional background alignment."
            )
        }
        
        system_instruction = (
            "You are an Elite Executive Technical Interviewer & Talent Assessor. "
            f"{category_instructions.get(cat_type, category_instructions['technical'])}\n"
            "Generate realistic, challenging, and professional questions tailored strictly to the specified role, category, experience level, and difficulty.\n"
            "Output a JSON list of objects containing:\n"
            "- 'question_id' (a unique short string slug)\n"
            "- 'text' (the complete, clear question text)\n"
            f"- 'type' (must be '{cat_type}')\n"
            "Return ONLY the JSON list of objects without markdown formatting."
        )

        try:
            response = await LLMService.generate_response(prompt, system_instruction)
            start_idx = response.find("[")
            end_idx = response.rfind("]") + 1
            if start_idx != -1 and end_idx != -1:
                questions_list = json.loads(response[start_idx:end_idx])
                if isinstance(questions_list, list) and len(questions_list) > 0:
                    for q in questions_list:
                        if "question_id" not in q or not q["question_id"]:
                            q["question_id"] = str(uuid.uuid4())[:8]
                        q["type"] = cat_type
                    return questions_list[:count]
        except Exception as e:
            print(f"Error generating AI interview questions via LLM: {e}")

        # High Quality Role & Category Fallback Bank
        role_key = (role_target or "").lower().strip()
        matched_role_bank = None
        for k in ROLE_QUESTIONS_MATRIX:
            if k in role_key or role_key in k:
                matched_role_bank = ROLE_QUESTIONS_MATRIX[k]
                break

        if matched_role_bank and cat_type in matched_role_bank:
            questions_text = matched_role_bank[cat_type]
        else:
            questions_text = DEFAULT_FALLBACK.get(cat_type, DEFAULT_FALLBACK["technical"])

        result_questions = []
        for idx, q_text in enumerate(questions_text[:count]):
            result_questions.append({
                "question_id": f"q_{cat_type}_{idx+1}",
                "text": q_text,
                "type": cat_type
            })

        return result_questions

