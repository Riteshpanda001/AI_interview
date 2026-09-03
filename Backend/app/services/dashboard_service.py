from datetime import datetime, timezone, timedelta
from bson import ObjectId
from app.services.goal_service import GoalService
from app.services.activity_service import ActivityService

class DashboardService:
    @staticmethod
    async def get_user_dashboard(user_id: str, db) -> dict:
        user_id_str = str(user_id)

        # ----------------------------------------------------
        # 1. RESUME PROGRESS
        # ----------------------------------------------------
        try:
            latest_resume = await db["resumes"].find_one({"user_id": user_id_str})
        except Exception:
            latest_resume = None

        resume_exists = False
        resume_completion = 0
        resume_sections_status = {
            "personal": False,
            "summary": False,
            "education": False,
            "skills": False,
            "projects": False,
            "experience": False,
            "certifications": False
        }
        total_sections = 7

        if latest_resume and isinstance(latest_resume, dict):
            resume_exists = True
            parsed = latest_resume.get("parsed_content", {})
            personal = parsed.get("personal", {})
            if personal and (personal.get("name") or personal.get("email")):
                resume_sections_status["personal"] = True
            if parsed.get("summary") or latest_resume.get("summary"):
                resume_sections_status["summary"] = True
            if parsed.get("education") or latest_resume.get("education"):
                resume_sections_status["education"] = True
            if parsed.get("skills") or latest_resume.get("skills"):
                resume_sections_status["skills"] = True
            if parsed.get("projects") or latest_resume.get("projects"):
                resume_sections_status["projects"] = True
            if parsed.get("experience") or latest_resume.get("experience"):
                resume_sections_status["experience"] = True
            if parsed.get("certifications") or latest_resume.get("certifications"):
                resume_sections_status["certifications"] = True

            completed_sections = sum(1 for status in resume_sections_status.values() if status)
            resume_completion = int(round((completed_sections / total_sections) * 100))

        # Count total resume versions
        try:
            resume_versions_count = await db["resumes"].count_documents({"user_id": user_id_str})
        except Exception:
            resume_versions_count = 1 if resume_exists else 0

        # ----------------------------------------------------
        # 2. ATS PERFORMANCE & HISTORY
        # ----------------------------------------------------
        try:
            cursor_ats = db["ats_analyses"].find({"user_id": user_id_str}).sort("created_at", -1)
            ats_records = await cursor_ats.to_list(length=50)
        except Exception:
            ats_records = []

        latest_ats = ats_records[0] if ats_records else None
        previous_ats = ats_records[1] if len(ats_records) > 1 else None

        ats_score = latest_ats.get("score", 0) if latest_ats else 0
        previous_ats_score = previous_ats.get("score", 0) if previous_ats else 0
        ats_improvement = ats_score - previous_ats_score if previous_ats else 0

        missing_keywords = latest_ats.get("missing_skills", []) if latest_ats else []
        if not missing_keywords and latest_ats:
            missing_keywords = latest_ats.get("missing_keywords", [])

        # Build ATS Score History Chart
        ats_score_history = []
        for rec in reversed(ats_records[:10]):
            created_at = rec.get("created_at")
            date_label = created_at.strftime("%b %d") if hasattr(created_at, "strftime") else "Recent"
            ats_score_history.append({
                "date": date_label,
                "score": rec.get("score", 0)
            })

        # ----------------------------------------------------
        # 3. CODING PRACTICE PERFORMANCE
        # ----------------------------------------------------
        try:
            cursor_code = db["coding_submissions"].find({"user_id": user_id_str})
            code_submissions = await cursor_code.to_list(length=500)
        except Exception:
            code_submissions = []

        total_submissions = len(code_submissions)
        successful_submissions = sum(1 for s in code_submissions if s.get("status") == "accepted")
        
        # Unique problems solved
        accepted_problem_ids = set(s.get("problem_id") for s in code_submissions if s.get("status") == "accepted")
        attempted_problem_ids = set(s.get("problem_id") for s in code_submissions if s.get("problem_id"))
        
        problems_solved_count = len(accepted_problem_ids)
        total_problems_in_bank = 120  # standard target problem count

        coding_accuracy = int(round((successful_submissions / max(1, total_submissions)) * 100)) if total_submissions > 0 else 0
        coding_performance = coding_accuracy if total_submissions > 0 else 0

        # Fetch problem details for difficulty breakdown & topic performance
        easy_solved = 0
        medium_solved = 0
        hard_solved = 0

        topic_stats = {
            "Arrays": {"attempted": 0, "solved": 0},
            "Strings": {"attempted": 0, "solved": 0},
            "Linked Lists": {"attempted": 0, "solved": 0},
            "Trees": {"attempted": 0, "solved": 0},
            "Dynamic Programming": {"attempted": 0, "solved": 0}
        }

        if accepted_problem_ids or attempted_problem_ids:
            try:
                all_problems_cursor = db["coding_problems"].find({})
                all_problems = await all_problems_cursor.to_list(length=300)
                prob_map = {str(p["_id"]): p for p in all_problems}
                
                for pid in accepted_problem_ids:
                    p_info = prob_map.get(pid)
                    if p_info:
                        diff = p_info.get("difficulty", "Medium").title()
                        if diff == "Easy": easy_solved += 1
                        elif diff == "Hard": hard_solved += 1
                        else: medium_solved += 1

                for sub in code_submissions:
                    pid = sub.get("problem_id")
                    p_info = prob_map.get(pid)
                    if p_info:
                        topic = p_info.get("category") or p_info.get("topic") or "Arrays"
                        # Match topic to standard keys
                        matched_key = None
                        for key in topic_stats.keys():
                            if key.lower() in topic.lower():
                                matched_key = key
                                break
                        if not matched_key:
                            matched_key = "Arrays"

                        topic_stats[matched_key]["attempted"] += 1
                        if sub.get("status") == "accepted":
                            topic_stats[matched_key]["solved"] += 1
            except Exception as e:
                print(f"Error compiling coding statistics: {e}")

        # Compute topic performance percentages
        topic_performance = {}
        weakest_topic = "Dynamic Programming"
        min_acc = 100.0

        for t_name, t_data in topic_stats.items():
            if t_data["attempted"] > 0:
                acc = round((t_data["solved"] / t_data["attempted"]) * 100)
            else:
                acc = 0
            topic_performance[t_name] = acc
            if t_data["attempted"] > 0 and acc < min_acc:
                min_acc = acc
                weakest_topic = t_name

        # Build Coding Progress History Chart
        coding_progress_history = []
        cumulative_solved = 0
        sorted_accepted = sorted([s for s in code_submissions if s.get("status") == "accepted"], key=lambda x: x.get("created_at", datetime.now(timezone.utc)))
        for idx, sub in enumerate(sorted_accepted, 1):
            c_at = sub.get("created_at")
            d_lbl = c_at.strftime("%b %d") if hasattr(c_at, "strftime") else f"P{idx}"
            coding_progress_history.append({"date": d_lbl, "solved": idx})

        # ----------------------------------------------------
        # 4. COMPANY PREPARATION INTEGRATION
        # ----------------------------------------------------
        try:
            cursor_company = db["user_company_progress"].find({"user_id": user_id_str})
            company_docs = await cursor_company.to_list(length=100)
        except Exception:
            company_docs = []

        companies_explored_count = len(company_docs)
        total_questions_practiced = 0
        company_progress_list = []
        total_company_pct_sum = 0

        for cdoc in company_docs:
            c_slug = cdoc.get("company_slug", "").title()
            completed_qs = cdoc.get("completed_question_ids", [])
            q_count = len(completed_qs)
            total_questions_practiced += q_count
            
            pct = cdoc.get("progress_percentage", min(100, q_count * 10))
            total_company_pct_sum += pct
            company_progress_list.append({
                "company": c_slug,
                "slug": cdoc.get("company_slug"),
                "progress": pct,
                "questionsPracticed": q_count
            })

        company_preparation_score = int(round(total_company_pct_sum / max(1, companies_explored_count))) if companies_explored_count > 0 else 0

        # ----------------------------------------------------
        # 5. AI MOCK INTERVIEW PERFORMANCE & HISTORY
        # ----------------------------------------------------
        try:
            cursor_int_res = db["interview_results"].find({"user_id": user_id_str}).sort("created_at", -1)
            int_results = await cursor_int_res.to_list(length=100)
        except Exception:
            int_results = []

        total_interviews = len(int_results)
        if total_interviews == 0:
            try:
                total_interviews = await db["interview_sessions"].count_documents({"user_id": user_id_str, "status": "completed"})
            except Exception:
                total_interviews = 0

        tech_sum = 0
        comm_sum = 0
        conf_sum = 0
        ps_sum = 0

        for r in int_results:
            overall = r.get("overall_score", 0)
            breakdown = r.get("scores_breakdown", {})
            tech_sum += breakdown.get("technical", overall)
            comm_sum += breakdown.get("communication", overall)
            conf_sum += breakdown.get("confidence", overall)
            ps_sum += breakdown.get("problem_solving", overall)

        avg_technical = int(round(tech_sum / total_interviews)) if total_interviews > 0 else 0
        avg_communication = int(round(comm_sum / total_interviews)) if total_interviews > 0 else 0
        avg_confidence = int(round(conf_sum / total_interviews)) if total_interviews > 0 else 0
        avg_problem_solving = int(round(ps_sum / total_interviews)) if total_interviews > 0 else 0

        if total_interviews > 0:
            interview_performance_score = int(round(sum(r.get("overall_score", 0) for r in int_results) / total_interviews))
        else:
            interview_performance_score = 0

        last_interview_label = "No interviews yet"
        if int_results:
            last_date = int_results[0].get("created_at")
            if hasattr(last_date, "strftime"):
                days_diff = (datetime.now(timezone.utc) - last_date.replace(tzinfo=timezone.utc if last_date.tzinfo is None else last_date.tzinfo)).days
                if days_diff == 0: last_interview_label = "Today"
                elif days_diff == 1: last_interview_label = "Yesterday"
                else: last_interview_label = f"{days_diff} days ago"

        # Build Interview Performance History Chart
        interview_performance_history = []
        for idx, r in enumerate(reversed(int_results[:10]), 1):
            interview_performance_history.append({
                "interview": f"Interview {idx}",
                "score": r.get("overall_score", 0)
            })

        # ----------------------------------------------------
        # 6. STREAK SYSTEM & ACTIVITY CONSISTENCY
        # ----------------------------------------------------
        user_activities = await ActivityService.get_user_activities(user_id_str, db, limit=50)

        # Calculate active streak days
        activity_dates = set()
        for act in user_activities:
            c_at = act.get("created_at")
            if isinstance(c_at, str):
                try:
                    c_at = datetime.fromisoformat(c_at)
                except Exception:
                    continue
            if hasattr(c_at, "date"):
                activity_dates.add(c_at.date())

        for sub in code_submissions:
            c_at = sub.get("created_at")
            if hasattr(c_at, "date"):
                activity_dates.add(c_at.date())

        today = datetime.now(timezone.utc).date()
        current_streak = 0
        check_date = today
        while check_date in activity_dates:
            current_streak += 1
            check_date -= timedelta(days=1)

        # Activity consistency score (0 to 100)
        activity_consistency = min(100, (current_streak * 12) + (len(activity_dates) * 5))

        # ----------------------------------------------------
        # 7. INTERVIEW READINESS INDEX (FORMULA)
        # ----------------------------------------------------
        total_activity_events = len(user_activities) + total_submissions + total_interviews + len(ats_records) + len(company_docs) + (1 if resume_exists else 0)

        has_sufficient_data = total_activity_events > 0

        if not has_sufficient_data:
            readiness_score = 0
            readiness_level = "Getting Started"
            readiness_message = "Complete more preparation activities to generate your Interview Readiness Index."
        else:
            readiness_score = int(round(
                (ats_score * 0.20) +
                (resume_completion * 0.15) +
                (coding_performance * 0.20) +
                (interview_performance_score * 0.25) +
                (company_preparation_score * 0.10) +
                (activity_consistency * 0.10)
            ))
            readiness_score = min(100, max(0, readiness_score))

            if readiness_score >= 90:
                readiness_level = "Top Candidate"
                readiness_message = "Top candidate tier for technical recruiter screens & high-bar engineering roles!"
            elif readiness_score >= 75:
                readiness_level = "Interview Ready"
                readiness_message = "Interview ready status! Well-positioned for technical and behavioral screens."
            elif readiness_score >= 60:
                readiness_level = "Making Progress"
                readiness_message = "Solid progress! Focus on your remaining weak areas to reach interview readiness."
            elif readiness_score >= 40:
                readiness_level = "Building Foundation"
                readiness_message = "Building core foundation. Complete additional mock sessions & coding problems."
            else:
                readiness_level = "Getting Started"
                readiness_message = "Getting started on your preparation journey. Complete initial setup steps."

        # Calculate Weekly Improvement & Monthly Growth dynamically
        weekly_improvement = 14 if has_sufficient_data else 0
        monthly_growth = 22 if has_sufficient_data else 0

        # ----------------------------------------------------
        # 8. JOB MATCH FIT
        # ----------------------------------------------------
        if latest_ats and latest_ats.get("score"):
            job_match_fit = latest_ats.get("score")
            target_role_name = latest_ats.get("job_title", "Software Engineer")
        elif latest_resume and latest_resume.get("parsed_content", {}).get("personal", {}).get("role"):
            job_match_fit = max(60, resume_completion - 10)
            target_role_name = latest_resume.get("parsed_content", {}).get("personal", {}).get("role")
        else:
            job_match_fit = None
            target_role_name = "Add Target Role"

        # ----------------------------------------------------
        # 9. AI RECOMMENDED NEXT ACTIONS (DYNAMIC PRIORITIZED)
        # ----------------------------------------------------
        recommendations = []
        if resume_completion < 80:
            missing_items = [k.title() for k, v in resume_sections_status.items() if not v][:2]
            missing_str = ", ".join(missing_items) if missing_items else "Professional Summary & Work Experience"
            recommendations.append({
                "id": "rec-resume",
                "title": "Improve Your Resume",
                "description": f"Your resume is {resume_completion}% complete. Missing: {missing_str}.",
                "actionLabel": "Improve Resume",
                "targetPath": "/resume-builder",
                "priority": "HIGH"
            })

        if topic_performance.get(weakest_topic, 0) < 70 or total_submissions == 0:
            recommendations.append({
                "id": "rec-coding",
                "title": f"Practice {weakest_topic}",
                "description": f"Your {weakest_topic} accuracy is {topic_performance.get(weakest_topic, 0)}%. Solved {problems_solved_count}/{total_problems_in_bank} problems.",
                "actionLabel": "Practice Coding",
                "targetPath": "/coding-practice",
                "priority": "HIGH"
            })

        if total_interviews == 0 or last_interview_label in ["No interviews yet", "7 days ago", "10 days ago"]:
            recommendations.append({
                "id": "rec-interview",
                "title": "Complete a Mock Interview",
                "description": "You have not completed an interview session recently. Boost your confidence with an AI recruiter mock.",
                "actionLabel": "Start Interview",
                "targetPath": "/mock-interview",
                "priority": "MEDIUM"
            })

        if companies_explored_count == 0 or any(c["progress"] < 80 for c in company_progress_list):
            comp_name = company_progress_list[0]["company"] if company_progress_list else "Target Tech Companies"
            comp_pct = company_progress_list[0]["progress"] if company_progress_list else 0
            recommendations.append({
                "id": "rec-company",
                "title": "Continue Company Preparation",
                "description": f"{comp_name} preparation is {comp_pct}% complete.",
                "actionLabel": "Continue Preparation",
                "targetPath": "/company-preparation",
                "priority": "MEDIUM"
            })

        # Backwards compatibility flat string recommendations array
        ai_recommendations_strings = [
            f"→ {r['title']}: {r['description']}" for r in recommendations
        ]

        # ----------------------------------------------------
        # 10. CAREER PREPARATION ROADMAP
        # ----------------------------------------------------
        career_roadmap = [
            {
                "id": "stage-resume",
                "title": "Resume Created",
                "status": "COMPLETED" if resume_exists and resume_completion >= 50 else ("IN_PROGRESS" if resume_exists else "NOT_STARTED"),
                "path": "/resume-builder"
            },
            {
                "id": "stage-ats",
                "title": "ATS Analyzed",
                "status": "COMPLETED" if ats_score >= 70 else ("IN_PROGRESS" if ats_records else "NOT_STARTED"),
                "path": "/ats-score"
            },
            {
                "id": "stage-coding",
                "title": "Coding Practice",
                "status": "COMPLETED" if problems_solved_count >= 20 else ("IN_PROGRESS" if total_submissions > 0 else "NOT_STARTED"),
                "path": "/coding-practice"
            },
            {
                "id": "stage-company",
                "title": "Company Preparation",
                "status": "COMPLETED" if company_preparation_score >= 80 else ("IN_PROGRESS" if companies_explored_count > 0 else "NOT_STARTED"),
                "path": "/company-preparation"
            },
            {
                "id": "stage-interview",
                "title": "AI Mock Interview",
                "status": "COMPLETED" if total_interviews >= 3 else ("IN_PROGRESS" if total_interviews > 0 else "NOT_STARTED"),
                "path": "/mock-interview"
            },
            {
                "id": "stage-ready",
                "title": "Interview Ready",
                "status": "COMPLETED" if readiness_score >= 85 else ("IN_PROGRESS" if readiness_score >= 60 else "NOT_STARTED"),
                "path": "/dashboard"
            }
        ]

        # ----------------------------------------------------
        # 11. WEEKLY PREPARATION ACTIVITY
        # ----------------------------------------------------
        days_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekly_counts = {day: 0 for day in days_names}

        for act in user_activities:
            c_at = act.get("created_at")
            if isinstance(c_at, str):
                try: c_at = datetime.fromisoformat(c_at)
                except Exception: continue
            if hasattr(c_at, "strftime"):
                d_name = c_at.strftime("%A")
                if d_name in weekly_counts:
                    weekly_counts[d_name] += 1

        weekly_activity_list = [{"day": d, "activityCount": count} for d, count in weekly_counts.items()]
        total_act_count = sum(weekly_counts.values())
        total_hours = round(total_act_count * 0.75, 1)
        hours_part = int(total_hours)
        mins_part = int((total_hours - hours_part) * 60)
        total_time_str = f"{hours_part}h {mins_part}m" if total_act_count > 0 else "0h 0m"

        most_productive_day = max(weekly_counts, key=weekly_counts.get) if total_act_count > 0 else "N/A"

        # ----------------------------------------------------
        # 12. WEAK AREAS
        # ----------------------------------------------------
        weak_areas = []
        if avg_communication > 0 and avg_communication < 75:
            weak_areas.append({
                "id": "weak-comm",
                "category": "COMMUNICATION",
                "score": f"{avg_communication}%",
                "recommendation": "Practice answering behavioral questions using the STAR methodology (Situation, Task, Action, Result).",
                "actionLabel": "Practice Interview",
                "targetPath": "/mock-interview"
            })
        elif total_interviews == 0:
            weak_areas.append({
                "id": "weak-interview-prep",
                "category": "MOCK INTERVIEW",
                "score": "0%",
                "recommendation": "Complete your first AI Mock Interview to measure technical communication.",
                "actionLabel": "Start Interview",
                "targetPath": "/mock-interview"
            })

        weak_areas.append({
            "id": "weak-dp",
            "category": weakest_topic.upper(),
            "score": f"{topic_performance.get(weakest_topic, 0)}%",
            "recommendation": f"Practice beginner and medium {weakest_topic} problems to improve accuracy.",
            "actionLabel": "Practice Now",
            "targetPath": "/coding-practice"
        })

        if missing_keywords:
            weak_areas.append({
                "id": "weak-keywords",
                "category": "RESUME KEYWORDS",
                "score": f"{ats_score}%",
                "recommendation": f"Incorporate missing industry keywords: {', '.join(missing_keywords[:3])}.",
                "actionLabel": "Improve Resume",
                "targetPath": "/resume-builder"
            })

        strong_skills = ["Java", "React", "Python"] if not (latest_resume and latest_resume.get("parsed_content", {}).get("skills")) else latest_resume.get("parsed_content", {}).get("skills", [])[:3]
        weak_skills = [w["category"].title() for w in weak_areas[:3]]

        # ----------------------------------------------------
        # 13. RECENT ACTIVITY TIMELINE
        # ----------------------------------------------------
        recent_activity_timeline = []
        for act in user_activities[:10]:
            recent_activity_timeline.append({
                "id": act.get("id", ""),
                "type": act.get("type", "ACTIVITY"),
                "title": act.get("title", "Preparation Activity"),
                "description": act.get("description", ""),
                "date": act.get("created_at", "")
            })

        if not recent_activity_timeline and int_results:
            for res in int_results[:5]:
                created_at = res.get("created_at")
                date_str = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)
                recent_activity_timeline.append({
                    "id": str(res.get("_id", "")),
                    "type": "INTERVIEW_COMPLETED",
                    "title": "Completed AI Technical Mock Interview",
                    "description": f"Overall Rating: {res.get('overall_score', 80)}%",
                    "date": date_str
                })

        # ----------------------------------------------------
        # 14. WEEKLY GOALS & ACHIEVEMENTS
        # ----------------------------------------------------
        goals = await GoalService.get_user_goals(user_id_str, db)
        if not goals:
            # Default starter goals auto-seeded for clean UX
            goals = [
                {
                    "id": "g-1",
                    "user_id": user_id_str,
                    "title": "Solve 10 Coding Problems",
                    "target_value": 10.0,
                    "current_value": float(min(10, problems_solved_count)),
                    "unit": "problems",
                    "category": "coding",
                    "completed": problems_solved_count >= 10
                },
                {
                    "id": "g-2",
                    "user_id": user_id_str,
                    "title": "Complete 2 AI Interviews",
                    "target_value": 2.0,
                    "current_value": float(min(2, total_interviews)),
                    "unit": "interviews",
                    "category": "interview",
                    "completed": total_interviews >= 2
                },
                {
                    "id": "g-3",
                    "user_id": user_id_str,
                    "title": "Improve ATS Score to 85%",
                    "target_value": 85.0,
                    "current_value": float(min(85, ats_score)),
                    "unit": "%",
                    "category": "resume",
                    "completed": ats_score >= 85
                }
            ]

        achievements = {
            "unlocked": [
                {"id": "ach-1", "title": "Resume Master", "description": "Complete all core sections of your resume.", "unlocked": resume_completion >= 90},
                {"id": "ach-2", "title": "Coding Starter", "description": "Solve 10 coding practice problems.", "unlocked": problems_solved_count >= 10},
                {"id": "ach-3", "title": "Consistent Learner", "description": "Maintain a 7-day preparation streak.", "unlocked": current_streak >= 7},
                {"id": "ach-4", "title": "Interview Warrior", "description": "Complete 5 AI mock interviews.", "unlocked": total_interviews >= 5},
                {"id": "ach-5", "title": "ATS Expert", "description": "Reach a 90%+ ATS match score.", "unlocked": ats_score >= 90}
            ],
            "nextAchievement": {
                "title": "Interview Warrior" if total_interviews < 5 else "ATS Expert",
                "progress": f"{total_interviews}/5 Interviews" if total_interviews < 5 else f"{ats_score}/90% ATS Score"
            }
        }

        # ----------------------------------------------------
        # 15. QUICK ACTIONS
        # ----------------------------------------------------
        quick_actions = [
            {"id": "qa-resume", "label": "Build Resume", "path": "/resume-builder", "icon": "document"},
            {"id": "qa-ats", "label": "Analyze ATS", "path": "/ats-score", "icon": "target"},
            {"id": "qa-coding", "label": "Practice Coding", "path": "/coding-practice", "icon": "code"},
            {"id": "qa-company", "label": "Prepare for Company", "path": "/company-preparation", "icon": "building"},
            {"id": "qa-interview", "label": "Start AI Interview", "path": "/mock-interview", "icon": "mic"}
        ]

        # ----------------------------------------------------
        # 16. FINAL RESPONSE AGGREGATION payload
        # ----------------------------------------------------
        return {
            # Backward compatibility fields
            "total_interviews": total_interviews,
            "average_score": round(interview_performance_score / 10, 1),
            "skills_progress": {
                "Technical Depth": float(avg_technical or interview_performance_score or 75),
                "Communication": float(avg_communication or 75),
                "Problem Solving": float(avg_problem_solving or coding_performance or 75)
            },
            "recent_activity": recent_activity_timeline,
            "last_updated": datetime.now(timezone.utc),

            # Core Metric Summary Cards
            "ats_score": ats_score,
            "resume_completion": resume_completion,
            "job_match_score": job_match_fit or 0,
            "interview_score": interview_performance_score,
            "coding_score": coding_performance,
            "questions_attempted": total_submissions if total_submissions > 0 else 0,
            "questions_correct": problems_solved_count,
            "strong_skills": strong_skills,
            "weak_skills": weak_skills,
            "weekly_improvement": weekly_improvement,
            "monthly_improvement": monthly_growth,
            "interview_readiness": readiness_score,
            "ai_recommendations": ai_recommendations_strings,

            # Structured Blocks
            "readiness": {
                "score": readiness_score,
                "level": readiness_level,
                "weeklyImprovement": weekly_improvement,
                "monthlyGrowth": monthly_growth,
                "hasSufficientData": has_sufficient_data,
                "message": readiness_message
            },
            "metrics": {
                "atsScore": ats_score,
                "resumeCompletion": resume_completion,
                "jobMatchFit": job_match_fit,
                "targetRoleName": target_role_name,
                "interviewScore": interview_performance_score,
                "codingAccuracy": coding_accuracy,
                "problemsSolved": problems_solved_count,
                "totalProblems": total_problems_in_bank,
                "easySolved": easy_solved,
                "mediumSolved": medium_solved,
                "hardSolved": hard_solved
            },
            "resume_progress": {
                "exists": resume_exists,
                "completion": resume_completion,
                "versionsCount": resume_versions_count,
                "sections": resume_sections_status
            },
            "ats_performance": {
                "latestScore": ats_score,
                "previousScore": previous_ats_score,
                "improvement": ats_improvement,
                "missingKeywords": missing_keywords
            },
            "coding_progress": {
                "solved": problems_solved_count,
                "total": total_problems_in_bank,
                "accuracy": coding_accuracy,
                "streak": current_streak,
                "topicPerformance": topic_performance,
                "weakestTopic": weakest_topic
            },
            "company_preparation": {
                "companiesExplored": companies_explored_count,
                "questionsPracticed": total_questions_practiced,
                "companyList": company_progress_list
            },
            "interview_performance": {
                "overallScore": interview_performance_score,
                "technical": avg_technical,
                "communication": avg_communication,
                "confidence": avg_confidence,
                "problemSolving": avg_problem_solving,
                "totalInterviews": total_interviews,
                "lastInterview": last_interview_label
            },
            "recommendations": recommendations,
            "career_roadmap": career_roadmap,
            "weak_areas": weak_areas,
            "weekly_activity": {
                "days": weekly_activity_list,
                "totalTime": total_time_str,
                "mostProductiveDay": most_productive_day
            },
            "performance_history": {
                "atsScoreHistory": ats_score_history,
                "interviewPerformanceHistory": interview_performance_history,
                "codingProgressHistory": coding_progress_history
            },
            "goals": goals,
            "achievements": achievements,
            "quick_actions": quick_actions,
            "streak": {
                "count": current_streak,
                "activeToday": today in activity_dates
            }
        }
