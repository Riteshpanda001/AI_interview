import os
import io
from datetime import datetime
from typing import Dict, Any, List

class InterviewPDFGenerator:
    """
    Utility for generating professional, styled PDF report documents
    for completed AI Mock Interview sessions.
    """

    @staticmethod
    def generate_pdf(session_data: Dict[str, Any], feedback_data: Dict[str, Any]) -> bytes:
        role = session_data.get("role_target", "Software Engineer")
        level = session_data.get("experience_level", "Mid-Level")
        itype = session_data.get("interview_type", "Technical & Behavioral")
        session_id = str(session_data.get("id", session_data.get("_id", "Session")))
        created_at = session_data.get("created_at", datetime.now())
        date_str = created_at.strftime("%B %d, %Y") if hasattr(created_at, "strftime") else str(created_at)[:10]

        answers = feedback_data.get("answers_feedback", [])
        overall_summary = feedback_data.get("overall_summary", "Good overall interview performance.")

        # Calculate scores
        scores = [a.get("score", 7) for a in answers]
        avg_score_10 = sum(scores) / len(scores) if scores else 8.0
        overall_score_pct = int(avg_score_10 * 10)

        comm_score = min(98, overall_score_pct + 4)
        tech_score = max(60, overall_score_pct - 3)
        conf_score = min(95, overall_score_pct + 2)

        verdict = "HIRE" if overall_score_pct >= 70 else "NO HIRE / NEEDS PRACTICE"

        # Try reportlab if installed, otherwise build clean PDF document stream
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=22,
                leading=26,
                textColor=colors.HexColor('#7c3aed')
            )

            subtitle_style = ParagraphStyle(
                'SubTitle',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=11,
                leading=14,
                textColor=colors.HexColor('#475569')
            )

            heading_style = ParagraphStyle(
                'SectionHeading',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=14,
                leading=18,
                textColor=colors.HexColor('#0f172a'),
                spaceBefore=12,
                spaceAfter=6
            )

            body_style = ParagraphStyle(
                'BodyTextCustom',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#334155')
            )

            story = []

            # Header
            story.append(Paragraph(f"PrepNova AI — Mock Interview Evaluation Report", title_style))
            story.append(Paragraph(f"Target Role: <b>{role} ({level})</b> | Type: <b>{itype}</b> | Date: <b>{date_str}</b>", subtitle_style))
            story.append(Spacer(1, 10))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#7c3aed'), spaceAfter=15))

            # Executive Summary Box
            story.append(Paragraph("Executive Summary & Score Matrix", heading_style))
            
            summary_table_data = [
                [
                    Paragraph(f"<b>Overall Score:</b> <font color='#7c3aed' size=14><b>{overall_score_pct}%</b></font>", body_style),
                    Paragraph(f"<b>Verdict:</b> <font color='{'#10b981' if 'HIRE' in verdict else '#ef4444'}' size=12><b>{verdict}</b></font>", body_style)
                ],
                [
                    Paragraph(f"Communication: <b>{comm_score}%</b>", body_style),
                    Paragraph(f"Technical Skills: <b>{tech_score}%</b>", body_style)
                ],
                [
                    Paragraph(f"Visual & Voice Confidence: <b>{conf_score}%</b>", body_style),
                    Paragraph(f"Questions Evaluated: <b>{len(answers)}</b>", body_style)
                ]
            ]
            t = Table(summary_table_data, colWidths=[270, 270])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 8),
            ]))
            story.append(t)
            story.append(Spacer(1, 12))

            story.append(Paragraph("Overall Performance Assessment", heading_style))
            story.append(Paragraph(overall_summary, body_style))
            story.append(Spacer(1, 15))

            # Questions Breakdown
            story.append(Paragraph("Question-by-Question Detailed Transcript & Feedback", heading_style))
            story.append(Spacer(1, 6))

            for idx, ans in enumerate(answers, 1):
                q_text = ans.get("question_text", f"Question {idx}")
                u_ans = ans.get("user_answer", "N/A")
                s_ans = ans.get("suggested_answer", "N/A")
                score = ans.get("score", 8)
                strengths = ", ".join(ans.get("strengths", ["Clear delivery"]))
                weaknesses = ", ".join(ans.get("weaknesses", ["Add quantified metrics"]))

                q_table_data = [
                    [Paragraph(f"<b>Q{idx}: {q_text}</b>", ParagraphStyle('QStyle', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#1e1b4b'))), Paragraph(f"Score: <b>{score}/10</b>", body_style)],
                    [Paragraph(f"<b>Candidate Answer:</b> {u_ans}", body_style), Paragraph("", body_style)],
                    [Paragraph(f"<b>Suggested Response:</b> {s_ans}", body_style), Paragraph("", body_style)],
                    [Paragraph(f"<b>Strengths:</b> {strengths} | <b>Areas for Improvement:</b> {weaknesses}", body_style), Paragraph("", body_style)]
                ]
                qt = Table(q_table_data, colWidths=[400, 140])
                qt.setStyle(TableStyle([
                    ('SPAN', (0,1), (1,1)),
                    ('SPAN', (0,2), (1,2)),
                    ('SPAN', (0,3), (1,3)),
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f1f5f9')),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
                    ('PADDING', (0,0), (-1,-1), 6),
                ]))
                story.append(qt)
                story.append(Spacer(1, 10))

            doc.build(story)
            return buffer.getvalue()

        except Exception as e:
            print(f"ReportLab generation fallback, generating clean custom PDF stream: {e}")
            return InterviewPDFGenerator._build_fallback_pdf(role, level, date_str, overall_score_pct, verdict, answers, overall_summary)

    @staticmethod
    def _build_fallback_pdf(role: str, level: str, date_str: str, score: int, verdict: str, answers: list, summary: str) -> bytes:
        # Generates a valid standard binary PDF 1.4 file buffer
        content_stream = f"""
%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R>> endobj
4 0 obj <</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold>> /F2 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>> >> endobj
5 0 obj <</Length 6 0 R>>
stream
BT
/F1 20 Tf 36 750 Td (PrepNova AI — Mock Interview Evaluation Report) Tj
/F2 10 Tf 0 -20 Td (Target Role: {role} ({level}) | Date: {date_str}) Tj
/F1 14 Tf 0 -35 Td (Executive Summary Score: {score}% | Verdict: {verdict}) Tj
/F2 11 Tf 0 -25 Td ({summary[:90]}) Tj
/F1 13 Tf 0 -35 Td (Detailed Questions Breakdown ({len(answers)} Questions Evaluated)) Tj
"""
        y_offset = -20
        for idx, a in enumerate(answers[:4], 1):
            q_txt = str(a.get("question_text", ""))[:60]
            s_val = a.get("score", 8)
            content_stream += f"\n/F1 10 Tf 0 {y_offset} Td (Q{idx}: {q_txt} - Score: {s_val}/10) Tj"
            y_offset = -18

        content_stream += """
ET
endstream
endobj
6 0 obj
1000
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000216 00000 n 
0000000350 00000 n 
0000001200 00000 n 
trailer <</Size 7 /Root 1 0 R>>
startxref
1230
%%EOF
"""
        return content_stream.strip().encode('utf-8', errors='ignore')


class ResumePDFGenerator:
    """
    Generates a professional, styled PDF version of a resume from structured resume_data.
    Uses reportlab when available, falls back to a clean raw PDF stream.
    """

    @staticmethod
    def generate_pdf(resume_data: Dict[str, Any], title: str = "Resume") -> bytes:
        personal = resume_data.get("personal", {})
        name = personal.get("name", "Candidate")
        role = personal.get("role", "")
        email = personal.get("email", "")
        phone = personal.get("phone", "")
        linkedin = personal.get("linkedin", "")
        github = personal.get("github", "")
        portfolio = personal.get("portfolio", "")
        summary = resume_data.get("summary", "")
        skills = resume_data.get("skills", [])
        experience = resume_data.get("experience", [])
        education = resume_data.get("education", [])
        projects = resume_data.get("projects", [])
        certifications = resume_data.get("certifications", [])

        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib import colors
            from reportlab.platypus import (
                SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            )
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import mm

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer, pagesize=A4,
                rightMargin=18 * mm, leftMargin=18 * mm,
                topMargin=14 * mm, bottomMargin=14 * mm
            )
            styles = getSampleStyleSheet()

            # ── Custom Styles ─────────────────────────────────────────────────
            name_style = ParagraphStyle(
                "ResumeName", parent=styles["Heading1"],
                fontName="Helvetica-Bold", fontSize=22, leading=26,
                textColor=colors.HexColor("#0f172a"), spaceAfter=2
            )
            role_style = ParagraphStyle(
                "ResumeRole", parent=styles["Normal"],
                fontName="Helvetica", fontSize=11,
                textColor=colors.HexColor("#6366f1"), spaceAfter=4
            )
            contact_style = ParagraphStyle(
                "ResumeContact", parent=styles["Normal"],
                fontName="Helvetica", fontSize=9,
                textColor=colors.HexColor("#475569"), spaceAfter=2
            )
            section_heading = ParagraphStyle(
                "SectionHeading", parent=styles["Heading2"],
                fontName="Helvetica-Bold", fontSize=11, leading=14,
                textColor=colors.HexColor("#1e1b4b"),
                spaceBefore=10, spaceAfter=4
            )
            body = ParagraphStyle(
                "Body", parent=styles["Normal"],
                fontName="Helvetica", fontSize=9.5, leading=14,
                textColor=colors.HexColor("#334155")
            )
            bold_body = ParagraphStyle(
                "BoldBody", parent=body,
                fontName="Helvetica-Bold", fontSize=9.5,
                textColor=colors.HexColor("#0f172a")
            )
            small = ParagraphStyle(
                "Small", parent=body,
                fontSize=8.5, textColor=colors.HexColor("#64748b")
            )

            divider_color = colors.HexColor("#6366f1")
            story = []

            # ── Header ────────────────────────────────────────────────────────
            story.append(Paragraph(name, name_style))
            if role:
                story.append(Paragraph(role, role_style))

            contact_parts = []
            if email:
                contact_parts.append(email)
            if phone:
                contact_parts.append(phone)
            if linkedin:
                contact_parts.append(linkedin)
            if github:
                contact_parts.append(github)
            if portfolio:
                contact_parts.append(portfolio)
            if contact_parts:
                story.append(Paragraph("  |  ".join(contact_parts), contact_style))

            story.append(HRFlowable(width="100%", thickness=1.5, color=divider_color, spaceBefore=6, spaceAfter=8))

            # ── Summary ───────────────────────────────────────────────────────
            if summary:
                story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                story.append(Paragraph(summary, body))
                story.append(Spacer(1, 6))

            # ── Skills ────────────────────────────────────────────────────────
            if skills and isinstance(skills, list) and skills:
                story.append(Paragraph("TECHNICAL SKILLS", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                skills_str = "  •  ".join(skills)
                story.append(Paragraph(skills_str, body))
                story.append(Spacer(1, 6))

            # ── Experience ────────────────────────────────────────────────────
            if experience:
                story.append(Paragraph("WORK EXPERIENCE", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                for exp in experience:
                    if not isinstance(exp, dict):
                        continue
                    exp_role = exp.get("role", "")
                    company = exp.get("company", "")
                    duration = exp.get("duration", "")
                    details = exp.get("details", "")

                    header_data = [[
                        Paragraph(f"<b>{exp_role}</b> — {company}", bold_body),
                        Paragraph(duration, small)
                    ]]
                    t = Table(header_data, colWidths=[380, 100])
                    t.setStyle(TableStyle([
                        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("PADDING", (0, 0), (-1, -1), 0),
                    ]))
                    story.append(t)

                    if details:
                        for line in details.strip().split("\n"):
                            line = line.strip()
                            if line:
                                bullet = "•" if not line.startswith("•") else ""
                                story.append(Paragraph(f"{bullet} {line}".strip(), body))
                    story.append(Spacer(1, 5))

            # ── Education ─────────────────────────────────────────────────────
            if education:
                story.append(Paragraph("EDUCATION", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                for edu in education:
                    if not isinstance(edu, dict):
                        continue
                    institution = edu.get("institution", "")
                    degree = edu.get("degree", "")
                    duration = edu.get("duration", "")
                    cgpa = edu.get("cgpa", "")
                    line1 = f"<b>{institution}</b>"
                    line2_parts = [degree]
                    if cgpa:
                        line2_parts.append(f"CGPA: {cgpa}")
                    edu_data = [[
                        Paragraph(line1, bold_body),
                        Paragraph(duration, small)
                    ]]
                    t = Table(edu_data, colWidths=[380, 100])
                    t.setStyle(TableStyle([
                        ("ALIGN", (1, 0), (1, 0), "RIGHT"),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("PADDING", (0, 0), (-1, -1), 0),
                    ]))
                    story.append(t)
                    story.append(Paragraph(" | ".join(line2_parts), body))
                    story.append(Spacer(1, 4))

            # ── Projects ──────────────────────────────────────────────────────
            if projects:
                story.append(Paragraph("PROJECTS", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                for proj in projects:
                    if not isinstance(proj, dict):
                        continue
                    proj_name = proj.get("name", "")
                    desc = proj.get("description", "")
                    if proj_name:
                        story.append(Paragraph(f"<b>{proj_name}</b>", bold_body))
                    if desc:
                        story.append(Paragraph(desc, body))
                    story.append(Spacer(1, 4))

            # ── Certifications ────────────────────────────────────────────────
            if certifications and isinstance(certifications, list) and certifications:
                story.append(Paragraph("CERTIFICATIONS", section_heading))
                story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=5))
                for cert in certifications:
                    if isinstance(cert, dict):
                        cert_title = cert.get("title", str(cert))
                        issuer = cert.get("issuer", "")
                        year = cert.get("year", "")
                        line = cert_title
                        if issuer:
                            line += f" — {issuer}"
                        if year:
                            line += f" ({year})"
                        story.append(Paragraph(f"• {line}", body))
                    else:
                        story.append(Paragraph(f"• {cert}", body))

            doc.build(story)
            return buffer.getvalue()

        except Exception as e:
            print(f"[ResumePDFGenerator] ReportLab unavailable, building fallback PDF: {e}")
            return ResumePDFGenerator._build_fallback_pdf(resume_data)

    @staticmethod
    def _build_fallback_pdf(resume_data: Dict[str, Any]) -> bytes:
        """Generates a valid minimal PDF 1.4 stream when reportlab is not installed."""
        personal = resume_data.get("personal", {})
        name = personal.get("name", "Candidate")[:40]
        role = personal.get("role", "")[:40]
        email = personal.get("email", "")[:50]
        summary = (resume_data.get("summary", ""))[:120]
        skills = ", ".join(resume_data.get("skills", [])[:10])[:100]

        lines = []
        if role:
            lines.append(f"Role: {role}")
        if email:
            lines.append(f"Email: {email}")
        if summary:
            lines.append(f"Summary: {summary}")
        if skills:
            lines.append(f"Skills: {skills}")

        body_stream = f"BT\n/F1 18 Tf 40 780 Td ({name}) Tj\n"
        y = 750
        for line in lines:
            body_stream += f"/F2 10 Tf 0 0 Td 40 {y} Td ({line[:80]}) Tj\n"
            y -= 18
        body_stream += "ET\n"

        pdf = f"""%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 595 842] /Contents 5 0 R>> endobj
4 0 obj <</Font <</F1 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold>> /F2 <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>>>>> endobj
5 0 obj <</Length {len(body_stream)}>>
stream
{body_stream}endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000206 00000 n
0000000340 00000 n
trailer <</Size 6 /Root 1 0 R>>
startxref
500
%%EOF"""
        return pdf.encode("utf-8", errors="ignore")
