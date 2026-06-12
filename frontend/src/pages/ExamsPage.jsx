import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getAllExams } from "../services/examService";
import { getMyResults } from "../services/resultService";
import Sidebar, { MobileMenuButton } from "../components/dashboard/Sidebar";
import ExamCodeModal from "../components/dashboard/ExamCodeModal";

const filterTabs = [
  { key: "all", label: "All Exams" },
  { key: "not_attempted", label: "Not Attempted" },
  { key: "completed", label: "Completed" },
];

const accessFilterTabs = [
  { key: "all", label: "All Access" },
  { key: "public", label: "Public" },
  { key: "private", label: "Private" },
];

const getExamAccessType = (exam) => exam.accessType || "public";

/* ───────── icons (inline heroicon-style SVGs) ───────── */

const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const IconClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const IconQuestion = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
  </svg>
);

const IconTrophy = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-4.5A3.375 3.375 0 0 0 19.875 10.5H21a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5h-1.172a3.375 3.375 0 0 0-.953-1.875A3.375 3.375 0 0 0 16.5 1.5h-9a3.375 3.375 0 0 0-2.375 1.125A3.375 3.375 0 0 0 4.172 4.5H3A1.5 1.5 0 0 0 1.5 6v3A1.5 1.5 0 0 0 3 10.5h1.125A3.375 3.375 0 0 0 7.5 14.25v4.5" />
  </svg>
);

const IconCalendar = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
  </svg>
);

const IconPlay = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
  </svg>
);

const IconRefresh = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
  </svg>
);

const IconEmpty = () => (
  <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const IconBell = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

/* ───────── skeleton loader ───────── */

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-gov">
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-5 w-3/5 bg-gray-200 rounded-lg" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-3 w-full bg-gray-200 rounded" />
          <div className="h-3 w-4/5 bg-gray-200 rounded" />
        </div>
        <div className="flex gap-2 mb-5">
          <div className="h-7 w-20 bg-gray-200 rounded-full" />
          <div className="h-7 w-24 bg-gray-200 rounded-full" />
          <div className="h-7 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-28 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SkeletonStatCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-gov">
      <div className="animate-pulse flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-6 w-12 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

/* ───────── stat card component ───────── */

function StatCard({ icon, label, value, color, index }) {
  const colorMap = {
    indigo: { bg: "bg-blue-50", text: "text-blue-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
    amber: { bg: "bg-amber-50", text: "text-amber-700" },
    violet: { bg: "bg-violet-50", text: "text-violet-700" },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`bg-white border border-gray-200 rounded-xl p-5 shadow-gov hover:shadow-gov-lg hover:border-blue-300 transition-all duration-300 group`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center ${c.text} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ───────── main page component ───────── */

function ExamsPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState("all");
  const [codeModalExam, setCodeModalExam] = useState(null);

  const startExam = (exam) => {
    const requiresExamCode = getExamAccessType(exam) === "private" && Boolean(exam.examCode);

    if (requiresExamCode) {
      setCodeModalExam(exam);
      return;
    }

    navigate(`/exam/${exam._id}`, { state: { codeVerified: true } });
  };

  /* ── data fetching ── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [examsData, resultsData] = await Promise.all([
          getAllExams(),
          getMyResults(),
        ]);
        setExams(examsData || []);
        setResults(resultsData || []);
      } catch (err) {
        console.error("Failed to fetch exams:", err);
        setError("Failed to load exams. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ── result lookup map: examId -> array of results ── */
  const resultMap = useMemo(() => {
    const map = {};
    results.forEach((r) => {
      const examId = r.exam?._id || r.exam;
      if (examId) {
        if (!map[examId]) map[examId] = [];
        map[examId].push(r);
      }
    });
    return map;
  }, [results]);

  /* ── derived stats ── */
  const stats = useMemo(() => {
    const total = exams.length;
    const completed = exams.filter((e) => {
      const attempts = resultMap[e._id];
      if (!attempts || attempts.length === 0) return false;
      const maxAllowed = e.allowReattempt ? e.maxAttempts : 1;
      return attempts.length >= maxAllowed;
    }).length;
    const notAttempted = exams.filter((e) => !resultMap[e._id]).length;
    const avgScore =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)
        : 0;
    return { total, completed, notAttempted, avgScore };
  }, [exams, results, resultMap]);

  /* ── filtered + searched exams ── */
  const filteredExams = useMemo(() => {
    let list = exams;

    // filter by tab
    if (activeFilter === "completed") {
      list = list.filter((e) => {
        const attempts = resultMap[e._id];
        if (!attempts || attempts.length === 0) return false;
        const maxAllowed = e.allowReattempt ? e.maxAttempts : 1;
        return attempts.length >= maxAllowed;
      });
    } else if (activeFilter === "not_attempted") {
      list = list.filter((e) => !resultMap[e._id]);
    }

    if (accessFilter !== "all") {
      list = list.filter((e) => getExamAccessType(e) === accessFilter);
    }

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((e) => e.title?.toLowerCase().includes(q));
    }

    return list;
  }, [exams, activeFilter, accessFilter, searchQuery, resultMap]);

  /* ── date formatter ── */
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  /* ── framer motion variants ── */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: 0.25 } },
  };

  /* ────────────────────── render ────────────────────── */

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                <h1 className="text-xl font-semibold text-gray-900">My Exams</h1>
                <p className="text-sm text-gray-500 mt-0.5">Browse and take available examinations</p>
              </motion.div>
            </div>
            <div className="flex items-center gap-4">
              <button
                id="btn-notification-bell"
                className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <IconBell />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>
              <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer hover:shadow-md transition-all duration-300">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ── Error State ── */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* ── Stats Row ── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <StatCard
                index={0}
                color="indigo"
                label="Total Exams"
                value={stats.total}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                }
              />
              <StatCard
                index={1}
                color="emerald"
                label="Completed"
                value={stats.completed}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />
              <StatCard
                index={2}
                color="amber"
                label="Not Attempted"
                value={stats.notAttempted}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                }
              />
              <StatCard
                index={3}
                color="violet"
                label="Average Score"
                value={`${stats.avgScore}%`}
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                }
              />
            </div>
          )}

          {/* ── Search + Filter Row ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
          >
            {/* Search */}
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <IconSearch />
              </div>
              <input
                id="input-exam-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exams by title..."
                className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-gray-900 placeholder:text-gray-400 text-sm shadow-sm"
              />
              {searchQuery && (
                <button
                  id="btn-clear-search"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
                {filterTabs.map((tab) => (
                  <button
                    id={`filter-tab-${tab.key}`}
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeFilter === tab.key
                        ? "bg-blue-900 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                    {activeFilter === tab.key && tab.key !== "all" && (
                      <span className="ml-1.5 text-xs opacity-80">
                        {tab.key === "completed" ? stats.completed : stats.notAttempted}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm overflow-x-auto">
                {accessFilterTabs.map((tab) => (
                  <button
                    id={`access-filter-tab-${tab.key}`}
                    key={tab.key}
                    onClick={() => setAccessFilter(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      accessFilter === tab.key
                        ? "bg-emerald-700 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Results Count ── */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="text-gray-900 font-medium">{filteredExams.length}</span>{" "}
                {filteredExams.length === 1 ? "exam" : "exams"}
                {searchQuery && (
                  <span>
                    {" "}for &ldquo;<span className="text-blue-700">{searchQuery}</span>&rdquo;
                  </span>
                )}
              </p>
            </motion.div>
          )}

          {/* ── Loading Skeleton Grid ── */}
          {loading && (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Exam Cards Grid ── */}
          {!loading && filteredExams.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredExams.map((exam) => {
                  const attempts = resultMap[exam._id] || [];
                  const attemptCount = attempts.length;
                  const maxAllowed = exam.allowReattempt ? exam.maxAttempts : 1;
                  const isFullyCompleted = attemptCount >= maxAllowed;
                  const hasAttempted = attemptCount > 0;
                  const remainingAttempts = maxAllowed - attemptCount;
                  // Best result (highest percentage)
                  const bestResult = attempts.length > 0
                    ? attempts.reduce((best, r) => (r.percentage || 0) > (best.percentage || 0) ? r : best, attempts[0])
                    : null;

                  return (
                    <motion.div
                      key={exam._id}
                      variants={cardVariants}
                      layout
                      exit="exit"
                      className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-gov hover:shadow-gov-lg hover:border-blue-300 transition-all duration-300 flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 transition-all duration-300 leading-snug line-clamp-1">
                          {exam.title}
                        </h3>
                        {isFullyCompleted ? (
                          <span className="shrink-0 inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Completed
                          </span>
                        ) : hasAttempted ? (
                          <span className="shrink-0 inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                            </svg>
                            {attemptCount}/{maxAllowed} Attempts
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5" />
                            </svg>
                            Not Attempted
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                        {exam.description || "No description provided for this examination."}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          <IconClock />
                          {exam.duration} mins
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          <IconQuestion />
                          {exam.questionCount} Qs
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          <IconTrophy />
                          {exam.totalMarks} marks
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            getExamAccessType(exam) === "public"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {getExamAccessType(exam) === "public" ? "Public" : "Private"}
                        </span>
                        {exam.allowReattempt && maxAllowed > 1 && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                            <IconRefresh />
                            {maxAllowed} attempts
                          </span>
                        )}
                      </div>

                      {/* Score (if has any attempt) */}
                      {bestResult && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
                              {attemptCount > 1 ? `Best Score (${attemptCount} attempt${attemptCount > 1 ? 's' : ''})` : 'Your Score'}
                            </span>
                            <span className={`text-sm font-bold ${
                              bestResult.percentage >= 75
                                ? "text-emerald-600"
                                : bestResult.percentage >= 50
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}>
                              {bestResult.score}/{bestResult.totalQuestions} ({bestResult.percentage}%)
                            </span>
                          </div>
                          {/* Score bar */}
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(bestResult.percentage, 100)}%` }}
                              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                bestResult.percentage >= 75
                                  ? "bg-emerald-500"
                                  : bestResult.percentage >= 50
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                            />
                          </div>
                        </div>
                      )}

                      {/* spacer to push footer to bottom */}
                      <div className="flex-1" />

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <IconCalendar />
                          <span>{formatDate(exam.createdAt)}</span>
                        </div>

                        {isFullyCompleted ? (
                          <span
                            id={`btn-exam-action-${exam._id}`}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            Completed
                          </span>
                        ) : hasAttempted ? (
                          <button
                            id={`btn-exam-action-${exam._id}`}
                            onClick={() => startExam(exam)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                          >
                            <IconRefresh />
                            Retake ({remainingAttempts} left)
                          </button>
                        ) : (
                          <button
                            id={`btn-exam-action-${exam._id}`}
                            onClick={() => startExam(exam)}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                          >
                            <IconPlay />
                            Start Exam
                          </button>
                        )}
                      </div>

                      {/* Created by */}
                      {exam.createdBy?.name && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-700">
                            {exam.createdBy.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-500">
                            by {exam.createdBy.name}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ── Empty State ── */}
          {!loading && filteredExams.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-24 h-24 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <IconEmpty />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No exams found</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
                {searchQuery
                  ? `No exams match your search for "${searchQuery}". Try adjusting your search or filter criteria.`
                  : activeFilter === "completed"
                  ? "You haven't completed any exams yet. Start taking exams to see them here."
                  : activeFilter === "not_attempted"
                  ? "Great job! You've attempted all available exams."
                  : "There are no exams available at the moment. Check back later."}
              </p>
              {(searchQuery || activeFilter !== "all" || accessFilter !== "all") && (
                <button
                  id="btn-clear-filters"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                    setAccessFilter("all");
                  }}
                  className="inline-flex items-center gap-2 bg-blue-900 px-5 py-2 rounded-xl text-sm font-medium text-white hover:bg-blue-800 transition-all duration-300 shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <ExamCodeModal
        isOpen={!!codeModalExam}
        onClose={() => setCodeModalExam(null)}
        examCode={codeModalExam?.examCode}
        onVerified={() => {
          const id = codeModalExam._id;
          setCodeModalExam(null);
          navigate(`/exam/${id}`, { state: { codeVerified: true } });
        }}
      />
    </div>
  );
}

export default ExamsPage;
