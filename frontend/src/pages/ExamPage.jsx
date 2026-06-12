import { useEffect, useState, useRef, useCallback } from "react";
import { getQuestions, submitExam, getExamById } from "../services/examService";
import { getMyResults } from "../services/resultService";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import Timer from "../components/exam/Timer";
import WebcamMonitor from "../components/exam/WebcamMonitor";
import QuestionCard from "../components/exam/QuestionCard";
import ViolationPanel from "../components/exam/ViolationPanel";
import ExamHeader from "../components/exam/ExamHeader";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ProctoringAlerts from "../components/exam/ProctoringAlerts";

function ExamPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const codeVerified = Boolean(location.state?.codeVerified);

  const [examDetails, setExamDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [violations, setViolations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // New states for the enhanced flow
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState({ taken: 0, max: 1 });
  const [submitResult, setSubmitResult] = useState(null);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [proctoringAlerts, setProctoringAlerts] = useState([]);
  const procAlertIdRef = useRef(0);

  const startTimeRef = useRef(null);
  const submittedRef = useRef(false);

  // ── PROCTORING ALERT HANDLERS ──
  const handleProctoringViolation = useCallback((data) => {
    const id = ++procAlertIdRef.current;
    setProctoringAlerts((prev) => {
      // Deduplicate: skip if same violation type is already showing
      if (prev.some((a) => a.type === data.type)) return prev;
      // Limit queue to max 3 alerts
      const trimmed = prev.length >= 3 ? prev.slice(1) : prev;
      return [...trimmed, { id, ...data }];
    });
    // No auto-dismiss — student MUST click "I Understand" to continue
  }, []);

  const handleDismissAlert = useCallback((id) => {
    setProctoringAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitted(true);

    const startedAt = startTimeRef.current || Date.now();
    const timeTaken = Math.round((Date.now() - startedAt) / 1000);

    try {
      const response = await submitExam({
        examId,
        answers,
        timeTaken,
        violations,
      });

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      setSubmitResult(response);
    } catch (error) {
      console.log(error);
      submittedRef.current = false;
      setSubmitted(false);
    }
  }, [examId, answers, violations]);


  // ── FETCH EXAM DETAILS & CHECK IF ALREADY ATTEMPTED ──
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examData, resultsData] = await Promise.all([
          getExamById(examId),
          getMyResults(),
        ]);

        const accessType = examData.accessType || "public";
        if (accessType === "private" && !codeVerified) {
          navigate("/dashboard", { replace: true });
          return;
        }

        setAuthorized(true);
        setExamDetails(examData);
        setTimeLeft(examData.duration * 60);

        // Check if student has exhausted all attempts for this exam
        const attemptsForThisExam = resultsData.filter(
          (r) => r.exam?._id === examId || r.exam === examId
        ).length;
        const allowedAttempts = examData.allowReattempt ? examData.maxAttempts : 1;
        setAttemptInfo({ taken: attemptsForThisExam, max: allowedAttempts });
        if (attemptsForThisExam >= allowedAttempts) {
          setAlreadyAttempted(true);
        }
      } catch (error) {
        console.log(error);
        setTimeLeft(300);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, codeVerified, navigate]);

  // ── FETCH QUESTIONS ──
  useEffect(() => {
    if (!authorized) return;

    const fetchQuestions = async () => {
      try {
        const data = await getQuestions(examId);
        setQuestions(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchQuestions();
  }, [examId, authorized]);

  // ── TIMER (only runs after exam started) ──
  useEffect(() => {
    if (!hasStarted || submitted || timeLeft === null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, submitted, timeLeft, handleSubmit]);

  // ── AUTO SUBMIT ON VIOLATIONS (only after started) ──
  useEffect(() => {
    if (!hasStarted) return;
    if (violations >= 3) {
      handleSubmit();
    }
  }, [violations, hasStarted, handleSubmit]);

  // ── FULLSCREEN EXIT DETECTION (only after started) ──
  useEffect(() => {
    if (!hasStarted || submitted) return;

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !submittedRef.current) {
        setViolations((prev) => prev + 1);
        setShowFullscreenWarning(true);
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [hasStarted, submitted]);

  // ── RE-ENTER FULLSCREEN HANDLER ──
  const handleReenterFullscreen = async () => {
    setShowFullscreenWarning(false);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen re-entry failed:", error);
    }
  };

  // ── TAB SWITCH DETECTION (only after started) ──
  useEffect(() => {
    if (!hasStarted || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setViolations((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [hasStarted, submitted]);

  // ── DISABLE RIGHT CLICK (only after started) ──
  useEffect(() => {
    if (!hasStarted) return;

    const disableRightClick = (e) => e.preventDefault();
    document.addEventListener("contextmenu", disableRightClick);
    return () => document.removeEventListener("contextmenu", disableRightClick);
  }, [hasStarted]);

  // ── DISABLE COPY (only after started) ──
  useEffect(() => {
    if (!hasStarted) return;

    const disableCopy = (e) => e.preventDefault();
    document.addEventListener("copy", disableCopy);
    return () => document.removeEventListener("copy", disableCopy);
  }, [hasStarted]);

  // ── HANDLE OPTION SELECT ──
  const handleSelect = (questionId, selectedAnswer) => {
    const updatedAnswers = answers.filter(
      (a) => a.questionId !== questionId
    );
    updatedAnswers.push({ questionId, selectedAnswer });
    setAnswers(updatedAnswers);
  };

  // ── HANDLE START EXAM ──
  const handleStartExam = async () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();

    // Enter fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.log("Fullscreen request failed:", error);
    }
  };

  // ── NAVIGATION HELPERS ──
  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  // ── LOADING STATE ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Loading exam environment...</p>
        </div>
      </div>
    );
  }

  // ── POST-SUBMIT DIALOG ──
  if (!authorized) {
    return null;
  }

  if (submitResult) {
    const pct = submitResult.percentage ?? 0;
    const scoreColor = pct >= 70 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
    const ringColor = pct >= 70 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626";
    const bgGradient = pct >= 70
      ? "from-emerald-50 to-green-50"
      : pct >= 40
      ? "from-amber-50 to-yellow-50"
      : "from-red-50 to-orange-50";

    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4">
        <div className={`bg-gradient-to-br ${bgGradient} border border-gray-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden`}>
          {/* Header */}
          <div className="bg-blue-900 px-6 py-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Exam Submitted Successfully</h2>
            <p className="text-blue-200 text-sm mt-1">{examDetails?.title}</p>
          </div>

          {/* Score Ring */}
          <div className="px-6 pt-8 pb-4 flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="7" fill="none" />
                <circle
                  cx="50" cy="50" r="42"
                  stroke={ringColor}
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(pct / 100) * 263.89} 263.89`}
                  style={{ transition: "stroke-dasharray 1s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{pct}%</span>
                <span className="text-xs text-gray-500">Score</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 w-full mb-6">
              <div className="bg-white rounded-xl px-3 py-3 border border-gray-200 text-center">
                <p className="text-lg font-bold text-emerald-600">{submitResult.score}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Correct</p>
              </div>
              <div className="bg-white rounded-xl px-3 py-3 border border-gray-200 text-center">
                <p className="text-lg font-bold text-red-500">{(questions.length || 0) - (submitResult.score || 0)}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Wrong</p>
              </div>
              <div className="bg-white rounded-xl px-3 py-3 border border-gray-200 text-center">
                <p className="text-lg font-bold text-gray-800">{questions.length}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Total</p>
              </div>
            </div>

            {/* Performance Message */}
            <div className={`w-full rounded-xl p-3 mb-6 text-center border ${
              pct >= 70
                ? "bg-emerald-50 border-emerald-200"
                : pct >= 40
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
            }`}>
              <p className={`text-sm font-medium ${scoreColor}`}>
                {pct >= 70
                  ? "Excellent work! Outstanding performance."
                  : pct >= 40
                  ? "Good effort! There is room for improvement."
                  : "Keep practicing. You can do better next time."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => navigate(`/result/${submitResult.result?._id || submitResult.result}`)}
                className="w-full bg-blue-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg text-sm inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                View Detailed Results
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 text-sm inline-flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── ALREADY ATTEMPTED GUARD ──
  if (alreadyAttempted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-12 max-w-lg mx-4 shadow-lg text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Exam Already Attempted</h2>
          <p className="text-gray-600 mb-2">
            You have used all {attemptInfo.max} allowed attempt{attemptInfo.max > 1 ? 's' : ''} for this examination.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Attempts used: {attemptInfo.taken} / {attemptInfo.max}
          </p>
          <button
            onClick={() => navigate("/exams")}
            className="bg-blue-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-all duration-300 shadow-md inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  // ── RULES DIALOG (before exam starts) ──
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden">
          {/* Dialog Header */}
          <div className="bg-blue-900 px-6 sm:px-8 py-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Examination Rules</h2>
            </div>
            <p className="text-blue-200 text-sm">Please read all rules carefully before starting</p>
          </div>

          {/* Exam Info */}
          {examDetails && (
            <div className="px-6 sm:px-8 py-5 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-lg mb-3">{examDetails.title}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                  <p className="text-lg font-bold text-blue-900">{examDetails.duration} min</p>
                </div>
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">Questions</p>
                  <p className="text-lg font-bold text-blue-900">{questions.length}</p>
                </div>
                <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-500 font-medium mb-1">Total Marks</p>
                  <p className="text-lg font-bold text-blue-900">{examDetails.totalMarks || questions.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="px-6 sm:px-8 py-6">
            <div className="space-y-3">
              {[
                { icon: "camera", text: "Your webcam will be activated for AI-based proctoring throughout the exam." },
                { icon: "fullscreen", text: "The exam will run in fullscreen mode. Exiting fullscreen will be recorded as a violation." },
                { icon: "tab", text: "Switching tabs or windows will be detected and recorded as a violation." },
                { icon: "violation", text: "Accumulating 3 or more violations will result in automatic submission of your exam." },
                { icon: "copy", text: "Right-clicking and copying content is disabled during the examination." },
                { icon: "navigate", text: "You can navigate between questions freely. Unanswered questions can be revisited." },
                { icon: "submit", text: examDetails?.allowReattempt && examDetails?.maxAttempts > 1
                  ? `You have ${examDetails.maxAttempts} total attempts for this exam. Attempt ${attemptInfo.taken + 1} of ${attemptInfo.max}.`
                  : "Once submitted, you cannot retake or modify your answers." },
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-800">{i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{rule.text}</p>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-amber-800 font-medium">
                  By clicking "I Agree & Start Exam", you consent to webcam monitoring and agree to follow all examination rules.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => navigate("/exams")}
              className="px-6 py-3 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition-all duration-200 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExam}
              className="px-8 py-3 rounded-xl font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg text-sm inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
              </svg>
              I Agree & Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE EXAM UI ──
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* AI Proctoring Alerts Overlay */}
      <ProctoringAlerts alerts={proctoringAlerts} onDismiss={handleDismissAlert} />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <ExamHeader />
            {examDetails && (
              <p className="text-sm text-gray-500 font-medium mt-1">{examDetails.title}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Timer timeLeft={timeLeft} />
            <ViolationPanel violations={violations} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 p-4 flex flex-col gap-4 overflow-y-auto flex-shrink-0 shadow-sm z-10">
          <WebcamMonitor isActive={hasStarted && !submitted} onViolation={handleProctoringViolation} />

          {/* Question Navigation Grid */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Questions Navigation
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = answers.some(
                  (a) => a.questionId === q._id
                );
                const isActive = i === currentQuestionIndex;

                return (
                  <button
                    key={q._id}
                    onClick={() => goToQuestion(i)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "ring-2 ring-blue-600 ring-offset-1 bg-blue-900 text-white shadow-md"
                        : isAnswered
                        ? "bg-emerald-100 border border-emerald-300 text-emerald-700 shadow-sm"
                        : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-sm"
                    }`}
                  >
                    {isAnswered && !isActive ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-300 flex-shrink-0" />
                <span className="text-xs text-gray-500">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-blue-900 flex-shrink-0" />
                <span className="text-xs text-gray-500">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-white border border-gray-300 flex-shrink-0" />
                <span className="text-xs text-gray-500">Not Answered</span>
              </div>
            </div>
          </div>

          {/* Exam Info */}
          {examDetails && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-auto shadow-sm">
              <h4 className="text-sm font-semibold text-blue-900 mb-3">Exam Status</h4>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Total Questions</span>
                  <span className="font-semibold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-100">{questions.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700">Duration</span>
                  <span className="font-semibold text-blue-900 bg-white px-2 py-0.5 rounded-md border border-blue-100">{examDetails.duration} mins</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200/60">
                  <span className="text-blue-800 font-medium">Answered</span>
                  <span className="font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-emerald-100">
                    {answers.length}/{questions.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* Question Counter */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-medium text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {answers.some((a) => a.questionId === currentQuestion?._id) && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Answered
                </span>
              )}
            </div>

            {/* Single Question */}
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                index={currentQuestionIndex}
                answers={answers}
                handleSelect={handleSelect}
              />
            )}

            {/* Pagination Controls */}
            <div className="mt-8 flex items-center justify-between pb-8">
              {/* Previous Button */}
              <button
                onClick={() => goToQuestion(currentQuestionIndex - 1)}
                disabled={isFirstQuestion}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  isFirstQuestion
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-700 shadow-sm hover:shadow-md"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                Previous
              </button>

              {/* Next / Submit Button */}
              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitted}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    submitted
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
                  }`}
                >
                  {submitted ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      Submit Exam
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => goToQuestion(currentQuestionIndex + 1)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-blue-900 text-white hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  Next
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Exit Warning Dialog */}
      <ConfirmDialog
        isOpen={showFullscreenWarning}
        onClose={() => {}}
        onConfirm={handleReenterFullscreen}
        title="Exit Fullscreen Attempted"
        message="You are not allowed to exit fullscreen mode during the examination. This action has been recorded as a violation. Click OK to return to fullscreen and continue."
        confirmText="OK"
        isDanger={true}
        isAlertOnly={true}
      />
    </div>
  );
}

export default ExamPage;
