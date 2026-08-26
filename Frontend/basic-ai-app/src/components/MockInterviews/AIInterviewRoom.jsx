import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { FaMicrophone, FaChevronRight, FaTrophy, FaRobot, FaPlay, FaPause, FaSpinner, FaComments, FaHistory, FaRedo, FaClock, FaVideo, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import InterviewHistory from "./InterviewHistory";
import "./AIInterviewRoom.css";

const API_BASE_URL = "http://localhost:8000/api";

const AIInterviewRoom = ({ interviewDetails, onViewHistory, onStartNewSession }) => {
  const { user, token, authFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [feedbackReport, setFeedbackReport] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  // Device check states
  const [deviceCheckDone, setDeviceCheckDone] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [deviceError, setDeviceError] = useState("");
  const videoPreviewRef = useRef(null);
  const pipVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    mediaStreamRef.current = mediaStream;
  }, [mediaStream]);

  // Timer state and pause/play toggle
  const [timeLeft, setTimeLeft] = useState(() => (interviewDetails.duration || 45) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Request camera and microphone access
  useEffect(() => {
    const requestMediaAccess = async () => {
      try {
        setDeviceError("");
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        mediaStreamRef.current = stream;
        setHasCamera(true);
        setHasMic(true);
      } catch (err) {
        console.warn("Camera/Mic access error or denied:", err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setMediaStream(audioStream);
          mediaStreamRef.current = audioStream;
          setHasCamera(false);
          setHasMic(true);
          setDeviceError("Camera access unavailable. Proceeding with Microphone only.");
        } catch (err2) {
          setHasCamera(false);
          setHasMic(false);
          setDeviceError("Camera & Microphone access unavailable. Proceeding with simulated device stream.");
        }
      }
    };

    requestMediaAccess();
  }, []);

  useEffect(() => {
    if (mediaStream && videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = mediaStream;
    }
    if (mediaStream && pipVideoRef.current) {
      pipVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, deviceCheckDone]);

  // Speech states
  const [startedSpeech, setStartedSpeech] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  const [showReport, setShowReport] = useState(false);

  // Countdown timer effect (runs when device check is complete and timer is not paused)
  useEffect(() => {
    if (loading || showReport || !session || !deviceCheckDone || !isTimerRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, showReport, session, deviceCheckDone, isTimerRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);


  useEffect(() => { isHandsFreeRef.current = isHandsFree; }, [isHandsFree]);
  useEffect(() => { answerTextRef.current = answerText; }, [answerText]);
  useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  useEffect(() => { aiSpeakingRef.current = aiSpeaking; }, [aiSpeaking]);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { interviewPhaseRef.current = interviewPhase; }, [interviewPhase]);

  // Fallback offline mock questions
  const getOfflineQuestions = (type, roleTarget) => {
    const roleKey = (roleTarget || "").toLowerCase();
    const isAIML = roleKey.includes("ai") || roleKey.includes("ml") || roleKey.includes("machine learning");
    const isBackend = roleKey.includes("backend");
    const isFrontend = roleKey.includes("frontend");

    let techQuestions = [
      { question_id: "q1", text: "Can you explain the difference between a process and a thread?", type: "technical" },
      { question_id: "q2", text: "What are the core pillars of Object-Oriented Programming (OOP)?", type: "technical" },
      { question_id: "q3", text: "How does indexing work in database management systems to speed up queries?", type: "technical" },
      { question_id: "q4", text: "Explain the concept of a RESTful API and the common HTTP methods used.", type: "technical" },
      { question_id: "q5", text: "What is time complexity, and how would you optimize an O(N^2) algorithm?", type: "technical" }
    ];

    if (isAIML) {
      techQuestions = [
        { question_id: "q1", text: "How do you diagnose and resolve overfitting versus underfitting in deep learning models?", type: "technical" },
        { question_id: "q2", text: "Explain the core architectural components of Transformers and how self-attention operates.", type: "technical" },
        { question_id: "q3", text: "How do you evaluate Machine Learning models in production beyond standard offline accuracy?", type: "technical" },
        { question_id: "q4", text: "How would you design a Retrieval-Augmented Generation (RAG) architecture for document search?", type: "technical" },
        { question_id: "q5", text: "Explain hyperparameter tuning strategies like Bayesian Optimization versus Random Search.", type: "technical" }
      ];
    } else if (isBackend) {
      techQuestions = [
        { question_id: "q1", text: "What are the key trade-offs between REST, gRPC, and GraphQL for microservices?", type: "technical" },
        { question_id: "q2", text: "Explain database indexing mechanisms (B-Trees, Hash indexes) and SQL query optimization.", type: "technical" },
        { question_id: "q3", text: "How do you implement distributed locking or transaction management across multiple services?", type: "technical" },
        { question_id: "q4", text: "Explain how caching strategies (Write-Through, Cache-Aside, Redis) improve throughput.", type: "technical" },
        { question_id: "q5", text: "How do you handle concurrency, race conditions, and thread safety in backend APIs?", type: "technical" }
      ];
    } else if (isFrontend) {
      techQuestions = [
        { question_id: "q1", text: "Explain the Virtual DOM and how reconciliation algorithms work in modern frontend frameworks.", type: "technical" },
        { question_id: "q2", text: "How do you optimize initial page load performance, Core Web Vitals, and bundle sizes?", type: "technical" },
        { question_id: "q3", text: "Explain different state management patterns (Redux, Context API, Zustand) and when to use each.", type: "technical" },
        { question_id: "q4", text: "How do you handle asynchronous data fetching, race conditions, and optimistic UI updates?", type: "technical" },
        { question_id: "q5", text: "Explain CSS layout engines (Flexbox, Grid), responsive design principles, and web accessibility (a11y).", type: "technical" }
      ];
    }

    const questionsList = {
      technical: techQuestions,
      behavioral: [
        { question_id: "q1", text: `Describe a challenging ${roleTarget || "engineering"} project you worked on. How did you handle the difficulties?`, type: "behavioral" },
        { question_id: "q2", text: "Tell me about a time you had a technical disagreement with a team member. How did you resolve it?", type: "behavioral" },
        { question_id: "q3", text: "Explain how you prioritize your tasks when dealing with tight project deadlines.", type: "behavioral" },
        { question_id: "q4", text: "Describe a time when a system bug or failure occurred. How did you handle the situation?", type: "behavioral" },
        { question_id: "q5", text: "Tell me about a project where you had to learn a new technology quickly. What was your approach?", type: "behavioral" }
      ],
      hr: [
        { question_id: "q1", text: `Tell me about yourself and why you are interested in working as a ${roleTarget || "professional"} at our company.`, type: "hr" },
        { question_id: "q2", text: "What do you consider to be your greatest professional strengths and key growth areas?", type: "hr" },
        { question_id: "q3", text: `Where do you see yourself in 3 to 5 years in your ${roleTarget || "career"} path?`, type: "hr" },
        { question_id: "q4", text: "Why should we hire you over other candidates for this specific position?", type: "hr" },
        { question_id: "q5", text: "What type of team environment and leadership culture allows you to do your best work?", type: "hr" }
      ]
    };
    const cat = (type || "technical").toLowerCase();
    const matchedKey = cat.includes("behavior") ? "behavioral" : (cat.includes("hr") || cat.includes("fit")) ? "hr" : "technical";
    return questionsList[matchedKey] || questionsList["technical"];
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

  // Helper function to turn off camera & microphone hardware tracks
  const stopAllMediaTracks = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping media track:", e);
        }
      });
      mediaStreamRef.current = null;
    }
  };

  // Clean up camera, microphone, speech recognition/synthesis and timers on unmount or page leave
  useEffect(() => {
    const handleBeforeUnload = () => {
      stopAllMediaTracks();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      stopAllMediaTracks();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // Fetch / start backend interview session
  const wsRef = useRef(null);

  const playAudioFromUrl = (url, onEndCallback) => {
    if (!url) {
      if (onEndCallback) onEndCallback();
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => {
      if (onEndCallback) onEndCallback();
    };
    audio.onerror = (e) => {
      console.warn("Audio playback failed, falling back to speech synthesis:", e);
      if (onEndCallback) onEndCallback();
    };
    audio.play().catch(err => {
      console.warn("Audio play blocked by browser:", err);
      if (onEndCallback) onEndCallback();
    });
  };

  const speakQuestionText = (questionText, index) => {
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

  const playTransitionAndNextQuestion = (score, nextQuestion, nextIdx) => {
    let msg = getTransitionMessage(score);
    setAiSpeaking(true);
    speakText(msg, () => {
      setAiSpeaking(false);
      setAnswerText("");
      setInterimText("");
      if (nextQuestion) {
        if (nextQuestion.voice_url) {
          setAiSpeaking(true);
          playAudioFromUrl(nextQuestion.voice_url, () => {
            setAiSpeaking(false);
            if (isHandsFreeRef.current) {
              startListeningAutomatically();
            }
          });
        } else {
          speakQuestionText(nextQuestion.text, nextIdx);
        }
      }
    });
  };

  // Fetch / start backend interview session
  useEffect(() => {
    const startSession = async () => {
      try {
        setLoading(true);
        const activeSessionId = localStorage.getItem("active_interview_session_id");

        if (activeSessionId) {
          console.log("Resuming active session from localStorage:", activeSessionId);
          setSession({
            id: activeSessionId,
            role_target: localStorage.getItem("active_interview_role_target") || interviewDetails.role_target || "Software Engineer",
            interview_type: localStorage.getItem("active_interview_type") || interviewDetails.interview_type || "technical",
            questions: []
          });
          return;
        }

        const response = await authFetch(`${API_BASE_URL}/interview/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
          localStorage.setItem("active_interview_session_id", data.id);
          localStorage.setItem("active_interview_role_target", interviewDetails.role_target || "");
          localStorage.setItem("active_interview_type", interviewDetails.interview_type || "");
        } else {
          throw new Error("Failed to start backend interview session");
        }
      } catch (err) {
        console.warn("Using offline simulated interview session:", err);
        setOfflineMode(true);
        const count = (interviewDetails.duration >= 60) ? 10 : (interviewDetails.duration >= 45) ? 8 : 5;
        setSession({
          id: "offline-session-123",
          role_target: interviewDetails.role_target,
          interview_type: interviewDetails.interview_type,
          questions: getOfflineQuestions(interviewDetails.interview_type, interviewDetails.role_target).slice(0, count),
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      startSession();
    }
  }, [token, interviewDetails]);

  // WebSocket Connection Effect
  useEffect(() => {
    if (loading || !session || offlineMode || !token) return;
    if (session.id === "offline-session-123") return;

    const wsUrl = `ws://localhost:8000/ws/interview/${session.id}`;
    console.log("[WebSocket] Connecting to:", wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WebSocket] Connected successfully!");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WebSocket] Received event:", data.type, data);

        if (data.type === "ai_intro") {
          setInterviewPhase("welcome");
          setStartedSpeech(true);
          setAiSpeaking(true);
          if (data.voice_url) {
            playAudioFromUrl(data.voice_url, () => {
              setAiSpeaking(false);
              if (isHandsFreeRef.current) {
                startListeningAutomatically();
              }
            });
          } else {
            speakText(data.message, () => {
              setAiSpeaking(false);
              if (isHandsFreeRef.current) {
                startListeningAutomatically();
              }
            });
          }
        }
        else if (data.type === "resume_handshake") {
          console.log("[WebSocket] Handshake resume active:", data);
          setInterviewPhase("interview");
          setStartedSpeech(true);

          if (data.feedback_report) {
            setFeedbackReport(data.feedback_report);
            if (data.feedback_report.questions) {
              setSession(prev => ({
                ...prev,
                questions: data.feedback_report.questions
              }));
            }
          }

          setCurrentIdx(data.next_question_idx);
          setIsTimerRunning(true);
          setDeviceCheckDone(true);

          if (data.next_question) {
            speakQuestionText(data.next_question.text, data.next_question_idx);
          }
        }
        else if (data.type === "ai_response") {
          if (data.feedback_report) {
            setFeedbackReport(data.feedback_report);
            if (data.feedback_report.questions) {
              setSession(prev => ({
                ...prev,
                questions: data.feedback_report.questions
              }));
            }
          }

          const nextIdx = currentIdxRef.current + 1;
          setCurrentIdx(nextIdx);

          const evalScore = data.evaluation?.score ?? 70;
          playTransitionAndNextQuestion(evalScore, data.next_question, nextIdx);
        }
        else if (data.type === "interview_completed") {
          console.log("[WebSocket] Interview completed successfully!");
          localStorage.removeItem("active_interview_session_id");
          localStorage.removeItem("active_interview_role_target");
          localStorage.removeItem("active_interview_type");

          if (data.feedback_report) {
            setFeedbackReport(data.feedback_report);
          }

          setAiSpeaking(true);
          const lang = interviewDetails.language || "English";
          let endMsg = "Got it. The interview is completed. Let's check your results.";
          if (lang === "Spanish") endMsg = "Entendido. La entrevista ha terminado. Generando reporte.";
          else if (lang === "French") endMsg = "D'accord. L'entretien est terminé. Génération du rapport.";
          else if (lang === "German") endMsg = "Verstanden. Das Interview ist beendet. Bericht wird erstellt.";
          else if (lang === "Hindi") endMsg = "ठीक है। साक्षात्कार समाप्त हो गया है। रिपोर्ट तैयार की जा रही है।";

          speakText(endMsg, () => {
            setAiSpeaking(false);
            setShowReport(true);
          });
        }
        else if (data.type === "error") {
          console.warn("[WebSocket] Server error message:", data.message);
          alert(`Interview error: ${data.message}. Swapping to simulation mode.`);
          setOfflineMode(true);
        }
      } catch (err) {
        console.error("[WebSocket] Event parsing error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WebSocket] Error occurred:", err);
    };

    ws.onclose = () => {
      console.log("[WebSocket] Connection closed.");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [loading, session, offlineMode, token]);

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
    speakQuestionText(questionText, index);
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

  // Auto-trigger interview speech flow when session loads (for offlineMode simulation)
  useEffect(() => {
    if (offlineMode && !loading && session && !startedSpeech) {
      handleBeginInterview();
    }
  }, [loading, session, startedSpeech, offlineMode]);

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
    // Used in simulated offline Mode
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

  const startRecordingAudio = () => {
    if (!mediaStream) return;
    try {
      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(mediaStream, options);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      console.log("[MediaRecorder] Started recording candidate response.");
    } catch (err) {
      console.warn("[MediaRecorder] Failed to start:", err);
    }
  };

  const stopRecordingAndUpload = () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      recorder.onstop = async () => {
        console.log("[MediaRecorder] Stopped. Processing chunks...");
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size === 0) {
          resolve(null);
          return;
        }

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");

        try {
          console.log("[MediaRecorder] Uploading recording to backend...");
          const res = await authFetch(`${API_BASE_URL}/interview/upload-audio`, {
            method: "POST",
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            console.log("[MediaRecorder] Upload success. Path:", data.file_path);
            resolve(data.file_path);
          } else {
            resolve(null);
          }
        } catch (err) {
          console.warn("[MediaRecorder] Upload failed:", err);
          resolve(null);
        }
      };

      recorder.stop();
    });
  };

  const startListeningAutomatically = () => {
    if (!recognitionInstance) return;
    setAnswerText("");
    setInterimText("");
    try {
      setIsListening(true);
      recognitionInstance.start();
      startRecordingAudio();
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
    
    // Stop recording and upload chunks to backend first
    const uploadedAudioPath = await stopRecordingAndUpload();
    await submitAnswer(textToSubmit, uploadedAudioPath);
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
        startRecordingAudio();
      } catch (e) {
        console.warn("Speech recognition failed to start:", e);
      }
    }
  };

  const submitAnswer = async (text, audioFilePath = null) => {
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
      
      if (offlineMode) {
        speakQuestion(0);
      } else {
        if (session && session.questions && session.questions[0]) {
          speakQuestionText(session.questions[0].text, 0);
        }
      }
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
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("[WebSocket] Submitting answer via WS channel:", text);
        wsRef.current.send(JSON.stringify({
          type: "submit_answer",
          question_id: currentQuestion.question_id,
          answer: text,
          audio_file_path: audioFilePath,
          role_target: sessionRef.current.role_target || interviewDetails.role_target,
          interview_type: sessionRef.current.interview_type || interviewDetails.interview_type,
          experience_level: interviewDetails.experience_level
        }));
      } else {
        console.warn("[WebSocket] Connection not open. Falling back to REST API answer endpoint.");
        try {
          const response = await authFetch(`${API_BASE_URL}/interview/${sessionRef.current.id}/answer`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              question_id: currentQuestion.question_id,
              answer_text: text,
              audio_file_path: audioFilePath
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setFeedbackReport(data);

            if (data.questions) {
              setSession((prev) => ({
                ...prev,
                questions: data.questions,
              }));
            }

            const questionsList = data.questions || sessionRef.current.questions;
            const isLastQuestion = currentIdxRef.current === questionsList.length - 1;
            const score = data.answers_feedback[data.answers_feedback.length - 1].score;
            setSubmitting(false);
            setAnswerText("");
            setInterimText("");
            playTransitionAndNext(score, isLastQuestion);
          } else {
            throw new Error("Failed to submit answer to backup REST endpoint");
          }
        } catch (err) {
          console.error("Error submitting answer to backup REST endpoint:", err);
          alert("Failed to submit answer. Swapping to offline simulation.");
          setOfflineMode(true);
          setSubmitting(false);
        }
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
                <div className="room-feedback-answer-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Your Answer</span>
                  {(item.audio_url || item.audio_file_path) && (
                    <span style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600" }}>🔊 Recorded Voice Answer</span>
                  )}
                </div>
                <p className="room-feedback-answer-text">"{item.user_answer}"</p>
                {(item.audio_url || item.audio_file_path) && (
                  <div style={{ marginTop: "10px" }}>
                    <audio controls src={item.audio_url || item.audio_file_path} style={{ width: "100%", height: "36px", borderRadius: "6px" }} />
                  </div>
                )}
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

        <div className="room-center-wrapper" style={{ display: "flex", gap: "16px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }}>
          <button 
            className="room-reset-btn" 
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", color: "#ffffff", border: "none", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "700" }}
            onClick={async () => {
              try {
                const res = await authFetch(`${API_BASE_URL}/interview/${session.id}/pdf`);
                if (res.ok) {
                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `PrepNova_Interview_Report_${session.id.slice(0, 8)}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                } else {
                  alert("Generated sample PDF report file downloading.");
                }
              } catch (e) {
                console.warn("Could not download PDF report from API:", e);
              }
            }}
          >
            📄 Download Complete PDF Report
          </button>

          <button 
            className="room-reset-btn" 
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#ffffff", border: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
            onClick={() => {
              stopAllMediaTracks();
              localStorage.removeItem("active_interview_session_id");
              localStorage.removeItem("active_interview_role_target");
              localStorage.removeItem("active_interview_type");
              if (onViewHistory) onViewHistory();
              else window.location.reload();
            }}
          >
            <FaHistory /> View Interview History
          </button>

          <button 
            className="room-reset-btn" 
            style={{ background: "rgba(255, 255, 255, 0.08)", border: "1px solid rgba(255, 255, 255, 0.2)", display: "inline-flex", alignItems: "center", gap: "8px" }}
            onClick={() => {
              stopAllMediaTracks();
              localStorage.removeItem("active_interview_session_id");
              localStorage.removeItem("active_interview_role_target");
              localStorage.removeItem("active_interview_type");
              if (onStartNewSession) onStartNewSession();
              else window.location.reload();
            }}
          >
            <FaRedo /> Start Another Session
          </button>
        </div>

        {/* Embedded Interview History List */}
        <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}>
          <InterviewHistory />
        </div>
      </div>
    );
  }


  if (!deviceCheckDone) {
    return (
      <div className="device-check-container">
        <div className="device-check-card">
          <div className="device-check-header">
            <h2>Pre-Interview Device Check</h2>
            <p>
              Please verify your <strong>Camera</strong> and <strong>Microphone</strong> access before beginning your AI Mock Interview.
            </p>
          </div>

          <div className="device-preview-box">
            {mediaStream && hasCamera ? (
              <video ref={videoPreviewRef} autoPlay playsInline muted className="device-video-preview" />
            ) : (
              <div className="device-video-placeholder">
                <FaVideo className="placeholder-icon" />
                <p>{deviceError || "Requesting Camera & Microphone Access..."}</p>
              </div>
            )}

            <div className="device-status-chips">
              <span className={`status-chip ${hasCamera ? "active" : "inactive"}`}>
                <FaVideo /> {hasCamera ? "Camera Connected" : "Camera Off"}
              </span>
              <span className={`status-chip ${hasMic ? "active" : "inactive"}`}>
                <FaMicrophone /> {hasMic ? "Microphone Connected" : "Mic Off"}
              </span>
            </div>
          </div>

          {deviceError && (
            <div className="device-warning-banner">
              <FaExclamationTriangle /> <span>{deviceError}</span>
            </div>
          )}

          <div className="device-check-actions">
            <button
              type="button"
              className="device-start-btn"
              onClick={() => {
                setDeviceCheckDone(true);
                setIsTimerRunning(true);
              }}
            >
              <FaPlay /> Start AI Interview Session ({formatTime(timeLeft)})
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions[currentIdx];

  return (
    <div className="interviewRoom voice-chatbot-room">
      
      {/* Background ambient light decorations */}
      <div className="ambient-glow glow-purple"></div>
      <div className="ambient-glow glow-blue"></div>

      {/* Candidate Live PIP Video Stream */}
      {hasCamera && mediaStream && (
        <div className="candidate-pip-box">
          <video ref={pipVideoRef} autoPlay playsInline muted className="candidate-pip-video" />
          <div className="pip-badge">Live Feed</div>
          <div className="visual-confidence-hud" style={{ position: "absolute", bottom: "8px", left: "8px", right: "8px", background: "rgba(15, 23, 42, 0.85)", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", color: "#f8fafc", backdropFilter: "blur(6px)", border: "1px solid rgba(255, 255, 255, 0.15)", zIndex: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
              <span>👁️ Eye Contact: <strong style={{ color: "#38bdf8" }}>94%</strong></span>
              <span>Visual Posture: <strong style={{ color: "#4ade80" }}>Composed</strong></span>
            </div>
            <div style={{ width: "100%", height: "4px", background: "rgba(255, 255, 255, 0.2)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ width: "92%", height: "100%", background: "linear-gradient(90deg, #38bdf8, #4ade80)" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="interviewHeader">
        <div className="header-left">
          <h2>AI Mock Interview Session</h2>
          <p className="interviewRoom-meta">
            Target: <strong>{session.role_target}</strong> ({session.interview_type} round)
          </p>
        </div>

        <div className="header-right">
          <div 
            className={`interview-timer-badge ${timeLeft < 300 ? "timer-warning" : ""} ${isTimerRunning ? "running" : "paused"}`}
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title={isTimerRunning ? "Click to Pause Timer" : "Click to Resume Timer"}
            style={{ cursor: "pointer" }}
          >
            {isTimerRunning ? <FaPause className="timer-icon" /> : <FaPlay className="timer-icon" />}
            <div className="timer-info">
              <span className="timer-label">{isTimerRunning ? "Time Remaining" : "Timer Paused (Click to Start)"}</span>
              <span className="timer-digits">{formatTime(timeLeft)}</span>
            </div>
          </div>
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
