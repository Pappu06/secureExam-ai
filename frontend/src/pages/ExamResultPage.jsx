import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getResultById } from "../services/resultService";
import Sidebar, { MobileMenuButton } from "../components/dashboard/Sidebar";

/* ── Helpers ── */

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const pctColor = (p) => {
  if (p >= 70) return "text-emerald-600";
  if (p >= 40) return "text-amber-600";
  return "text-red-600";
};

const pctBg = (p) => {
  if (p >= 70) return "bg-emerald-500";
  if (p >= 40) return "bg-amber-500";
  return "bg-red-500";
};

/* ── Motion Variants ── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

/* ── Icons ── */

const IconBack = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);

const IconX = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const IconMinus = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

/* ── Loading Skeleton ── */

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="h-6 w-48 bg-gray-200 rounded mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl mb-4" />
        ))}
      </div>
    </div>
  );
}

/* ── Main Component ── */

function ExamResultPage() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // all | correct | incorrect | unanswered

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getResultById(resultId);
        setResult(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load result. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-72">
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <h1 className="text-xl font-semibold text-gray-900">Exam Result</h1>
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-72 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Result Not Found</h2>
            <p className="text-gray-500 mb-6 text-sm">{error || "This result does not exist or you don't have access."}</p>
            <button
              onClick={() => navigate("/results")}
              className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-all"
            >
              Back to Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pct = result.percentage ?? 0;
  const correct = result.score ?? 0;
  const total = result.totalQuestions ?? 0;
  const incorrect = total - correct;
  const questions = result.questions || [];
  const studentAnswers = result.answers || [];

  // Build question analysis
  const questionAnalysis = questions.map((q, idx) => {
    const studentAnswer = studentAnswers.find(
      (a) => a.questionId === q._id.toString() || a.questionId === q._id
    );
    const selectedAnswer = studentAnswer?.selectedAnswer || null;
    const isCorrect = selectedAnswer === q.correctAnswer;
    const isUnanswered = !selectedAnswer;

    return {
      index: idx + 1,
      question: q,
      selectedAnswer,
      isCorrect,
      isUnanswered,
    };
  });

  // Count unanswered
  const unansweredCount = questionAnalysis.filter((q) => q.isUnanswered).length;

  // Filter questions
  const filteredQuestions = questionAnalysis.filter((q) => {
    if (filter === "correct") return q.isCorrect && !q.isUnanswered;
    if (filter === "incorrect") return !q.isCorrect && !q.isUnanswered;
    if (filter === "unanswered") return q.isUnanswered;
    return true;
  });

  const filterTabs = [
    { key: "all", label: "All Questions", count: questionAnalysis.length },
    { key: "correct", label: "Correct", count: correct },
    { key: "incorrect", label: "Incorrect", count: incorrect - unansweredCount },
    { key: "unanswered", label: "Unanswered", count: unansweredCount },
  ];

  const ringColor = pct >= 70 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <button
                onClick={() => navigate("/results")}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <IconBack />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{result.exam?.title || "Exam Result"}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Submitted {formatDateTime(result.submittedAt)}</p>
              </div>
            </div>
            <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-white">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-4 sm:p-6 lg:p-8"
        >
          {/* ── Score Overview Card ── */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8"
          >
            <div className="bg-blue-900 px-6 sm:px-8 py-5">
              <h2 className="text-lg font-semibold text-white">Performance Overview</h2>
              <p className="text-blue-200 text-sm mt-0.5">{result.exam?.description || "Detailed exam results and question-level breakdown"}</p>
            </div>

            <div className="px-6 sm:px-8 py-6">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Score Ring */}
                <div className="relative w-36 h-36 flex-shrink-0">
                  <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="6" fill="none" />
                    <motion.circle
                      cx="50" cy="50" r="42"
                      stroke={ringColor}
                      strokeWidth="6"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0 263.89" }}
                      animate={{ strokeDasharray: `${(pct / 100) * 263.89} 263.89` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-bold ${pctColor(pct)}`}>{pct}%</span>
                    <span className="text-xs text-gray-500 mt-0.5">Score</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="flex-1 w-full grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-700">{correct}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">Correct</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-red-700">{incorrect - unansweredCount}</p>
                    <p className="text-xs text-red-600 mt-1 font-medium">Incorrect</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-700">{unansweredCount}</p>
                    <p className="text-xs text-gray-500 mt-1 font-medium">Unanswered</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{total}</p>
                    <p className="text-xs text-blue-600 mt-1 font-medium">Total</p>
                  </div>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Overall Performance</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className={`h-full rounded-full ${pctBg(pct)}`}
                  />
                </div>
              </div>

              {/* Meta Info Row */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Time Taken</p>
                    <p className="text-sm font-semibold text-gray-900">{formatTime(result.timeTaken)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286Z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Violations</p>
                    <p className={`text-sm font-semibold ${result.violations > 0 ? "text-red-600" : "text-emerald-600"}`}>
                      {result.violations || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(result.submittedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{result.exam?.duration} min</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Question-by-Question Breakdown ── */}
          {questions.length > 0 && (
            <motion.div variants={itemVariants} className="mb-8">
              {/* Section Header + Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Question-by-Question Review</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Showing {filteredQuestions.length} of {questionAnalysis.length} questions
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                        filter === tab.key
                          ? "bg-blue-900 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Cards */}
              <div className="space-y-4">
                {filteredQuestions.map((item) => (
                  <motion.div
                    key={item.question._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`bg-white border rounded-xl overflow-hidden shadow-sm ${
                      item.isUnanswered
                        ? "border-gray-300"
                        : item.isCorrect
                        ? "border-emerald-200"
                        : "border-red-200"
                    }`}
                  >
                    {/* Question Header */}
                    <div className={`px-5 py-3 flex items-center justify-between ${
                      item.isUnanswered
                        ? "bg-gray-50"
                        : item.isCorrect
                        ? "bg-emerald-50"
                        : "bg-red-50"
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          item.isUnanswered
                            ? "bg-gray-200 text-gray-600"
                            : item.isCorrect
                            ? "bg-emerald-200 text-emerald-700"
                            : "bg-red-200 text-red-700"
                        }`}>
                          {item.index}
                        </span>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${
                          item.isUnanswered
                            ? "text-gray-500"
                            : item.isCorrect
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}>
                          {item.isUnanswered ? "Unanswered" : item.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{item.question.marks || 1} mark{(item.question.marks || 1) > 1 ? "s" : ""}</span>
                    </div>

                    {/* Question Body */}
                    <div className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900 mb-4 leading-relaxed">
                        {item.question.questionText}
                      </p>

                      {/* Options */}
                      <div className="space-y-2">
                        {item.question.options.map((option, optIdx) => {
                          const isSelected = item.selectedAnswer === option;
                          const isCorrectOption = item.question.correctAnswer === option;

                          let optionStyle = "bg-white border-gray-200 text-gray-700";
                          let icon = null;

                          if (isCorrectOption) {
                            optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-800";
                            icon = <IconCheck />;
                          } else if (isSelected && !isCorrectOption) {
                            optionStyle = "bg-red-50 border-red-300 text-red-800";
                            icon = <IconX />;
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${optionStyle}`}
                            >
                              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                isCorrectOption
                                  ? "border-emerald-400 bg-emerald-100 text-emerald-700"
                                  : isSelected
                                  ? "border-red-400 bg-red-100 text-red-700"
                                  : "border-gray-300 bg-white text-gray-500"
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="text-sm flex-1">{option}</span>
                              {icon && <span className="flex-shrink-0">{icon}</span>}
                              {isSelected && !isCorrectOption && (
                                <span className="text-[10px] uppercase font-semibold text-red-500 tracking-wide">Your answer</span>
                              )}
                              {isCorrectOption && !isSelected && !item.isUnanswered && (
                                <span className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wide">Correct answer</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">No questions match this filter.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Back Navigation ── */}
          <motion.div variants={itemVariants} className="flex gap-3 pb-8">
            <button
              onClick={() => navigate("/results")}
              className="inline-flex items-center gap-2 bg-blue-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-800 transition-all duration-300 shadow-sm"
            >
              <IconBack />
              All Results
            </button>
            <button
              onClick={() => navigate("/exams")}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              Browse Exams
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ExamResultPage;
