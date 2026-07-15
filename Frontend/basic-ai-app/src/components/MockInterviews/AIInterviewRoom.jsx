import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaMicrophone, FaChevronRight, FaTrophy, FaRobot, FaPlay, FaSpinner, FaComments } from "react-icons/fa";
import "./AIInterviewRoom.css";

const API_BASE_URL = "http://localhost:8000/api";

const AIInterviewRoom = ({ interviewDetails }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Speech states
  const [startedSpeech, setStartedSpeech] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // New chatbot-oriented states
  const [interimText, setInterimText] = useState("");
  const [isHandsFree, setIsHandsFree] = useState(true);
  const [showLiveTranscript, setShowLiveTranscript] = useState(false);
  const [interviewPhase, setInterviewPhase] = useState("welcome"); // "welcome", "introduction", "interview"

  // Refs to prevent stale closures in speech recognition events
  const isHandsFreeRef = useRef(isHandsFree);
  const answerTextRef = useRef(answerText);
  const submittingRef = useRef(submitting);
  const aiSpeakingRef = useRef(aiSpeaking);
  const sessionRef = useRef(session);
  const currentIdxRef = useRef(currentIdx);
  const interviewPhaseRef = useRef(interviewPhase);
  const silenceTimerRef = useRef(null);

  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);
  useEffect(() => { answerTextRef.current = answerText; }, [answerText]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { interviewPhaseRef.current = interviewPhase; }, [interviewPhase]);

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

  // Initialize speech recognition
  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;

      let langCode = "en-US";
      if (interviewDetails.language) {
        const langMap = {
          "English": "en-US",
          "Spanish": "es-ES",
          "French": "fr-FR",
          "German": "de-DE",
          "Hindi": "hi-IN"
        };
        langCode = langMap[interviewDetails.language] || "en-US";
      }
      rec.lang = langCode;

      rec.onresult = (event) => {
        let finalTranscript = "";
        let currentInterim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        let updatedAnswer = answerTextRef.current;
        if (finalTranscript) {
          updatedAnswer += finalTranscript;
          setAnswerText(updatedAnswer);
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        } else {
          setInterimText("");
        }

        // Silence detection: reset timer when user speaks. Trigger submit after 2.5s of silence.
        if (isHandsFreeRef.current && (finalTranscript || currentInterim)) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            const finalSpeechText = (updatedAnswer + " " + currentInterim).trim();
            if (finalSpeechText) {
              handleAutoSubmit(finalSpeechText);
            }
          }, 2500);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognitionInstance(rec);
    }
  }, [interviewDetails.language]);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Fetch / start backend interview session
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
            experience_level: interviewDetails.experience_level,
            language: interviewDetails.language,
            duration: interviewDetails.duration,
            difficulty: interviewDetails.difficulty,
            resume_id: interviewDetails.resume_id,
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
        const count = Math.max(3, Math.min(10, Math.round((interviewDetails.duration || 10) / 2)));
        setSession({
          id: "offline-session-123",
          role_target: interviewDetails.role_target,
          interview_type: interviewDetails.interview_type,
          questions: getOfflineQuestions(interviewDetails.interview_type).slice(0, count),
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      startSession();
    }
  }, [token, interviewDetails]);

  // Speak function
  const speakText = (text, onEndCallback) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    let langCode = "en-US";
    if (interviewDetails.language) {
      const langMap = {
        "English": "en-US",
        "Spanish": "es-ES",
        "French": "fr-FR",
        "German": "de-DE",
        "Hindi": "hi-IN"
      };
      langCode = langMap[interviewDetails.language] || "en-US";
    }

    utterance.lang = langCode;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(langCode)) || voices.find(v => v.lang.startsWith(langCode.split("-")[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakQuestion = (index) => {
    if (!session || !session.questions || !session.questions[index]) return;
    const questionText = session.questions[index].text;
    const lang = interviewDetails.language || "English";
    let qPrefix = `Question ${index + 1}: `;
    if (lang === "Spanish") qPrefix = `Pregunta ${index + 1}: `;
    else if (lang === "French") qPrefix = `Question ${index + 1}: `;
    else if (lang === "German") qPrefix = `Frage ${index + 1}: `;
    else if (lang === "Hindi") qPrefix = `प्रश्न ${index + 1}: `;

    setAiSpeaking(true);
    speakText(`${qPrefix} ${questionText}`, () => {
      setAiSpeaking(false);
      if (isHandsFreeRef.current) {
        startListeningAutomatically();
      }
    });
  };

  const handleBeginInterview = () => {
    setStartedSpeech(true);
    setAiSpeaking(true);

    const candidateName = user?.full_name ? user.full_name.split(" ")[0] : "Ritesh";
    const lang = interviewDetails.language || "English";
    
    let welcomeText = `Hello ${candidateName}, welcome to PrepNova AI. First, are you ready for the interview preparation?`;
    if (lang === "Spanish") welcomeText = `Hola ${candidateName}, bienvenido a PrepNova AI. En primer lugar, ¿estás listo para la preparación de la entrevista?`;
    else if (lang === "French") welcomeText = `Bonjour ${candidateName}, bienvenue chez PrepNova AI. Tout d'abord, êtes-vous prêt pour la préparation de l'entretien?`;
    else if (lang === "German") welcomeText = `Hallo ${candidateName}, willkommen bei PrepNova AI. Sind Sie zuerst bereit für die Interviewvorbereitung?`;
    else if (lang === "Hindi") welcomeText = `नमस्ते ${candidateName}, प्रेपनोवा एआई में आपका स्वागत है। सबसे पहले, क्या आप साक्षात्कार की तैयारी के लिए तैयार हैं?`;

    speakText(welcomeText, () => {
      setAiSpeaking(false);
      if (isHandsFreeRef.current) {
        startListeningAutomatically();
      }
    });
  };

  // Auto-trigger interview speech flow when session loads
  useEffect(() => {
    if (!loading && session && !startedSpeech) {
      handleBeginInterview();
    }
  }, [loading, session, startedSpeech]);

  const getTransitionMessage = (score) => {
    const lang = interviewDetails.language || "English";

    if (lang === "Spanish") {
      if (score >= 80) return "Excelente respuesta. Pasemos a la siguiente pregunta.";
      if (score >= 60) return "Buena respuesta. Pasemos a la siguiente pregunta.";
      return "Entendido. Pasemos a la siguiente pregunta.";
    }
    if (lang === "French") {
      if (score >= 80) return "Excellente réponse. Passons à la question suivante.";
      if (score >= 60) return "Bonne réponse. Passons à la question suivante.";
      return "D'accord. Passons à la question suivante.";
    }
    if (lang === "German") {
      if (score >= 80) return "Hervorragende Antwort. Gehen wir zur nächsten Frage über.";
      if (score >= 60) return "Gute Antwort. Gehen wir zur nächsten Frage über.";
      return "Verstanden. Gehen wir zur nächsten Frage über.";
    }
    if (lang === "Hindi") {
      if (score >= 80) return "बहुत बढ़िया उत्तर। चलिए अगले प्रश्न पर चलते हैं।";
      if (score >= 60) return "अच्छा उत्तर। चलिए अगले प्रश्न पर चलते हैं।";
      return "ठीक है। चलिए अगले प्रश्न पर चलते हैं।";
    }

    if (score >= 80) return "Excellent answer. Let's move to the next question.";
    if (score >= 60) return "Good answer. Let's move to the next question.";
    return "Got it. Let's move to the next question.";
  };

  const playTransitionAndNext = (score, isLast) => {
    const lang = interviewDetails.language || "English";
    let msg = getTransitionMessage(score);
    if (isLast) {
      if (lang === "Spanish") msg = "Entendido. La entrevista ha terminado. Generando reporte.";
      else if (lang === "French") msg = "D'accord. L'entretien est terminé. Génération du rapport.";
      else if (lang === "German") msg = "Verstanden. Das Interview ist beendet. Bericht wird erstellt.";
      else if (lang === "Hindi") msg = "ठीक है। साक्षात्कार समाप्त हो गया है। रिपोर्ट तैयार की जा रही है।";
      else msg = "Got it. The interview is completed. Let's check your results.";
    }

    setAiSpeaking(true);
    speakText(msg, () => {
      setAiSpeaking(false);
      if (isLast) {
        setShowReport(true);
      } else {
        setAnswerText("");
        setInterimText("");
        setCurrentIdx((prev) => {
          const nextIdx = prev + 1;
          speakQuestion(nextIdx);
          return nextIdx;
        });
      }
    });
  };

  const startListeningAutomatically = () => {
    if (!recognitionInstance) return;
    setAnswerText("");
    setInterimText("");
    try {
      setIsListening(true);
      recognitionInstance.start();
    } catch (e) {
      console.warn("Speech recognition is already running or failed to start:", e);
    }
  };

  const handleAutoSubmit = async (textToSubmit) => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionInstance) {
      try {
        recognitionInstance.stop();
      } catch (e) {
        console.warn("Failed to stop speech recognition:", e);
      }
    }
    setIsListening(false);
    await submitAnswer(textToSubmit);
  };

  const toggleListening = () => {
    if (!recognitionInstance) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      setAnswerText("");
      setInterimText("");
      setIsListening(true);
      try {
        recognitionInstance.start();
      } catch (e) {
        console.warn("Speech recognition failed to start:", e);
      }
    }
  };

  const submitAnswer = async (text) => {
    if (!text.trim()) return;

    if (interviewPhaseRef.current === "welcome") {
      setInterviewPhase("introduction");
      setAnswerText("");
      setInterimText("");
      
      setAiSpeaking(true);
      const lang = interviewDetails.language || "English";
      let introPrompt = "Great! Let's start. Every candidate preparing for an interview should first introduce themselves. Please introduce yourself.";
      if (lang === "Spanish") introPrompt = "¡Excelente! Empecemos. Cada candidato que se prepara para una entrevista debe presentarse primero. Por favor, preséntate.";
      else if (lang === "French") introPrompt = "Super! Commençons. Chaque candidat se préparant à un entretien doit d'abord se présenter. Veuillez vous présenter.";
      else if (lang === "German") introPrompt = "Großartig! Lass uns anfangen. Jeder Kandidat, der sich auf ein Vorstellungsgespräch vorbereitet, sollte sich zuerst selbst vorstellen. Bitte stellen Sie sich vor.";
      else if (lang === "Hindi") introPrompt = "बहुत बढ़िया! चलिए शुरू करते हैं। साक्षात्कार की तैयारी करने वाले प्रत्येक उम्मीदवार को सबसे पहले अपना परिचय देना चाहिए। कृपया अपना परिचय दें।";

      speakText(introPrompt, () => {
        setAiSpeaking(false);
        if (isHandsFreeRef.current) {
          startListeningAutomatically();
        }
      });
      return;
    }

    if (interviewPhaseRef.current === "introduction") {
      setInterviewPhase("interview");
      setAnswerText("");
      setInterimText("");
      speakQuestion(0);
      return;
    }

    setSubmitting(true);
    const currentQuestion = sessionRef.current.questions[currentIdxRef.current];

    if (offlineMode) {
      const simulatedScore = Math.floor(Math.random() * 25) + 70; // 70 to 94
      const simulatedQuestionFeedback = {
        question_id: currentQuestion.question_id,
        question_text: currentQuestion.text,
        user_answer: text,
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
        const isLastQuestion = currentIdxRef.current === sessionRef.current.questions.length - 1;
        const newReport = {
          id: sessionRef.current.id,
          interview_session_id: sessionRef.current.id,
          answers_feedback: updatedAnswersFeedback,
          overall_summary: "Simulated feedback score. Good overall communication, structure, and responsiveness. Continue practicing technical system design patterns.",
          created_at: new Date().toISOString()
        };

        setFeedbackReport(newReport);
        setSubmitting(false);
        setAnswerText("");
        setInterimText("");
        playTransitionAndNext(simulatedScore, isLastQuestion);
      }, 1000);
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/interview/${sessionRef.current.id}/answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_id: currentQuestion.question_id,
            answer_text: text,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setFeedbackReport(data);

          const isLastQuestion = currentIdxRef.current === sessionRef.current.questions.length - 1;
          const score = data.answers_feedback[data.answers_feedback.length - 1].score;
          setSubmitting(false);
          setAnswerText("");
          setInterimText("");
          playTransitionAndNext(score, isLastQuestion);
        } else {
          throw new Error("Failed to submit answer");
        }
      } catch (err) {
        console.error("Error submitting answer to backend API:", err);
        alert("Failed to submit answer to API. Continuing in simulation mode.");
        setOfflineMode(true);
        setSubmitting(false);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    const text = (answerText + " " + interimText).trim();
    await handleAutoSubmit(text);
  };

  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-spinner" />
        <h3 className="room-loading-text">PrepNova AI is generating your custom questions...</h3>
      </div>
    );
  }

  const getScoreBadgeClass = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "medium";
    return "low";
  };

  // Handle final results display
  const isCompleted = showReport && feedbackReport && feedbackReport.answers_feedback.length === session.questions.length;
  if (isCompleted) {
    const scores = feedbackReport.answers_feedback.map(a => a.score);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    return (
      <div className="room-completed-container">
        <div className="room-completed-header">
          <FaTrophy className="room-completed-trophy" />
          <h1>Interview Completed!</h1>
          <p className="room-completed-desc">
            Great effort! Here is your AI assessment report for the <strong>{session.role_target}</strong> ({session.interview_type}) round.
          </p>

          <div className="room-completed-stats-pill">
            <div>
              <div className="room-completed-stat-num">{avgScore}%</div>
              <div className="room-completed-stat-label">Overall Score</div>
            </div>
            <div className="room-completed-stat-divider"></div>
            <div>
              <div className="room-completed-stat-num">{avgScore >= 75 ? "Pass" : "Requires Practice"}</div>
              <div className="room-completed-stat-label">Verdict</div>
            </div>
          </div>
        </div>

        <h2 className="sectionTitle">Question-by-Question Evaluation</h2>
        <div className="room-feedbacks-list">
          {feedbackReport.answers_feedback.map((item, index) => (
            <div key={index} className="room-feedback-card">
              <div className="room-feedback-card-header">
                <h3>Question {index + 1}</h3>
                <span className={`room-score-badge ${getScoreBadgeClass(item.score)}`}>
                  Score: {item.score}%
                </span>
              </div>
              <p className="room-feedback-q-text">"{item.question_text}"</p>

              <div className="room-feedback-answer-box">
                <div className="room-feedback-answer-label">Your Answer</div>
                <p className="room-feedback-answer-text">"{item.user_answer}"</p>
              </div>

              <div className="room-feedback-grid">
                <div>
                  <h4 className="room-feedback-strengths-title">Strengths</h4>
                  <ul className="room-feedback-list-ul">
                    {item.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="room-feedback-improvements-title">Weaknesses / Improvements</h4>
                  <ul className="room-feedback-list-ul">
                    {item.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>

              <div className="room-feedback-strategy">
                <h4 className="room-feedback-strategy-title">Suggested Answer Strategy</h4>
                <p className="room-feedback-strategy-body">{item.suggested_answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="room-overall-card">
          <h3>Overall AI Assessment Summary</h3>
          <p>{feedbackReport.overall_summary}</p>
        </div>

        <div className="room-center-wrapper">
          <button className="room-reset-btn" onClick={() => window.location.reload()}>
            Start Another Session
          </button>
        </div>
      </div>
    );
  }


  const currentQuestion = session.questions[currentIdx];

  const getProgressClass = (index) => {
    if (index === currentIdx) return "current";
    if (index < currentIdx) return "completed";
    return "pending";
  };

  return (
    <div className="interviewRoom voice-chatbot-room">
      
      {/* Background ambient light decorations */}
      <div className="ambient-glow glow-purple"></div>
      <div className="ambient-glow glow-blue"></div>

      {/* Header Info */}
      <div className="interviewHeader">
        <div className="header-left">
          <h2>AI Mock Interview Session</h2>
          <p className="interviewRoom-meta">
            Target: <strong>{session.role_target}</strong> ({session.interview_type} round)
          </p>
        </div>
        
        {/* Progress Indicators */}
        <div className="room-progress-container">
          {session.questions.map((_, index) => (
            <div key={index} className={`room-progress-step ${getProgressClass(index)}`} />
          ))}
        </div>
      </div>

      {/* Chatbot Dashboard Container */}
      <div className="voice-chatbot-container">
        


        {/* Central Orb & Visualizer Area */}
        <div className="orb-visualizer-wrapper">
          
          {/* Ripple rings behind the orb */}
          <div className={`orb-ripple-ring ring-1 ${aiSpeaking ? "animating" : ""}`}></div>
          <div className={`orb-ripple-ring ring-2 ${aiSpeaking ? "animating" : ""}`}></div>
          <div className={`orb-ripple-ring ring-3 ${aiSpeaking ? "animating" : ""}`}></div>

          {/* The main glowing AI Interviewer Orb */}
          <div className={`ai-orb ${aiSpeaking ? "speaking" : isListening ? "listening" : submitting ? "analyzing" : "idle"}`}>
            <div className="ai-orb-glow"></div>
            <div className="ai-orb-inner">
              {submitting ? (
                <FaSpinner className="orb-spinner spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <FaRobot className="orb-robot-icon" />
              )}
            </div>
          </div>

          {/* Dynamic Status Text */}
          <div className="orb-status-text">
            {aiSpeaking ? (
              <span className="status-speaking">AI Interviewer is speaking...</span>
            ) : isListening ? (
              <span className="status-listening">Listening to your response...</span>
            ) : submitting ? (
              <span className="status-analyzing">AI is analyzing your answer...</span>
            ) : (
              <span className="status-idle">Interviewer is waiting</span>
            )}
          </div>
        </div>

        {/* Dynamic Voice Waveform (Active Soundwave) */}
        <div className={`soundwave-container ${isListening ? "active" : aiSpeaking ? "active-ai" : "idle"}`}>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
        </div>

        {/* Collapsible live transcript */}
        <div className={`transcript-panel ${showLiveTranscript ? "expanded" : "collapsed"}`}>
          <button 
            type="button" 
            className="transcript-toggle-btn"
            onClick={() => setShowLiveTranscript(!showLiveTranscript)}
          >
            <FaComments />
            <span>{showLiveTranscript ? "Hide Transcript" : "Show Transcript"}</span>
            {(answerText.trim() || interimText.trim()) && !showLiveTranscript && <span className="transcript-dot"></span>}
          </button>
          
          {showLiveTranscript && (
            <div className="transcript-box-content">
              <span className="transcript-title">Real-time Transcription</span>
              <div className="transcript-scroll-area">
                {answerText || interimText ? (
                  <p className="transcript-text">
                    {answerText}
                    {interimText && <span className="interim-text">{interimText}</span>}
                  </p>
                ) : (
                  <p className="transcript-placeholder">
                    {isListening ? "Start speaking..." : "No speech transcribed yet."}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Floating Action Controls Dock */}
      <div className="voice-controls-dock">
        {/* Toggle Hands-Free Mode */}
        <button
          type="button"
          className={`control-btn handsfree-btn ${isHandsFree ? "active" : ""}`}
          onClick={() => setIsHandsFree(!isHandsFree)}
          title={isHandsFree ? "Switch to Manual Mode" : "Switch to Hands-Free Voice Mode"}
        >
          <FaPlay className={isHandsFree ? "spin-pulse" : ""} style={{ transform: isHandsFree ? "none" : "rotate(90deg)" }} />
          <span>{isHandsFree ? "Hands-Free On" : "Manual Mode"}</span>
        </button>

        {/* Main Microphone Button */}
        <button
          type="button"
          className={`control-btn main-mic-btn ${isListening ? "listening" : ""}`}
          onClick={toggleListening}
          disabled={aiSpeaking || submitting}
          title={isListening ? "Stop Speaking" : "Start Speaking"}
        >
          <FaMicrophone />
          <div className="mic-pulse-ring"></div>
        </button>

        {/* Submit / Finish Button */}
        <button
          type="button"
          className="control-btn primary-submit-btn"
          onClick={handleSubmitAnswer}
          disabled={submitting || aiSpeaking || !(answerText + interimText).trim()}
          style={{
            opacity: (submitting || aiSpeaking || !(answerText + interimText).trim()) ? 0.6 : 1,
            cursor: (submitting || aiSpeaking || !(answerText + interimText).trim()) ? "not-allowed" : "pointer"
          }}
          title="Submit answer and go to next question"
        >
          {submitting ? (
            <FaSpinner className="spin" style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <>
              <span>{currentIdx === session.questions.length - 1 ? "Finish" : "Next"}</span>
              <FaChevronRight />
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default AIInterviewRoom;
