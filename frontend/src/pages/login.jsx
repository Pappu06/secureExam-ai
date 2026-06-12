import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "../context/AuthContext";

import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";


// ── OTP Input Component ──────────────────────────────────
function OtpInput({ length = 4, value, onChange, disabled }) {

    const inputRefs = useRef([]);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return; // Only allow digits

        const newOtp = value.split("");
        newOtp[index] = val.slice(-1); // Take last digit
        const joined = newOtp.join("");
        onChange(joined);

        // Auto-focus next input
        if (val && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
        onChange(pasted.padEnd(length, ""));
        const focusIndex = Math.min(pasted.length, length - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={disabled}
                    value={value[i] || ""}
                    onChange={(e) => handleChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-14 text-center text-xl font-bold bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-300 disabled:opacity-50"
                    autoComplete="one-time-code"
                />
            ))}
        </div>
    );
}


// ── Main Login Component ─────────────────────────────────
function Login() {

    const navigate = useNavigate();
    const { login, forgotPassword, resetPassword, isAuthenticated, user } = useAuth();

    // UI state — "login" | "forgot-email" | "forgot-otp" | "forgot-newpass"
    const [view, setView] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Login form data
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // Forgot password data
    const [resetEmail, setResetEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // Countdown timer for resend
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);


    // If already logged in, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        if (user.role === "admin") {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (error) setError("");
    };


    // ── Password Login Submit ────────────────────────────
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.email || !formData.password) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            const loggedInUser = await login(formData.email, formData.password);

            if (loggedInUser?.role === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Login failed. Please check your credentials.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };


    // ── Forgot Password: Step 1 — Send OTP ──────────────
    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!resetEmail) {
            setError("Please enter your email address");
            return;
        }

        try {
            setLoading(true);
            await forgotPassword(resetEmail);
            setView("forgot-otp");
            setOtpValue("");
            setCountdown(60);
            setSuccess("A password reset code has been sent to your email.");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Failed to send reset code. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };


    // ── Forgot Password: Step 2 — Verify OTP ────────────
    const handleVerifyResetOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (otpValue.length !== 4) {
            setError("Please enter the complete 4-digit code");
            return;
        }

        // Move to the new password step
        setView("forgot-newpass");
        setSuccess("OTP accepted. Now set your new password.");
    };


    // ── Forgot Password: Step 3 — Reset Password ────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!newPassword || !confirmNewPassword) {
            setError("Please fill in all fields");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (!/[A-Z]/.test(newPassword)) {
            setError("Password must contain at least one uppercase letter");
            return;
        }

        if (!/[a-z]/.test(newPassword)) {
            setError("Password must contain at least one lowercase letter");
            return;
        }

        if (!/[0-9]/.test(newPassword)) {
            setError("Password must contain at least one number");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await resetPassword(resetEmail, otpValue, newPassword);
            setSuccess("Password reset successfully! Redirecting to login...");

            // Reset state and switch back to login after a short delay
            setTimeout(() => {
                setView("login");
                setResetEmail("");
                setOtpValue("");
                setNewPassword("");
                setConfirmNewPassword("");
                setSuccess("");
                setError("");
            }, 2000);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Password reset failed. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };


    // ── Resend OTP ───────────────────────────────────────
    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setError("");
        setSuccess("");

        try {
            setLoading(true);
            await forgotPassword(resetEmail);
            setOtpValue("");
            setCountdown(60);
            setSuccess("A new reset code has been sent to your email.");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                "Failed to resend code. Please try again.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };


    // ── Go back to login ────────────────────────────────
    const goBackToLogin = () => {
        setView("login");
        setError("");
        setSuccess("");
        setResetEmail("");
        setOtpValue("");
        setNewPassword("");
        setConfirmNewPassword("");
    };


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

                {/* LEFT PANEL — hidden on mobile */}
                <motion.div
                    className="hidden lg:block"
                    initial={{
                        opacity: 0,
                        x: -40,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                    }}
                >

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-1.5 text-sm text-blue-800 mb-6">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        Secure Platform
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight text-gray-900">
                        Welcome back to
                        <br />
                        <span className="text-blue-900">
                            SecureExam AI
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-gray-600 text-lg mt-4">
                        Sign in to access your secure examination dashboard, manage tests, and monitor results in real time.
                    </p>

                    {/* Feature List */}
                    <div className="mt-10 space-y-4">

                        <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            Secure Authentication
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            Password Recovery via Email
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            Instant Evaluation
                        </div>

                        <div className="flex items-center gap-3 text-gray-700">
                            <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            AI Proctoring
                        </div>

                    </div>

                </motion.div>

                {/* RIGHT PANEL */}
                <motion.div
                    initial={{
                        opacity: 0,
                        x: 40,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                    }}
                >

                    <Card className="p-8 sm:p-10">

                        <AnimatePresence mode="wait">

                            {/* ── STANDARD LOGIN FORM ────────────────── */}
                            {view === "login" && (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold mb-1 text-gray-900">
                                        Sign In
                                    </h2>

                                    <p className="text-gray-500 text-sm mb-8">
                                        Enter your credentials to continue
                                    </p>

                                    {/* Error Alert */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handlePasswordSubmit}>

                                        <Input
                                            label="Email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                        />

                                        <div className="mb-5">

                                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                                                Password
                                            </label>

                                            <div className="flex items-center bg-white border border-gray-300 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all duration-300">

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    value={
                                                        formData.password
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                                                    placeholder="Enter your password"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="px-3 text-gray-500 hover:text-blue-700 text-sm transition-colors"
                                                >
                                                    {
                                                        showPassword
                                                            ? "Hide"
                                                            : "Show"
                                                    }
                                                </button>

                                            </div>

                                        </div>

                                        {/* Forgot Password Link */}
                                        <div className="flex justify-end mb-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setView("forgot-email");
                                                    setError("");
                                                    setSuccess("");
                                                }}
                                                className="text-sm text-blue-700 hover:text-blue-900 transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </div>

                                        <Button disabled={loading}>
                                            {loading ? "Logging In..." : "Login"}
                                        </Button>

                                    </form>

                                    <p className="mt-6 text-center text-sm text-gray-500">
                                        Don't have an account?
                                        <Link to="/register" className="text-blue-700 hover:text-blue-900 ml-2 transition-colors">
                                            Register
                                        </Link>
                                    </p>
                                </motion.div>
                            )}


                            {/* ── FORGOT PASSWORD: EMAIL STEP ────────── */}
                            {view === "forgot-email" && (
                                <motion.div
                                    key="forgot-email"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1 text-gray-900">
                                            Forgot Password
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Enter your email and we'll send a verification code
                                        </p>
                                    </div>

                                    {/* Error Alert */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleForgotSendOtp}>

                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => {
                                                    setResetEmail(e.target.value);
                                                    if (error) setError("");
                                                }}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-300"
                                                placeholder="Enter your registered email"
                                            />
                                        </div>

                                        <Button disabled={loading}>
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
                                                    </svg>
                                                    Sending Code...
                                                </span>
                                            ) : (
                                                "Send Reset Code"
                                            )}
                                        </Button>

                                    </form>

                                    <button
                                        type="button"
                                        onClick={goBackToLogin}
                                        className="mt-6 w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                        Back to Login
                                    </button>
                                </motion.div>
                            )}


                            {/* ── FORGOT PASSWORD: OTP VERIFY STEP ──── */}
                            {view === "forgot-otp" && (
                                <motion.div
                                    key="forgot-otp"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                <path d="m9 12 2 2 4-4" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1 text-gray-900">
                                            Verify Your Identity
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Enter the 4-digit code sent to
                                        </p>
                                        <p className="text-blue-700 text-sm font-medium mt-1">
                                            {resetEmail}
                                        </p>
                                    </div>

                                    {/* Success Alert */}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            <span>{success}</span>
                                        </motion.div>
                                    )}

                                    {/* Error Alert */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleVerifyResetOtp}>

                                        <div className="mb-6">
                                            <OtpInput
                                                value={otpValue}
                                                onChange={setOtpValue}
                                                disabled={loading}
                                            />
                                        </div>

                                        <Button disabled={loading || otpValue.length !== 4}>
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
                                                    </svg>
                                                    Verifying...
                                                </span>
                                            ) : (
                                                "Verify Code"
                                            )}
                                        </Button>

                                    </form>

                                    <div className="mt-6 flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={goBackToLogin}
                                            className="text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="15 18 9 12 15 6" />
                                            </svg>
                                            Back to Login
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={countdown > 0 || loading}
                                            className={`text-sm transition-colors ${
                                                countdown > 0
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-blue-700 hover:text-blue-900"
                                            }`}
                                        >
                                            {countdown > 0
                                                ? `Resend in ${countdown}s`
                                                : "Resend code"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}


                            {/* ── FORGOT PASSWORD: NEW PASSWORD STEP ── */}
                            {view === "forgot-newpass" && (
                                <motion.div
                                    key="forgot-newpass"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 border border-blue-200 rounded-2xl flex items-center justify-center">
                                            <svg className="w-8 h-8 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                <circle cx="12" cy="16" r="1" />
                                            </svg>
                                        </div>
                                        <h2 className="text-2xl font-bold mb-1 text-gray-900">
                                            Set New Password
                                        </h2>
                                        <p className="text-gray-500 text-sm">
                                            Create a new password for your account
                                        </p>
                                    </div>

                                    {/* Success Alert */}
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            <span>{success}</span>
                                        </motion.div>
                                    )}

                                    {/* Error Alert */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3"
                                        >
                                            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <line x1="15" y1="9" x2="9" y2="15" />
                                                <line x1="9" y1="9" x2="15" y2="15" />
                                            </svg>
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleResetPassword}>

                                        {/* New Password */}
                                        <div className="mb-5">
                                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                                                New Password
                                            </label>
                                            <div className="flex items-center bg-white border border-gray-300 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all duration-300">
                                                <input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => {
                                                        setNewPassword(e.target.value);
                                                        if (error) setError("");
                                                    }}
                                                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                                                    placeholder="Create new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="px-3 text-gray-500 hover:text-blue-700 text-sm transition-colors"
                                                >
                                                    {showNewPassword ? "Hide" : "Show"}
                                                </button>
                                            </div>

                                            {/* Password strength hints */}
                                            <div className="mt-2 space-y-1">
                                                <p className={`text-xs flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <span className={`inline-block w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    At least 8 characters
                                                </p>
                                                <p className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <span className={`inline-block w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    One uppercase letter
                                                </p>
                                                <p className={`text-xs flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <span className={`inline-block w-1 h-1 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    One lowercase letter
                                                </p>
                                                <p className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                    <span className={`inline-block w-1 h-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                                                    One number
                                                </p>
                                            </div>
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 uppercase tracking-wider mb-1.5">
                                                Confirm New Password
                                            </label>
                                            <div className="flex items-center bg-white border border-gray-300 rounded-lg focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/20 transition-all duration-300">
                                                <input
                                                    type={showConfirmNewPassword ? "text" : "password"}
                                                    value={confirmNewPassword}
                                                    onChange={(e) => {
                                                        setConfirmNewPassword(e.target.value);
                                                        if (error) setError("");
                                                    }}
                                                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                                                    placeholder="Confirm new password"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                                    className="px-3 text-gray-500 hover:text-blue-700 text-sm transition-colors"
                                                >
                                                    {showConfirmNewPassword ? "Hide" : "Show"}
                                                </button>
                                            </div>
                                        </div>

                                        <Button disabled={loading}>
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                                        <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
                                                    </svg>
                                                    Resetting Password...
                                                </span>
                                            ) : (
                                                "Reset Password"
                                            )}
                                        </Button>

                                    </form>

                                    <button
                                        type="button"
                                        onClick={goBackToLogin}
                                        className="mt-6 w-full text-center text-sm text-gray-600 hover:text-gray-800 transition-colors flex items-center justify-center gap-1"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="15 18 9 12 15 6" />
                                        </svg>
                                        Back to Login
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>

                    </Card>

                </motion.div>

            </div>

        </div>
    );
}

export default Login;