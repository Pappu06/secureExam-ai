import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar, { MobileMenuButton } from "../components/dashboard/Sidebar";
import { getProfile, updateProfile, changePassword } from "../services/userService";
import { getMyResults } from "../services/resultService";

/* ------------------------------------------------------------------ */
/*  Reusable inline SVG icons (heroicons outline style)               */
/* ------------------------------------------------------------------ */
const icons = {
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  exclamation: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
  ),
  trash: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 9v9.75" />
    </svg>
  ),
  academicCap: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  ),
  chartBar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.178-1.768-.767-1.605-1.727.11-.642.636-1.119 1.266-1.245a47.07 47.07 0 0 1 7.089-.573 47.07 47.07 0 0 1 7.089.573c.63.126 1.156.603 1.266 1.245.163.96-.609 1.905-1.605 1.727a45.065 45.065 0 0 0-6.75-.51 45.065 45.065 0 0 0-6.75.51Z" />
    </svg>
  ),
  xMark: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  eyeSlash: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ),
  fingerprint: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a48.667 48.667 0 0 0 .046 4.834M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-2.614 7.653a48.114 48.114 0 0 1-3.274-6.165M12 10.5c0 3.042-.09 6.045-.264 9" />
    </svg>
  ),
  spinner: (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                   */
/* ------------------------------------------------------------------ */
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function performanceColor(pct) {
  if (pct >= 80) return "text-emerald-700";
  if (pct >= 60) return "text-amber-700";
  return "text-red-700";
}

function performanceBg(pct) {
  if (pct >= 80) return "bg-emerald-50";
  if (pct >= 60) return "bg-amber-50";
  return "bg-red-50";
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

/* ------------------------------------------------------------------ */
/*  PROFILE PAGE COMPONENT                                            */
/* ------------------------------------------------------------------ */
function ProfilePage() {
  /* ---- state ---- */
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // personal info form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // alert system
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

  /* ---- show alert helper ---- */
  const showAlert = useCallback((type, message) => {
    setAlert({ type, message });
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, []);

  /* ---- fetch data ---- */
  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, resultsRes] = await Promise.all([
          getProfile(),
          getMyResults().catch(() => []),
        ]);
        const user = profileRes.user || profileRes;
        setProfile(user);
        setFormName(user.name || "");
        setFormEmail(user.email || "");
        setResults(Array.isArray(resultsRes) ? resultsRes : []);
      } catch (err) {
        console.error("Failed to load profile:", err);
        showAlert("error", "Failed to load profile data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showAlert]);

  /* ---- computed stats ---- */
  const examsTaken = results.length;
  const avgScore =
    examsTaken > 0
      ? Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / examsTaken)
      : 0;
  const highestScore =
    examsTaken > 0 ? Math.round(Math.max(...results.map((r) => r.percentage || 0))) : 0;

  /* ---- handlers ---- */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showAlert("error", "Name and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await updateProfile({ name: formName.trim(), email: formEmail.trim() });
      const updatedUser = res.user || { ...profile, name: formName.trim(), email: formEmail.trim() };
      setProfile(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      showAlert("success", res.message || "Profile updated successfully.");
    } catch (err) {
      showAlert("error", err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showAlert("error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("error", "New password and confirmation do not match.");
      return;
    }
    if (!currentPassword) {
      showAlert("error", "Current password is required.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await changePassword({ currentPassword, newPassword });
      showAlert("success", res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      showAlert("error", err?.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  /* ---- loading skeleton ---- */
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-72 overflow-auto">
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-4 w-48 bg-gray-100 rounded-lg animate-pulse mt-2" />
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header skeleton */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-gov">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 rounded-lg animate-pulse" />
                  <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            {/* Body skeleton */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl h-72 shadow-gov animate-pulse" />
              <div className="bg-white border border-gray-200 rounded-xl h-72 shadow-gov animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---- main render ---- */
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72 overflow-auto">
        {/* ===== Top Bar ===== */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                id="profile-notifications-btn"
                className="relative p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
              </button>
              <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Content ===== */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* ---- Alert Banner ---- */}
          <AnimatePresence>
            {alert && (
              <motion.div
                id="profile-alert-banner"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className={`mb-6 flex items-center justify-between gap-3 px-5 py-3.5 rounded-xl border ${
                  alert.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  {alert.type === "success" ? icons.check : icons.exclamation}
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <button
                  id="profile-alert-dismiss"
                  onClick={() => setAlert(null)}
                  className="p-1 rounded-lg hover:bg-black/5 transition-colors"
                >
                  {icons.xMark}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== 1. Profile Header Card ===== */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="bg-blue-900 rounded-xl p-6 sm:p-8 mb-6 shadow-md"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
              {/* Avatar + Info */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="w-24 h-24 bg-amber-500 rounded-full flex items-center justify-center text-3xl font-bold text-blue-900 shrink-0 shadow-lg">
                  {getInitials(profile?.name)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold text-white truncate">{profile?.name}</h2>
                  <p className="text-blue-200 mt-1 truncate">{profile?.email}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className="bg-white/15 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                      {profile?.role || "Student"}
                    </span>
                    <span className="flex items-center gap-1.5 text-blue-200 text-sm">
                      {icons.calendar}
                      Member since {formatDate(profile?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-4 lg:gap-6">
                {/* Exams Taken */}
                <div className="flex flex-col items-center gap-1 px-5 py-3 bg-white/10 rounded-xl min-w-[100px]">
                  <div className="p-2 bg-white/15 rounded-lg text-white mb-1">
                    {icons.academicCap}
                  </div>
                  <span className="text-xl font-bold text-white">{examsTaken}</span>
                  <span className="text-xs text-blue-200">Exams Taken</span>
                </div>
                {/* Average Score */}
                <div className="flex flex-col items-center gap-1 px-5 py-3 bg-white/10 rounded-xl min-w-[100px]">
                  <div className="p-2 bg-white/15 rounded-lg text-white mb-1">
                    {icons.chartBar}
                  </div>
                  <span className="text-xl font-bold text-white">{avgScore}%</span>
                  <span className="text-xs text-blue-200">Avg Score</span>
                </div>
                {/* Highest Score */}
                <div className="flex flex-col items-center gap-1 px-5 py-3 bg-white/10 rounded-xl min-w-[100px]">
                  <div className="p-2 bg-white/15 rounded-lg text-white mb-1">
                    {icons.trophy}
                  </div>
                  <span className="text-xl font-bold text-white">{highestScore}%</span>
                  <span className="text-xs text-blue-200">Highest</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ===== 2. Two-Column Layout ===== */}
          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* ---- Left Column: Tabs ---- */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="lg:col-span-2"
            >
              <div className="bg-white border border-gray-200 rounded-xl shadow-gov overflow-hidden">
                {/* Tab bar */}
                <div className="flex border-b border-gray-200">
                  <button
                    id="tab-personal"
                    onClick={() => setActiveTab("personal")}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                      activeTab === "personal"
                        ? "bg-blue-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {icons.user}
                    Personal Information
                  </button>
                  <button
                    id="tab-security"
                    onClick={() => setActiveTab("security")}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all duration-200 relative ${
                      activeTab === "security"
                        ? "bg-blue-900 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {icons.lock}
                    Security
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === "personal" && (
                      <motion.form
                        key="personal"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        id="profile-personal-form"
                        onSubmit={handleSaveProfile}
                        className="space-y-5"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Personal Information
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Update your personal details. Changes will be reflected across your account.
                          </p>
                        </div>

                        {/* Name field */}
                        <div>
                          <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            id="profile-name"
                            type="text"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="Enter your full name"
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          />
                        </div>

                        {/* Email field */}
                        <div>
                          <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            id="profile-email"
                            type="email"
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            placeholder="Enter your email address"
                            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          />
                        </div>

                        {/* Save button */}
                        <div className="pt-2">
                          <button
                            id="profile-save-btn"
                            type="submit"
                            disabled={savingProfile}
                            className="bg-blue-900 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-blue-800 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:hover:bg-blue-900 flex items-center gap-2"
                          >
                            {savingProfile ? (
                              <>
                                {icons.spinner}
                                Saving...
                              </>
                            ) : (
                              <>
                                {icons.check}
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}

                    {activeTab === "security" && (
                      <motion.form
                        key="security"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        id="profile-security-form"
                        onSubmit={handleChangePassword}
                        className="space-y-5"
                      >
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Change Password
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Ensure your account stays secure by using a strong, unique password.
                          </p>
                        </div>

                        {/* Current Password */}
                        <div>
                          <label htmlFor="profile-current-password" className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              id="profile-current-password"
                              type={showCurrentPw ? "text" : "password"}
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter your current password"
                              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              id="toggle-current-pw"
                              onClick={() => setShowCurrentPw(!showCurrentPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showCurrentPw ? icons.eyeSlash : icons.eye}
                            </button>
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label htmlFor="profile-new-password" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              id="profile-new-password"
                              type={showNewPw ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Minimum 6 characters"
                              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              id="toggle-new-pw"
                              onClick={() => setShowNewPw(!showNewPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showNewPw ? icons.eyeSlash : icons.eye}
                            </button>
                          </div>
                          {newPassword.length > 0 && newPassword.length < 6 && (
                            <p className="mt-1.5 text-xs text-red-600">
                              Password must be at least 6 characters
                            </p>
                          )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                          <label htmlFor="profile-confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              id="profile-confirm-password"
                              type={showConfirmPw ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter your new password"
                              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            />
                            <button
                              type="button"
                              id="toggle-confirm-pw"
                              onClick={() => setShowConfirmPw(!showConfirmPw)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              {showConfirmPw ? icons.eyeSlash : icons.eye}
                            </button>
                          </div>
                          {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                            <p className="mt-1.5 text-xs text-red-600">
                              Passwords do not match
                            </p>
                          )}
                        </div>

                        {/* Update button */}
                        <div className="pt-2">
                          <button
                            id="profile-change-pw-btn"
                            type="submit"
                            disabled={savingPassword}
                            className="bg-blue-900 px-5 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-blue-800 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:hover:bg-blue-900 flex items-center gap-2"
                          >
                            {savingPassword ? (
                              <>
                                {icons.spinner}
                                Updating...
                              </>
                            ) : (
                              <>
                                {icons.shield}
                                Update Password
                              </>
                            )}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* ---- Right Column: Activity Summary ---- */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov">
                <div className="flex items-center gap-2 mb-6">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                    {icons.fingerprint}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Account Overview</h3>
                </div>

                <div className="space-y-4">
                  {/* Account ID */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Account ID</span>
                    <span className="text-sm text-gray-700 font-mono bg-gray-100 px-2.5 py-1 rounded-lg">
                      {profile?._id ? `${profile._id.slice(0, 4)}...${profile._id.slice(-4)}` : "N/A"}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Role</span>
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                      {profile?.role || "Student"}
                    </span>
                  </div>

                  {/* Member Since */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Member Since</span>
                    <span className="text-sm text-gray-900">
                      {formatDateShort(profile?.createdAt)}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <span className="text-sm text-gray-900">
                      {formatDateShort(profile?.updatedAt)}
                    </span>
                  </div>

                  {/* Total Exams */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Total Exams</span>
                    <span className="text-sm font-semibold text-gray-900">{examsTaken}</span>
                  </div>

                  {/* Average Performance */}
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">Avg Performance</span>
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${performanceColor(avgScore)} ${performanceBg(avgScore)}`}
                    >
                      {examsTaken > 0 ? `${avgScore}%` : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Decorative bar at bottom */}
                <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-blue-900 via-amber-500 to-blue-900 opacity-40" />
              </div>
            </motion.div>
          </div>

          {/* ===== 3. Danger Zone ===== */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0 mt-0.5">
                  {icons.exclamation}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Danger Zone</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Deleting your account is permanent and cannot be undone. All your exam results,
                    progress, and personal data will be permanently removed.
                  </p>
                </div>
              </div>

              <div className="relative group shrink-0 sm:self-center">
                <button
                  id="profile-delete-account-btn"
                  disabled
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 cursor-not-allowed opacity-60 flex items-center gap-2"
                >
                  {icons.trash}
                  Delete Account
                </button>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Contact admin to delete your account
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
