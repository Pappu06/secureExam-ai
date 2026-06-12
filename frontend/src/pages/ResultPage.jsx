import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";
import ExcelJS from "exceljs";

import { getMyResults } from "../services/resultService";
import Sidebar, { MobileMenuButton } from "../components/dashboard/Sidebar";

/* ────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────── */

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const truncate = (str, len = 18) => {
  if (!str) return "";
  return str.length > len ? str.slice(0, len) + "…" : str;
};

const pctColor = (p) => {
  if (p >= 70) return "text-emerald-600";
  if (p >= 40) return "text-amber-600";
  return "text-red-600";
};

const pctBg = (p) => {
  if (p >= 70) return "bg-emerald-50 text-emerald-700";
  if (p >= 40) return "bg-amber-50 text-amber-700";
  return "bg-red-50 text-red-700";
};

/* ────────────────────────────────────────────────────────
   Custom Recharts Tooltip
   ──────────────────────────────────────────────────────── */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-semibold text-gray-900">
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

/* ────────────────────────────────────────────────────────
   Skeleton Loader
   ──────────────────────────────────────────────────────── */

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov animate-pulse">
    <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
    <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
    <div className="h-3 w-32 bg-gray-100 rounded" />
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov animate-pulse h-80">
    <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
    <div className="h-full w-full bg-gray-100 rounded-xl" />
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-100 animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-gray-200 rounded w-full" />
      </td>
    ))}
  </tr>
);

/* ────────────────────────────────────────────────────────
   Inline SVG Icons
   ──────────────────────────────────────────────────────── */

const IconExam = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const IconChart = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const IconTrophy = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0 1 16.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.022 6.022 0 0 1-3.522 1.272 6.023 6.023 0 0 1-3.522-1.272" />
  </svg>
);

const IconShield = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286Z" />
  </svg>
);

const IconDownload = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const IconClose = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const IconSort = ({ dir }) => (
  <svg className="w-3.5 h-3.5 ml-1 inline-block" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    {dir === "asc" ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    ) : dir === "desc" ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
    )}
  </svg>
);

const IconEye = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const IconClock = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

/* ────────────────────────────────────────────────────────
   Motion variants
   ──────────────────────────────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2, ease: "easeIn" } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/* ────────────────────────────────────────────────────────
   KPI Card component
   ──────────────────────────────────────────────────────── */

const KpiCard = ({ icon, iconBg, title, value, subtitle, valueClass = "text-gray-900" }) => (
  <motion.div
    variants={itemVariants}
    className="bg-white border border-gray-200 rounded-xl p-5 shadow-gov hover:shadow-md transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
    </div>
    <p className={`text-3xl font-bold tracking-tight ${valueClass}`}>{value}</p>
    <p className="text-sm text-gray-500 mt-1">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </motion.div>
);

/* ────────────────────────────────────────────────────────
   Empty State
   ──────────────────────────────────────────────────────── */

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="flex flex-col items-center justify-center py-24"
  >
    <div className="relative mb-8">
      <svg className="w-32 h-32 text-gray-300 relative" fill="none" viewBox="0 0 120 120">
        <rect x="20" y="15" width="80" height="95" rx="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="35" y1="35" x2="85" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="35" y1="50" x2="75" y2="50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="35" y1="62" x2="70" y2="62" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="35" y1="74" x2="65" y2="74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <circle cx="85" cy="85" r="22" stroke="#1e3a8a" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M 95 95 L 108 108" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Yet</h3>
    <p className="text-gray-500 text-sm text-center max-w-md leading-relaxed">
      You haven&apos;t completed any exams yet. Once you take an exam, your results and analytics will appear here.
    </p>
    <a
      href="/dashboard"
      className="mt-6 inline-flex items-center gap-2 bg-blue-900 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-blue-800 transition-all duration-300 shadow-sm"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
      Browse Exams
    </a>
  </motion.div>
);

/* ────────────────────────────────────────────────────────
   Detail Modal
   ──────────────────────────────────────────────────────── */

const DetailModal = ({ result, onClose }) => {
  if (!result) return null;

  const correct = result.score || 0;
  const total = result.totalQuestions || 0;
  const incorrect = total - correct;
  const pct = result.percentage ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{result.exam?.title || "Exam Result"}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(result.submittedAt)}</p>
            </div>
            <button
              id="modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
            >
              <IconClose />
            </button>
          </div>

          {/* Modal Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Score ring */}
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke={pct >= 70 ? "#059669" : pct >= 40 ? "#d97706" : "#dc2626"}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * 263.89} 263.89`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xl font-bold ${pctColor(pct)}`}>{pct}%</span>
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Score</span>
                  <span className="text-gray-900 font-medium">{correct}/{total}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Time Taken</span>
                  <span className="text-gray-900 font-medium flex items-center gap-1.5">
                    <IconClock />
                    {formatTime(result.timeTaken)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Violations</span>
                  <span className={`font-medium ${result.violations > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {result.violations || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Bar */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Answer Summary</p>
              <div className="flex gap-3">
                <div className="flex-1 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-emerald-700">{correct}</p>
                  <p className="text-xs text-emerald-600 mt-0.5">Correct</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-red-700">{incorrect}</p>
                  <p className="text-xs text-red-600 mt-0.5">Incorrect</p>
                </div>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{total}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total</p>
                </div>
              </div>
            </div>

            {/* Full-width percentage bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Performance</span>
                <span>{pct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${
                    pct >= 70
                      ? "bg-emerald-500"
                      : pct >= 40
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </div>

            {/* Exam description */}
            {result.exam?.description && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Exam Description</p>
                <p className="text-sm text-gray-700 leading-relaxed">{result.exam.description}</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 pb-6 pt-2">
            <button
              id="modal-done-btn"
              onClick={onClose}
              className="w-full bg-blue-900 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-blue-800 transition-all duration-300 shadow-sm"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

/* ────────────────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────────────────── */

function ResultPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("submittedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  /* ── Fetch data ── */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getMyResults();
        setResults(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  /* ── Computed analytics ── */
  const analytics = useMemo(() => {
    if (!results.length) return { total: 0, avg: 0, highest: 0, violations: 0 };
    const percentages = results.map((r) => r.percentage ?? 0);
    return {
      total: results.length,
      avg: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
      highest: Math.max(...percentages),
      violations: results.reduce((sum, r) => sum + (r.violations || 0), 0),
    };
  }, [results]);

  /* ── Chart data ── */
  const lineData = useMemo(() => {
    return [...results]
      .sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt))
      .map((r) => ({
        date: formatDate(r.submittedAt),
        Score: r.percentage ?? 0,
      }));
  }, [results]);

  const barData = useMemo(() => {
    return results.map((r) => ({
      name: truncate(r.exam?.title, 14),
      Percentage: r.percentage ?? 0,
    }));
  }, [results]);

  /* ── Filtered + sorted results ── */
  const filteredResults = useMemo(() => {
    let list = [...results];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.exam?.title?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let aVal, bVal;
      switch (sortKey) {
        case "score":
          aVal = a.score ?? 0;
          bVal = b.score ?? 0;
          break;
        case "percentage":
          aVal = a.percentage ?? 0;
          bVal = b.percentage ?? 0;
          break;
        case "submittedAt":
        default:
          aVal = new Date(a.submittedAt).getTime();
          bVal = new Date(b.submittedAt).getTime();
          break;
      }
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    });
    return list;
  }, [results, search, sortKey, sortDir]);

  /* ── Sort handler ── */
  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("desc");
      }
    },
    [sortKey]
  );

  /* ── Excel export ── */
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Results");

    worksheet.columns = [
      { header: "Exam", key: "exam", width: 30 },
      { header: "Score", key: "score", width: 15 },
      { header: "Percentage", key: "percentage", width: 15 },
      { header: "Violations", key: "violations", width: 15 },
      { header: "Date", key: "date", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "1E3A8A" },
    };

    results.forEach((r) => {
      worksheet.addRow({
        exam: r.exam?.title,
        score: `${r.score}/${r.totalQuestions}`,
        percentage: `${r.percentage}%`,
        violations: r.violations,
        date: new Date(r.submittedAt).toLocaleDateString(),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exam_results.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ── Column header helper ── */
  const SortableHeader = ({ label, sortId, className = "" }) => (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:text-blue-800 transition-colors select-none ${className}`}
      onClick={() => handleSort(sortId)}
    >
      <span className="inline-flex items-center">
        {label}
        <IconSort dir={sortKey === sortId ? sortDir : null} />
      </span>
    </th>
  );

  /* ────────────────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 overflow-auto">
        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Results & Analytics</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track your performance across all exams
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Export button */}
              {results.length > 0 && (
                <button
                  id="export-excel-btn"
                  onClick={exportToExcel}
                  className="inline-flex items-center gap-2 bg-emerald-600 px-5 py-2 rounded-xl text-sm font-medium text-white hover:bg-emerald-700 transition-all duration-300 shadow-sm"
                >
                  <IconDownload />
                  <span className="hidden sm:inline">Export to Excel</span>
                </button>
              )}
              {/* User Avatar */}
              <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Loading state */}
          {loading && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <SkeletonChart />
                <SkeletonChart />
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && results.length === 0 && <EmptyState />}

          {/* Main analytics content */}
          {!loading && !error && results.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* ── KPI Cards ── */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              >
                <KpiCard
                  icon={<IconExam />}
                  iconBg="bg-blue-50 text-blue-700"
                  title="Total Exams Taken"
                  value={analytics.total}
                  subtitle={`Last: ${formatDate(results[0]?.submittedAt)}`}
                />
                <KpiCard
                  icon={<IconChart />}
                  iconBg="bg-amber-50 text-amber-700"
                  title="Average Score"
                  value={`${analytics.avg}%`}
                  valueClass={pctColor(analytics.avg)}
                  subtitle={analytics.avg >= 70 ? "Excellent performance" : analytics.avg >= 40 ? "Room for improvement" : "Needs attention"}
                />
                <KpiCard
                  icon={<IconTrophy />}
                  iconBg="bg-emerald-50 text-emerald-700"
                  title="Highest Score"
                  value={`${analytics.highest}%`}
                  valueClass="text-emerald-600"
                  subtitle="Personal best"
                />
                <KpiCard
                  icon={<IconShield />}
                  iconBg="bg-red-50 text-red-700"
                  title="Total Violations"
                  value={analytics.violations}
                  valueClass={analytics.violations > 0 ? "text-red-600" : "text-emerald-600"}
                  subtitle={analytics.violations === 0 ? "Clean record" : "Review integrity"}
                />
              </motion.div>

              {/* ── Charts ── */}
              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                {/* Line / Area Chart – Performance Trend */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Performance Trend</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Score progression over time</p>
                    </div>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      {results.length} exams
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3a8a" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="date"
                          stroke="#9ca3af"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="Score"
                          stroke="#1e3a8a"
                          strokeWidth={2.5}
                          fill="url(#scoreGradient)"
                          dot={{ r: 4, fill: "#1e3a8a", stroke: "#fff", strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: "#1e40af", stroke: "#fff", strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Bar Chart – Score Comparison */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">Score Comparison</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Percentage per exam</p>
                    </div>
                    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      Avg: {analytics.avg}%
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d97706" stopOpacity={1} />
                            <stop offset="100%" stopColor="#b45309" stopOpacity={0.7} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="name"
                          stroke="#9ca3af"
                          tick={{ fontSize: 10, fill: "#6b7280" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#9ca3af"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="Percentage"
                          fill="url(#barGradient)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </motion.div>

              {/* ── Results History Table ── */}
              <motion.div
                variants={itemVariants}
                className="bg-white border border-gray-200 rounded-xl shadow-gov overflow-hidden"
              >
                {/* Table header area */}
                <div className="px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Results History</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {filteredResults.length} of {results.length} results
                    </p>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <IconSearch />
                    </span>
                    <input
                      id="search-results-input"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search exams..."
                      className="bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400 w-64"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Exam Title
                        </th>
                        <SortableHeader label="Score" sortId="score" />
                        <SortableHeader label="Percentage" sortId="percentage" />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Violations
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Time
                        </th>
                        <SortableHeader label="Date" sortId="submittedAt" />
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResults.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-gray-500 text-sm">
                            No results match your search.
                          </td>
                        </tr>
                      ) : (
                        filteredResults.map((r, idx) => (
                          <motion.tr
                            key={r._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                                {r.exam?.title || "—"}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                              {r.score}/{r.totalQuestions}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${pctBg(r.percentage)}`}>
                                {r.percentage}%
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-sm font-medium ${
                                  r.violations > 0 ? "text-red-600" : "text-gray-400"
                                }`}
                              >
                                {r.violations || 0}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                              {formatTime(r.timeTaken)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(r.submittedAt)}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                id={`view-detail-${r._id}`}
                                onClick={() => navigate(`/result/${r._id}`)}
                                className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
                              >
                                <IconEye />
                                View
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
