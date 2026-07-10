import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FaMicrophone, FaChevronRight, FaTimes, FaTrophy, FaRobot, FaCheckCircle } from "react-icons/fa";

const API_BASE_URL = "http://localhost:8000/api";

const AIInterviewRoom = ({ interviewDetails }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Fallback offline mock questions
  const getOfflineQuestions = (type) => {
    const questionsList = {
      technical: [
        { question_id: "q1", text: "Can you explain the difference between a process and a thread?", type: "technical" },
        { question_id: "q2", text: "What are the core pillars of Object-Oriented Programming (OOP)?", type: "technical" },
        { question_id: "q3", text: "How does indexing work in database management systems to speed up queries?", type: "technical" },
        { question_id: "q4", text: "Explain the concept of a RESTful API and the common HTTP methods used.", type: "technical" },
        { question_id: "q5", text: "What is time complexity, and how would you optimize an O(N^2) algorithm?", type: "technical" }
      ],
      behavioral: [
        { question_id: "q1", text: "Describe a challenging project you worked on. How did you handle the difficulties?", type: "behavioral" },
        { question_id: "q2", text: "Tell me about a time you had a conflict with a team member. How did you resolve it?", type: "behavioral" },
        { question_id: "q3", text: "Explain how you prioritize your tasks when dealing with multiple tight deadlines.", type: "behavioral" },
        { question_id: "q4", text: "Describe a time when you made a mistake at work. How did you handle the situation?", type: "behavioral" },
        { question_id: "q5", text: "Tell me about a project where you had to learn a new technology quickly. What was your approach?", type: "behavioral" }
      ],
      hr: [
        { question_id: "q1", text: "Tell me about yourself and why you are interested in this position.", type: "hr" },
        { question_id: "q2", text: "What do you consider to be your greatest professional strengths and weaknesses?", type: "hr" },
        { question_id: "q3", text: "Where do you see yourself in five years, and how does this role align with your goals?", type: "hr" },
        { question_id: "q4", text: "Why should we hire you over other candidates for this specific role?", type: "hr" },
        { question_id: "q5", text: "Do you have any questions for us regarding the company or the team culture?", type: "hr" }
      ]
    };
    return questionsList[type] || questionsList["technical"];
  };

  useEffect(() => {
    const startSession = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/interview/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            role_target: interviewDetails.role_target,
            interview_type: interviewDetails.interview_type,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSession(data);
        } else {
          throw new Error("Failed to start backend interview session");
        }
      } catch (err) {
        console.warn("Using offline simulated interview session:", err);
        setOfflineMode(true);
        setSession({
          id: "offline-session-123",
          role_target: interviewDetails.role_target,
          interview_type: interviewDetails.interview_type,
          questions: getOfflineQuestions(interviewDetails.interview_type),
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      startSession();
    }
  }, [token, interviewDetails]);

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;

    setSubmitting(true);
    const currentQuestion = session.questions[currentIdx];

    if (offlineMode) {
      // Simulate answer evaluations locally
      const simulatedScore = Math.floor(Math.random() * 25) + 70; // 70 to 94
      const simulatedQuestionFeedback = {
        question_id: currentQuestion.question_id,
        question_text: currentQuestion.text,
        user_answer: answerText,
        score: simulatedScore,
        strengths: [
          "Clear explanation of the core concept.",
          "Demonstrates practical reasoning and context."
        ],
        weaknesses: [
          "Could be more structurally complete.",
          "Missed some secondary optimizations."
        ],
        suggested_answer: `A great response should cover the definition, key components (e.g. structure/examples), and highlight real-world applications related to ${interviewDetails.role_target}.`
      };

      const updatedAnswersFeedback = feedbackReport
        ? [...feedbackReport.answers_feedback, simulatedQuestionFeedback]
        : [simulatedQuestionFeedback];

      setTimeout(() => {
        const isLastQuestion = currentIdx === session.questions.length - 1;
        const newReport = {
          id: session.id,
          interview_session_id: session.id,
          answers_feedback: updatedAnswersFeedback,
          overall_summary: "Simulated feedback score. Good overall communication, structure, and responsiveness. Continue practicing technical system design patterns.",
          created_at: new Date().toISOString()
        };

        setFeedbackReport(newReport);
        setSubmitting(false);

        if (isLastQuestion) {
          // Completed
        } else {
          setAnswerText("");
          setCurrentIdx(currentIdx + 1);
        }
      }, 1000);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/interview/${session.id}/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_id: currentQuestion.question_id,
            answer_text: answerText,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbackReport(data);

          const isLastQuestion = currentIdx === session.questions.length - 1;
          if (isLastQuestion) {
            // Completed
          } else {
            setAnswerText("");
            setCurrentIdx(currentIdx + 1);
          }
        } else {
          throw new Error("Failed to submit answer");
        }
      } catch (err) {
        console.error("Error submitting answer to backend API:", err);
        alert("Failed to submit answer to API. Continuing in simulation mode.");
        setOfflineMode(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #7c3aed",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px"
        }} />
        <h3 style={{ color: "#374151" }}>PrepNova AI is generating your custom questions...</h3>
      </div>
    );
  }

  // Handle final results display
  const isCompleted = feedbackReport && feedbackReport.answers_feedback.length === session.questions.length;
  if (isCompleted) {
    const scores = feedbackReport.answers_feedback.map(a => a.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return (
      <div style={{ fontFamily: "'Poppins', sans-serif" }}>
        {/* Header Results Summary */}
        <div style={{
          background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
          borderRadius: "24px",
          padding: "45px",
          color: "#ffffff",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(124,58,237,0.25)",
          marginBottom: "40px"
        }}>
          <FaTrophy style={{ fontSize: "56px", marginBottom: "15px", color: "#fcd34d" }} />
          <h1 style={{ fontSize: "36px", fontWeight: "700", marginBottom: "10px" }}>Interview Completed!</h1>
          <p style={{ fontSize: "16px", opacity: 0.9, maxWidth: "600px", margin: "0 auto 25px" }}>
            Great effort! Here is your AI assessment report for the <strong>{session.role_target}</strong> ({session.interview_type}) round.
          </p>

          <div style={{ display: "inline-flex", gap: "40px", background: "rgba(255,255,255,0.15)", padding: "18px 45px", borderRadius: "16px" }}>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "800" }}>{avgScore}%</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>Overall Score</div>
            </div>
            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)" }}></div>
            <div>
              <div style={{ fontSize: "32px", fontWeight: "800" }}>{avgScore >= 75 ? "Pass" : "Requires Practice"}</div>
              <div style={{ fontSize: "12px", opacity: 0.8 }}>Verdict</div>
            </div>
          </div>
        </div>

        {/* Detailed Question Feedbacks */}
        <h2 className="sectionTitle">Question-by-Question Evaluation</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "25px", marginBottom: "40px" }}>
          {feedbackReport.answers_feedback.map((item, index) => (
            <div key={index} style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 10px 25px rgba(0,0,0,.05)",
              borderLeft: "6px solid #7c3aed"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <h3 style={{ fontSize: "18px", color: "#7c3aed", fontWeight: "700" }}>Question {index + 1}</h3>
                <span style={{
                  background: item.score >= 80 ? "#ecfdf5" : item.score >= 60 ? "#fffbeb" : "#fef2f2",
                  color: item.score >= 80 ? "#10b981" : item.score >= 60 ? "#d97706" : "#ef4444",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}>
                  Score: {item.score}%
                </span>
              </div>
              <p style={{ fontWeight: "600", color: "#1f2937", marginBottom: "15px", fontSize: "16px" }}>"{item.question_text}"</p>

              <div style={{ background: "#f9fafb", padding: "18px", borderRadius: "12px", marginBottom: "20px" }}>
                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>Your Answer</div>
                <p style={{ color: "#4b5563", fontSize: "14px", fontStyle: "italic" }}>"{item.user_answer}"</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <h4 style={{ color: "#10b981", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>Strengths</h4>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563" }}>
                    {item.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: "#ef4444", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>Weaknesses / Improvements</h4>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#4b5563" }}>
                    {item.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: "15px" }}>
                <h4 style={{ color: "#7c3aed", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>Suggested Answer Strategy</h4>
                <p style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6 }}>{item.suggested_answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Evaluation Summary */}
        <div style={{
          background: "#ffffff",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,.05)",
          marginBottom: "40px"
        }}>
          <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", marginBottom: "12px" }}>Overall AI Assessment Summary</h3>
          <p style={{ color: "#4b5563", lineHeight: 1.7 }}>{feedbackReport.overall_summary}</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "16px 40px",
              background: "#7c3aed",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(124,58,237,0.25)"
            }}
          >
            Start Another Session
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIdx];

  return (
    <div className="interviewRoom" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="interviewHeader">
        <div>
          <h2>AI Mock Interview Session</h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>
            Target: {session.role_target} ({session.interview_type} round)
          </p>
        </div>
        <div className="aiStatus">
          <div className="aiDot"></div>
          <span>AI Interviewer is Listening</span>
        </div>
      </div>

      {/* Progress Indicators */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "25px" }}>
        {session.questions.map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: "6px",
              borderRadius: "4px",
              background: index === currentIdx ? "#7c3aed" : index < currentIdx ? "#10b981" : "#e5e7eb",
              transition: "background 0.3s"
            }}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="questionCard">
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaRobot style={{ fontSize: "20px" }} />
          Question {currentIdx + 1} of {session.questions.length}
        </h3>
        <p style={{ fontSize: "18px", color: "#1f2937", lineHeight: 1.7, fontWeight: "500", marginTop: "10px" }}>
          "{currentQuestion.text}"
        </p>
      </div>

      {/* Answer Area */}
      <div className="answerBox">
        <textarea
          placeholder="Type your response here... Try to be detailed, clear, and structured (e.g. using STAR format for behavioral questions)."
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={submitting}
        />
      </div>

      {/* Actions */}
      <div className="interviewActions">
        <div style={{ display: "flex", gap: "10px", alignItems: "center", color: "#6b7280", fontSize: "14px" }}>
          <FaMicrophone /> Speech-to-text option available in Premium Plan
        </div>

        <button
          className="primaryBtn"
          onClick={handleSubmitAnswer}
          disabled={submitting || !answerText.trim()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: (submitting || !answerText.trim()) ? 0.6 : 1,
            cursor: (submitting || !answerText.trim()) ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? (
            <span>Analyzing...</span>
          ) : (
            <>
              {currentIdx === session.questions.length - 1 ? "Finish Interview" : "Submit & Next"}
              <FaChevronRight />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AIInterviewRoom;
