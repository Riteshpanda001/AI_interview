"""
Seed Script — Companies & Company Questions
============================================
Populates the MongoDB `companies` and `company_questions` collections
from the curated static data already present in the frontend components
(HiringProcess.jsx, InterviewRounds.jsx, CompanyDetails.jsx, etc.)

Usage:
    cd Backend
    python seed_companies.py

Run once. Re-run is safe — uses slug-based upsert to avoid duplicates.
"""

import asyncio
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(__file__))
from dotenv import load_dotenv
load_dotenv()

from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DATABASE_NAME", "ai_interview_prep")

# ── Company Profiles (mirrors HiringProcess / InterviewRounds / CompanyDetails) ──

COMPANIES = [
    {
        "name": "Google",
        "slug": "google",
        "industry": "Technology / Search & Cloud",
        "difficulty_rating": "Hard",
        "hq": "Mountain View, California",
        "ctc": "₹32 - 50 LPA",
        "experience": "0 - 8+ Years",
        "roles": ["Software Engineer (SWE)", "Site Reliability Engineer (SRE)", "Product Manager"],
        "description": "Google looks for strong conceptual foundations in Data Structures and Algorithms, deep systems logic, and cultural alignment through the 'Googlyness' round.",
        "evaluation_stats": [
            {"label": "DSA Weight", "value": "90%"},
            {"label": "System Design Weight", "value": "80%"},
            {"label": "Culture Match Weight", "value": "75%"}
        ],
        "hiring_process": [
            {"title": "Resume Selection", "desc": "AI-optimized resume filter seeking quantifiable achievements and project impact."},
            {"title": "Phone Screen", "desc": "45-minute technical coding round covering linear structures or basic recursion."},
            {"title": "Onsite Rounds", "desc": "3 Coding rounds (medium/hard DSA) + 1 System Design round + 1 Googlyness round."},
            {"title": "Hiring Committee", "desc": "Independent reviewers evaluate anonymous feedback sheets to ensure unbiased hiring."},
            {"title": "Team Matching & Offer", "desc": "Find target teams matching your skills, complete final reviews, and issue offer."}
        ],
        "interview_rounds": [
            {"name": "Technical / Coding Round", "duration": "45 Mins", "focus": "DSA, Trees, Graphs, DP", "tip": "State your time/space complexity before coding. Walk through edge cases out loud."},
            {"name": "System Design", "duration": "45 Mins", "focus": "Scalability, Caching, Databases", "tip": "Start with functional/non-functional requirements. Sketch high-level block designs first."},
            {"name": "Googlyness & Leadership", "duration": "45 Mins", "focus": "Behavioral, Teamwork, Diversity", "tip": "Show willingness to learn, adapt, and handle conflict. Use the STAR methodology."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Core DSA Patterns", "focus": "Array intervals, Sliding window, Hash Map lookups, and fast stack logic patterns.", "actions": ["Solve 15 Medium sliding window problems", "Practice 10 Prefix sum and two-pointer scenarios", "Review optimal runtime models"]},
            {"week": "Week 2", "goal": "Advanced Data Structures", "focus": "Graphs navigation (DFS/BFS), Tree structures, BST searches, and Binary Searches.", "actions": ["Implement custom BST traversals", "Solve 10 Graph pathfinding problems", "Solve 10 Binary Search optimization questions"]},
            {"week": "Week 3", "goal": "System Design Foundations", "focus": "Database selection, load balancers, caching strategies, and HLD/LLD patterns.", "actions": ["Read microservices and API gateway structures", "Practice designing TinyURL or WhatsApp block structures", "Compare SQL vs NoSQL DB performance"]},
            {"week": "Week 4", "goal": "Mock Loop & Core Values", "focus": "Timed coding simulations, STAR-based behavioral scenarios, and company culture fits.", "actions": ["Execute 3 mock technical rounds on PrepNova", "Deep dive into company core leadership principles", "Optimize code dry-run speeds"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT related", "min_cgpa": "7.5+", "batch_eligibility": "Fresh graduates & experienced up to 8 years", "backlogs_allowed": "0"},
    },
    {
        "name": "Microsoft",
        "slug": "microsoft",
        "industry": "Technology / Cloud & Enterprise Software",
        "difficulty_rating": "Hard",
        "hq": "Redmond, Washington",
        "ctc": "₹28 - 45 LPA",
        "experience": "0 - 10+ Years",
        "roles": ["Software Engineering (SWE)", "Data Scientist", "Program Manager"],
        "description": "Microsoft evaluations check clear OOP design paradigms, multi-threaded coding efficiency, scalable software architectures, and product optimization concepts.",
        "evaluation_stats": [
            {"label": "DSA Weight", "value": "80%"},
            {"label": "OOP & Design Weight", "value": "85%"},
            {"label": "System Design Weight", "value": "75%"}
        ],
        "hiring_process": [
            {"title": "Resume Screening", "desc": "Evaluation of academic background, core projects, and technical skills."},
            {"title": "Online Assessment", "desc": "1-2 coding problems testing algorithms, time limitations, and design efficiency."},
            {"title": "Technical Onsite", "desc": "3 rounds focusing on DSA, clean object-oriented code, and system structure."},
            {"title": "As-Appropriate (AA) Round", "desc": "Bar-raiser manager round evaluating overall architectural vision and fit."},
            {"title": "Final Decisions", "desc": "Consolidated team feedbacks compile the final hiring offer details."}
        ],
        "interview_rounds": [
            {"name": "Online Test / Screen", "duration": "60 Mins", "focus": "DSA, Arrays, Strings", "tip": "Make sure code is clean and passes all hidden boundary test cases."},
            {"name": "Technical Onsite", "duration": "45 Mins", "focus": "OOP Design, Linked Lists, Trees", "tip": "Think about design patterns, encapsulation, clean API structures."},
            {"name": "System Design / Architecture", "duration": "45 Mins", "focus": "Microservices, API Design", "tip": "Focus on decoupled architectures, databases, and trade-offs."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Core DSA Patterns", "focus": "Arrays, Strings, HashMap, Two Pointers, Binary Search.", "actions": ["Solve 20 Easy-Medium array problems", "Master two-pointer and sliding window", "Practice string manipulation"]},
            {"week": "Week 2", "goal": "OOP & Design Patterns", "focus": "SOLID principles, Design patterns (Factory, Singleton, Observer).", "actions": ["Implement 5 design patterns in code", "Practice LLD for Parking Lot, Library System", "Review class diagrams"]},
            {"week": "Week 3", "goal": "System Design", "focus": "Microservices, REST APIs, Database sharding, and caching.", "actions": ["Design scalable chat application", "Study Azure architecture patterns", "Practice HLD diagrams"]},
            {"week": "Week 4", "goal": "Mock & Behavioral", "focus": "STAR stories, coding speed, and mock interview simulations.", "actions": ["Run 3 full mock interviews", "Prepare answers for behavioral questions", "Review Microsoft culture values"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT related", "min_cgpa": "7.0+", "batch_eligibility": "Fresh graduates & experienced", "backlogs_allowed": "0"},
    },
    {
        "name": "Amazon",
        "slug": "amazon",
        "industry": "Technology / E-Commerce & Cloud (AWS)",
        "difficulty_rating": "Hard",
        "hq": "Seattle, Washington",
        "ctc": "₹25 - 42 LPA",
        "experience": "0 - 7+ Years",
        "roles": ["Software Development Engineer (SDE)", "Support Engineer", "Solutions Architect"],
        "description": "Amazon heavily scrutinizes your decision histories using their 16 Leadership Principles. Coding rounds check algorithmic accuracy under stress.",
        "evaluation_stats": [
            {"label": "Leadership Principles", "value": "95%"},
            {"label": "DSA Weight", "value": "85%"},
            {"label": "System Design Weight", "value": "80%"}
        ],
        "hiring_process": [
            {"title": "Application Filter", "desc": "Filter candidate experiences, projects, and target role alignments."},
            {"title": "Online Assessment", "desc": "2 coding questions + work style simulation checking Leadership Principles."},
            {"title": "Technical Loop", "desc": "4-5 onsite rounds focusing on DSA, HLD/LLD, and leadership behavior answers."},
            {"title": "Debrief Panel", "desc": "All interviewers align and select the hiring bar alignment status."},
            {"title": "Offer Delivery", "desc": "Salary package discussions, benefits details, and onboarding schedules."}
        ],
        "interview_rounds": [
            {"name": "Online Assessment (OA)", "duration": "90 Mins", "focus": "DSA + Leadership Principles", "tip": "Manage your time wisely. Read the leadership simulation scenarios closely."},
            {"name": "Coding Round", "duration": "45 Mins", "focus": "Arrays, Maps, Stacks, Queues", "tip": "Explain how your code aligns with customer obsession or operational standards."},
            {"name": "System Design Round", "duration": "45 Mins", "focus": "Sharding, CDNs, Load Balancers", "tip": "Design for durability and high availability. Use AWS-like concepts."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "DSA Foundations", "focus": "Arrays, LinkedLists, Stacks, Queues, HashMaps.", "actions": ["Solve top 30 Amazon-tagged LeetCode problems", "Master HashMap patterns", "Practice stack/queue problems"]},
            {"week": "Week 2", "goal": "Leadership Principles Deep Dive", "focus": "Learn and internalize all 16 Amazon Leadership Principles.", "actions": ["Write 2 STAR stories per LP", "Practice telling stories in 2-3 min", "Record yourself and review delivery"]},
            {"week": "Week 3", "goal": "System Design (AWS Focus)", "focus": "High availability, fault tolerance, S3/DynamoDB/SQS patterns.", "actions": ["Design Amazon Prime Video backend", "Study DynamoDB partitioning", "Practice Load Balancer diagrams"]},
            {"week": "Week 4", "goal": "Full Mock Loop", "focus": "Simulate the full 4-5 round Amazon interview loop.", "actions": ["Run 2 full mock coding rounds", "Practice 1 system design interview", "Review 3 LP answers daily"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT related", "min_cgpa": "6.5+", "batch_eligibility": "Fresh graduates & experienced up to 7 years", "backlogs_allowed": "0"},
    },
    {
        "name": "Meta",
        "slug": "meta",
        "industry": "Technology / Social Media & VR",
        "difficulty_rating": "Hard",
        "hq": "Menlo Park, California",
        "ctc": "₹35 - 55 LPA",
        "experience": "2 - 12+ Years",
        "roles": ["Software Engineer", "Production Engineer", "Product Designer"],
        "description": "Meta requires fast coding iteration. You must solve two medium/hard algorithms in 45 minutes perfectly, including dry runs and time analyses.",
        "evaluation_stats": [
            {"label": "Coding Speed", "value": "98%"},
            {"label": "DSA Accuracy", "value": "95%"},
            {"label": "System Design Weight", "value": "85%"}
        ],
        "hiring_process": [
            {"title": "Profile Evaluation", "desc": "Screening profiles showing strong problem solving and shipping experience."},
            {"title": "Technical Screen", "desc": "1-2 coding questions. You must solve them quickly and cleanly in 45 minutes."},
            {"title": "Onsite Loop", "desc": "2 coding rounds + 1 system design round + 1 behavioral (PE/culture) round."},
            {"title": "Hiring Board Review", "desc": "Independent engineering directors review feedback reports to approve hires."},
            {"title": "Compensation & Offer", "desc": "Coordinate base, equity details, target starting dates, and signing sheets."}
        ],
        "interview_rounds": [
            {"name": "Coding Screen", "duration": "45 Mins", "focus": "Fast Algorithms, Speed", "tip": "You must solve 2 medium problems. Don't spend more than 5 minutes explaining."},
            {"name": "Coding Onsite (2 Rounds)", "duration": "45 Mins each", "focus": "Hard DSA, Dynamic Programming", "tip": "Meta focuses on optimal solutions. Avoid brute force immediately."},
            {"name": "Product Design", "duration": "45 Mins", "focus": "Product Architecture, APIs", "tip": "Focus on client-server interactions, database schemas, and protocols."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Speed Coding", "focus": "Hard DSA problems under time pressure — DP, Trees, Graphs.", "actions": ["Solve 25 Meta-tagged LeetCode Hard problems", "Set 20-min timers per problem", "Review optimal approaches after each attempt"]},
            {"week": "Week 2", "goal": "Dynamic Programming Mastery", "focus": "Classic DP patterns: 0/1 Knapsack, LCS, LIS, Coin Change.", "actions": ["Implement 15 DP problems from scratch", "Master top-down vs bottom-up approaches", "Practice space optimization techniques"]},
            {"week": "Week 3", "goal": "System Design at Scale", "focus": "Design for billions of users — News Feed, Messenger, Instagram.", "actions": ["Design Facebook News Feed architecture", "Study consistent hashing and sharding", "Practice drawing complete system diagrams"]},
            {"week": "Week 4", "goal": "Mock Interviews & Behavioral", "focus": "Speed, confidence, and Meta cultural values.", "actions": ["Run 3 timed coding mock sessions", "Prepare impact-driven behavioral answers", "Review Meta's company values"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT related", "min_cgpa": "7.0+", "batch_eligibility": "2+ years experience preferred", "backlogs_allowed": "0"},
    },
    {
        "name": "Netflix",
        "slug": "netflix",
        "industry": "Technology / Streaming & Entertainment",
        "difficulty_rating": "Hard",
        "hq": "Los Gatos, California",
        "ctc": "₹40 - 65 LPA",
        "experience": "3 - 15+ Years",
        "roles": ["Senior Software Engineer", "Core Infrastructure Engineer", "UI Engineer"],
        "description": "Netflix values independence, high maturity, and alignment with their Freedom and Responsibility culture deck. Technical focus lies in high scalability.",
        "evaluation_stats": [
            {"label": "Culture Fit", "value": "95%"},
            {"label": "System Architecture", "value": "90%"},
            {"label": "Concurrency & Scale", "value": "85%"}
        ],
        "hiring_process": [
            {"title": "Recruiter Call", "desc": "Check core experience, motivations, and cultural expectations."},
            {"title": "Technical Screen", "desc": "1-2 high-level coding or system questions with senior infrastructure leads."},
            {"title": "Onsite Loop", "desc": "2 System Architecture rounds + 2 Coding/LLD rounds + 2 Cultural fit chats."},
            {"title": "Feedback Debrief", "desc": "Immediate decision round. Focuses on consensus among the panel."},
            {"title": "Executive Sign-Off", "desc": "Engineering VP and HR director review compensation parameters for sign-off."}
        ],
        "interview_rounds": [
            {"name": "System Architecture", "duration": "60 Mins", "focus": "Streaming Protocols, CDNs", "tip": "Discuss failure recovery, network latency, and video caching layers."},
            {"name": "Senior Coding & LLD", "duration": "60 Mins", "focus": "Concurrency, Thread Safety", "tip": "Design robust APIs. Ensure proper locking, resource management, and testing."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Streaming & CDN Architecture", "focus": "Video encoding, CDN edge caching, adaptive bitrate streaming.", "actions": ["Study HLS/DASH protocols", "Learn CDN edge node architecture", "Understand video transcoding pipelines"]},
            {"week": "Week 2", "goal": "Distributed Systems", "focus": "Microservices, service mesh, fault tolerance, circuit breakers.", "actions": ["Study Netflix OSS (Hystrix, Eureka, Ribbon)", "Implement circuit breaker pattern", "Learn chaos engineering concepts"]},
            {"week": "Week 3", "goal": "Concurrency & Performance", "focus": "Thread safety, reactive programming, async patterns.", "actions": ["Master Java CompletableFuture/RxJava", "Practice lock-free data structures", "Benchmark and optimize code"]},
            {"week": "Week 4", "goal": "Culture Fit & Mock", "focus": "Netflix Freedom & Responsibility culture, impact-driven communication.", "actions": ["Read Netflix Culture Deck thoroughly", "Prepare 5 examples of independent high-impact decisions", "Run mock system design interview"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT related", "min_cgpa": "N/A - experienced hires", "batch_eligibility": "3+ years of industry experience required", "backlogs_allowed": "N/A"},
    },
    {
        "name": "Apple",
        "slug": "apple",
        "industry": "Technology / Consumer Electronics & Software",
        "difficulty_rating": "Hard",
        "hq": "Cupertino, California",
        "ctc": "₹30 - 48 LPA",
        "experience": "1 - 10+ Years",
        "roles": ["Hardware Engineer", "Software Engineer", "iOS Developer"],
        "description": "Apple values perfection, privacy principles, low-level OS/memory control, and high attention to product craftsmanship and UI detail.",
        "evaluation_stats": [
            {"label": "Low Level / OS Logic", "value": "90%"},
            {"label": "Product Design", "value": "85%"},
            {"label": "DSA Weight", "value": "80%"}
        ],
        "hiring_process": [
            {"title": "Initial Screen", "desc": "Verify strong specialization in systems, hardware, or target application layers."},
            {"title": "Technical Screen", "desc": "Detailed technical discussion or coding round testing low-level design."},
            {"title": "Onsite Loop", "desc": "4-5 rounds of intense technical deep-dives, hardware/software interactions, and design."},
            {"title": "Director Interview", "desc": "Final fit round evaluating product alignment and vision."},
            {"title": "Hiring Offer", "desc": "Determine standard tiers, equity components, and coordinate offer details."}
        ],
        "interview_rounds": [
            {"name": "Low-Level Coding", "duration": "60 Mins", "focus": "Memory Management, C/C++ Basics", "tip": "Understand pointers, stack vs heap, assembly foundations, and constraints."},
            {"name": "Systems Design", "duration": "45 Mins", "focus": "Device-to-Cloud sync, Security", "tip": "Address privacy protocols, local SQLite storage sync, and battery optimization."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Low-Level Programming", "focus": "C/C++ mastery, pointers, memory management, OS fundamentals.", "actions": ["Complete C++ memory management exercises", "Practice pointer arithmetic", "Study malloc/free internals"]},
            {"week": "Week 2", "goal": "iOS/macOS Frameworks", "focus": "Swift, UIKit/SwiftUI, Core Data, Combine.", "actions": ["Build a sample iOS app with Core Data", "Master async/await in Swift", "Study Grand Central Dispatch (GCD)"]},
            {"week": "Week 3", "goal": "Privacy & Security", "focus": "Apple's privacy frameworks, Keychain, secure enclave, end-to-end encryption.", "actions": ["Study CryptoKit and Keychain APIs", "Implement biometric authentication flow", "Review App Transport Security (ATS)"]},
            {"week": "Week 4", "goal": "Product Craftsmanship", "focus": "Pixel-perfect UI, accessibility, performance profiling.", "actions": ["Use Instruments to profile app performance", "Implement VoiceOver accessibility", "Study Human Interface Guidelines (HIG)"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/CS/IT/ECE related", "min_cgpa": "7.0+", "batch_eligibility": "1+ years experience preferred", "backlogs_allowed": "0"},
    },
    {
        "name": "TCS",
        "slug": "tcs",
        "industry": "IT Services / Consulting",
        "difficulty_rating": "Medium",
        "hq": "Mumbai, Maharashtra",
        "ctc": "₹3.6 - 7.5 LPA (NQT / Digital)",
        "experience": "0 - 4 Years",
        "roles": ["Ninja Systems Engineer", "Digital Software Engineer", "Prime Developer"],
        "description": "TCS tests logical ability, verbal speed, and syntax coding. TCS Digital & Prime tracks test advanced data structure implementations.",
        "evaluation_stats": [
            {"label": "Aptitude Weight", "value": "90%"},
            {"label": "Coding Basics", "value": "80%"},
            {"label": "SQL & DB Basics", "value": "70%"}
        ],
        "hiring_process": [
            {"title": "Online NQT Exam", "desc": "National Qualifier Test assessing Numerical, Verbal, Logical, and Basic Coding."},
            {"title": "Technical Round", "desc": "Face-to-face round assessing academic projects, OOPs, DBMS, SQL, and simple algorithms."},
            {"title": "Managerial Round", "desc": "Case-study and behavioral questions assessing flexibility and pressure handling."},
            {"title": "HR Round", "desc": "Document verifications, shifts agreement, relocate guidelines, and salary package explanations."}
        ],
        "interview_rounds": [
            {"name": "Aptitude (NQT)", "duration": "120 Mins", "focus": "Quant, English, Coding Logic", "tip": "Practice speed calculation. Standard logic questions are repeated."},
            {"name": "Technical Interview", "duration": "30 Mins", "focus": "Core Java, DBMS, SQL, Projects", "tip": "Be thorough with your final-year college project and basic SQL queries."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Aptitude & General Reasoning", "focus": "Quantitative calculations, logical deductions, coding patterns, and speed puzzles.", "actions": ["Practice 3 mock aptitude sets", "Solve basic array logic problems", "Review basic syntax structure"]},
            {"week": "Week 2", "goal": "Core Coding and SQL Foundations", "focus": "Fundamental linear structures, primary sorting logics, and essential SQL query writing.", "actions": ["Solve 15 Easy recursion/array questions", "Learn JOINs, GROUP BY, and aggregate queries", "Review standard database schemas"]},
            {"week": "Week 3", "goal": "Academic Projects & CS Fundamentals", "focus": "Deep dive into your university projects, OOPs definitions, and Operating System constructs.", "actions": ["Draft 30-second descriptions for each project", "Revise inheritance, polymorphism, and encapsulation", "Review basic network layers"]},
            {"week": "Week 4", "goal": "Mock Interviews & Soft Skills", "focus": "Simulating face-to-face panels, HR negotiations, and body language alignment.", "actions": ["Perform 2 AI Mock HR rounds", "Practice standard questions like 'Tell me about yourself'", "Draft formal resume files"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/MCA/BCA/BSc-CS or related", "min_cgpa": "6.0 CGPA / 60% aggregate", "batch_eligibility": "Current graduating batch (0-1 year gap allowed)", "backlogs_allowed": "0 active backlogs at time of test"},
    },
    {
        "name": "Infosys",
        "slug": "infosys",
        "industry": "IT Services / Consulting",
        "difficulty_rating": "Medium",
        "hq": "Bengaluru, Karnataka",
        "ctc": "₹3.6 - 8.0 LPA (System Engineer / Specialist)",
        "experience": "0 - 4 Years",
        "roles": ["Systems Engineer", "Specialist Programmer (SP)", "Digital Specialist Engineer (DSE)"],
        "description": "Infosys Specialty Tracks focus on competitive coding, logic constructs, dynamic databases, and application framework foundations.",
        "evaluation_stats": [
            {"label": "Specialty Coding", "value": "85%"},
            {"label": "Logical Aptitude", "value": "90%"},
            {"label": "Core Java/DBMS", "value": "75%"}
        ],
        "hiring_process": [
            {"title": "Aptitude / Coding Screening", "desc": "Logical reasoning, mathematical aptitude, and fundamental programming tests."},
            {"title": "Technical Interview", "desc": "Evaluation of programming fundamentals (Java/Python/C++), projects, and SQL queries."},
            {"title": "HR Interview", "desc": "General communication check, relocation preferences, and formal compensation details."}
        ],
        "interview_rounds": [
            {"name": "Aptitude Round", "duration": "95 Mins", "focus": "Logical Reasoning, Math, Verbal", "tip": "Prioritize questions you are strong in. Do not spend too much time on single questions."},
            {"name": "Technical Round", "duration": "30 Mins", "focus": "CS Core, Python/Java, Web Dev", "tip": "Understand OOP concepts clearly. Be ready to explain polymorphism and inheritance."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Aptitude & General Reasoning", "focus": "Speed-based quantitative, verbal, and logical reasoning.", "actions": ["Solve 50 aptitude questions daily", "Practice time and work, profit/loss", "Review verbal ability: reading comprehension"]},
            {"week": "Week 2", "goal": "Programming Fundamentals", "focus": "OOP in Java/Python, SQL basics, basic data structures.", "actions": ["Code 10 OOP programs", "Write 20 SQL queries covering JOINs and GROUP BY", "Understand linked list and stack basics"]},
            {"week": "Week 3", "goal": "CS Core Concepts", "focus": "OS scheduling, DBMS normalization, basic networking.", "actions": ["Revise process scheduling algorithms", "Practice 3NF/BCNF normalization problems", "Study OSI model layers"]},
            {"week": "Week 4", "goal": "HR & Communication Prep", "focus": "Personal introductions, project descriptions, communication clarity.", "actions": ["Draft a 60-second self-introduction", "Practice common HR questions", "Prepare salary expectation discussion"]}
        ],
        "eligibility": {"degree": "B.E./B.Tech/M.Tech/MCA/BCA or related", "min_cgpa": "6.0 CGPA / 60% aggregate", "batch_eligibility": "Current graduating batch (up to 2 year gap)", "backlogs_allowed": "0 active backlogs"},
    },
    {
        "name": "OpenAI",
        "slug": "openai",
        "industry": "Artificial Intelligence / Research",
        "difficulty_rating": "Hard",
        "hq": "San Francisco, California",
        "ctc": "₹45 - 80 LPA",
        "experience": "2 - 15+ Years",
        "roles": ["Research Engineer", "Software Engineer", "ML Infrastructure Engineer"],
        "description": "OpenAI looks for deep ML/AI knowledge, research ability, and strong engineering fundamentals. Expect questions on transformers, training infrastructure, and distributed ML systems.",
        "evaluation_stats": [
            {"label": "ML/AI Knowledge", "value": "95%"},
            {"label": "Research Ability", "value": "90%"},
            {"label": "Systems Engineering", "value": "85%"}
        ],
        "hiring_process": [
            {"title": "Resume & Portfolio Review", "desc": "Research papers, GitHub projects, and contributions to open-source ML frameworks evaluated."},
            {"title": "Technical Phone Screen", "desc": "ML fundamentals, coding (Python), and problem solving in 60 minutes."},
            {"title": "Research/Engineering Presentation", "desc": "Present a past project, paper, or system you've built to a panel."},
            {"title": "Full Loop Interviews", "desc": "3-4 rounds: ML theory, coding, system design, and cultural fit."},
            {"title": "Offer & Negotiation", "desc": "High compensation with significant equity component."}
        ],
        "interview_rounds": [
            {"name": "ML Fundamentals", "duration": "60 Mins", "focus": "Transformers, Backprop, Optimization", "tip": "Be able to derive backpropagation and explain attention mechanisms from scratch."},
            {"name": "Coding Round", "duration": "45 Mins", "focus": "Python, Algorithms, ML Code", "tip": "Write clean vectorized NumPy/PyTorch code. Avoid loops where matrix ops work."},
            {"name": "System Design (ML)", "duration": "60 Mins", "focus": "Training infrastructure, distributed ML", "tip": "Discuss data parallelism, model parallelism, and gradient accumulation strategies."}
        ],
        "prep_roadmap": [
            {"week": "Week 1", "goal": "Deep Learning Foundations", "focus": "Neural networks, backprop, transformers, and attention mechanisms.", "actions": ["Implement transformer from scratch", "Study Andrej Karpathy's nanoGPT", "Review key ML papers: Attention is All You Need"]},
            {"week": "Week 2", "goal": "ML Systems & Infrastructure", "focus": "Distributed training, CUDA, PyTorch internals, MLOps.", "actions": ["Learn PyTorch DDP and FSDP", "Understand GPU memory optimization", "Study model quantization and pruning"]},
            {"week": "Week 3", "goal": "Research & Coding", "focus": "Algorithm coding in Python, competitive ML research.", "actions": ["Solve 20 ML-specific LeetCode problems", "Implement key algorithms: Adam, RLHF, PEFT", "Read 3 recent OpenAI papers"]},
            {"week": "Week 4", "goal": "Mock Interviews", "focus": "End-to-end ML system design and research presentation.", "actions": ["Present a past project to peers for feedback", "Run ML system design mock", "Practice explaining complex concepts simply"]}
        ],
        "eligibility": {"degree": "M.Tech/PhD in CS, AI/ML, Mathematics, Physics preferred", "min_cgpa": "N/A - research output matters more", "batch_eligibility": "2+ years of ML engineering or research experience", "backlogs_allowed": "N/A"},
    },
]

# ── Company Questions (DSA, Technical, HR, Behavioral) ──────────────────────

COMPANY_QUESTIONS = [
    # Google
    {"company_slug": "google", "category": "dsa", "title": "Two Sum", "difficulty": "Easy", "frequency": "98% Asked", "topic": "Arrays", "instructions": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."},
    {"company_slug": "google", "category": "dsa", "title": "Number of Islands", "difficulty": "Medium", "frequency": "88% Asked", "topic": "Graph", "instructions": "Given an m x n 2D binary grid, return the total number of islands using DFS/BFS."},
    {"company_slug": "google", "category": "dsa", "title": "Word Break", "difficulty": "Medium", "frequency": "85% Asked", "topic": "Dynamic Programming", "instructions": "Given a string s and a dictionary of strings, return true if s can be segmented into a space-separated sequence of dictionary words."},
    {"company_slug": "google", "category": "dsa", "title": "Median of Two Sorted Arrays", "difficulty": "Hard", "frequency": "78% Asked", "topic": "Binary Search", "instructions": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays in O(log(m+n)) time."},
    {"company_slug": "google", "category": "technical", "title": "Explain the difference between process and thread", "difficulty": "Medium", "topic": "Operating Systems", "instructions": "Describe key differences including memory sharing, context switching, and communication overhead."},
    {"company_slug": "google", "category": "behavioral", "title": "Tell me about a time you disagreed with your manager", "difficulty": "Medium", "topic": "Googlyness", "instructions": "Use the STAR method. Show respect for hierarchy while demonstrating independent thinking."},

    # Amazon
    {"company_slug": "amazon", "category": "dsa", "title": "LRU Cache", "difficulty": "Medium", "frequency": "91% Asked", "topic": "Design", "instructions": "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache."},
    {"company_slug": "amazon", "category": "dsa", "title": "Meeting Rooms II", "difficulty": "Medium", "frequency": "87% Asked", "topic": "Greedy", "instructions": "Given an array of meeting time intervals, find the minimum number of conference rooms required."},
    {"company_slug": "amazon", "category": "dsa", "title": "Word Ladder", "difficulty": "Hard", "frequency": "82% Asked", "topic": "BFS", "instructions": "Return the length of the shortest transformation sequence from beginWord to endWord using BFS."},
    {"company_slug": "amazon", "category": "behavioral", "title": "Tell me about a time you delivered a project under a tight deadline", "difficulty": "Medium", "topic": "Ownership", "instructions": "Demonstrate Amazon's 'Bias for Action' and 'Deliver Results' leadership principles."},
    {"company_slug": "amazon", "category": "behavioral", "title": "Describe a situation where you had to make a decision with incomplete data", "difficulty": "Medium", "topic": "Bias for Action", "instructions": "Show calculated risk-taking and data-driven reasoning under ambiguity."},

    # Microsoft
    {"company_slug": "microsoft", "category": "dsa", "title": "Reverse Linked List", "difficulty": "Easy", "frequency": "85% Asked", "topic": "Linked List", "instructions": "Reverse a singly linked list in-place. Return the new head."},
    {"company_slug": "microsoft", "category": "dsa", "title": "Clone Graph", "difficulty": "Medium", "frequency": "80% Asked", "topic": "Graph", "instructions": "Return a deep copy (clone) of the graph using DFS or BFS."},
    {"company_slug": "microsoft", "category": "dsa", "title": "Serialize and Deserialize Binary Tree", "difficulty": "Hard", "frequency": "75% Asked", "topic": "Trees", "instructions": "Design an algorithm to serialize and deserialize a binary tree."},
    {"company_slug": "microsoft", "category": "technical", "title": "Design a URL Shortener (TinyURL)", "difficulty": "Medium", "topic": "System Design", "instructions": "Design the high-level and low-level architecture for a URL shortening service like bit.ly."},
    {"company_slug": "microsoft", "category": "hr", "title": "Why do you want to work at Microsoft?", "difficulty": "Easy", "topic": "HR", "instructions": "Show alignment with Microsoft's mission: empower every person and organization on the planet."},

    # Meta
    {"company_slug": "meta", "category": "dsa", "title": "Merge k Sorted Lists", "difficulty": "Hard", "frequency": "93% Asked", "topic": "Heap", "instructions": "Merge k sorted linked lists and return it as one sorted list using a min-heap."},
    {"company_slug": "meta", "category": "dsa", "title": "Maximum Subarray", "difficulty": "Medium", "frequency": "88% Asked", "topic": "Dynamic Programming", "instructions": "Find the contiguous subarray which has the largest sum using Kadane's algorithm."},
    {"company_slug": "meta", "category": "dsa", "title": "Trapping Rain Water", "difficulty": "Hard", "frequency": "85% Asked", "topic": "Two Pointers", "instructions": "Given n non-negative integers representing elevation map, compute how much water it can trap after raining."},
    {"company_slug": "meta", "category": "technical", "title": "Design Facebook News Feed", "difficulty": "Hard", "topic": "System Design", "instructions": "Design the system architecture for a social media news feed that handles billions of users."},
    {"company_slug": "meta", "category": "behavioral", "title": "Tell me about a project you are most proud of", "difficulty": "Easy", "topic": "Impact", "instructions": "Quantify your impact. Meta values measurable outcomes and bold moves."},

    # TCS
    {"company_slug": "tcs", "category": "dsa", "title": "Find Second Largest in Array", "difficulty": "Easy", "frequency": "90% Asked", "topic": "Arrays", "instructions": "Find the second largest element in an array in a single traversal."},
    {"company_slug": "tcs", "category": "dsa", "title": "Check Palindrome", "difficulty": "Easy", "frequency": "85% Asked", "topic": "Strings", "instructions": "Check whether a given string is a palindrome using two-pointer approach."},
    {"company_slug": "tcs", "category": "technical", "title": "What is normalization in DBMS?", "difficulty": "Easy", "topic": "DBMS", "instructions": "Explain 1NF, 2NF, 3NF, and BCNF with examples. Describe why normalization is important."},
    {"company_slug": "tcs", "category": "technical", "title": "Explain OOPS concepts with real-world examples", "difficulty": "Easy", "topic": "OOP", "instructions": "Cover encapsulation, inheritance, polymorphism, and abstraction with code snippets."},
    {"company_slug": "tcs", "category": "hr", "title": "Why do you want to join TCS?", "difficulty": "Easy", "topic": "HR", "instructions": "Show knowledge of TCS's scale, learning culture, and global presence."},

    # Infosys
    {"company_slug": "infosys", "category": "dsa", "title": "Reverse a Linked List", "difficulty": "Easy", "frequency": "88% Asked", "topic": "Linked List", "instructions": "Reverse a singly linked list iteratively and recursively."},
    {"company_slug": "infosys", "category": "technical", "title": "Explain process vs thread and deadlock", "difficulty": "Medium", "topic": "Operating Systems", "instructions": "Describe process vs thread differences and explain deadlock conditions with examples."},
    {"company_slug": "infosys", "category": "hr", "title": "Where do you see yourself in 5 years?", "difficulty": "Easy", "topic": "HR", "instructions": "Show ambition aligned with Infosys's growth culture and technology consulting paths."},
]


async def seed():
    sys.stdout.reconfigure(encoding="utf-8")
    print(f"\n[START] Connecting to MongoDB: {MONGODB_URL} / {DB_NAME}")
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    now = datetime.now(timezone.utc)

    # -- Seed Companies -------------------------------------------------------
    print("\n[INFO] Seeding companies collection...")
    comp_inserted = comp_skipped = 0
    for company in COMPANIES:
        existing = await db["companies"].find_one({"slug": company["slug"]})
        if existing:
            print(f"  [SKIP]  Already exists: {company['name']}")
            comp_skipped += 1
        else:
            company["created_at"] = now
            company["updated_at"] = now
            await db["companies"].insert_one(dict(company))
            print(f"  [OK] Inserted company: {company['name']}")
            comp_inserted += 1

    # -- Seed Company Questions -----------------------------------------------
    print("\n[INFO] Seeding company_questions collection...")
    q_inserted = q_skipped = 0
    for q in COMPANY_QUESTIONS:
        existing = await db["company_questions"].find_one({
            "company_slug": q["company_slug"],
            "title": q["title"]
        })
        if existing:
            print(f"  [SKIP] [{q['company_slug'].upper()}] {q['title']}")
            q_skipped += 1
        else:
            q["created_at"] = now
            await db["company_questions"].insert_one(dict(q))
            print(f"  [OK] [{q['company_slug'].upper()}] {q['title']}  [{q['difficulty']}]")
            q_inserted += 1

    print(f"\n[DONE] Companies: {comp_inserted} inserted, {comp_skipped} skipped.")
    print(f"[DONE] Questions: {q_inserted} inserted, {q_skipped} skipped.\n")
    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
