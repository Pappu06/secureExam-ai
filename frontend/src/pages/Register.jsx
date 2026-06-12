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


// ── Main Register Component ──────────────────────────────
function Register() {

  const navigate = useNavigate();
  const { register, sendOtp, isAuthenticated, user } = useAuth();

  // Loading, success & error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // OTP states
  const [otpStep, setOtpStep] = useState("initial"); // "initial" | "sent"
  const [otpValue, setOtpValue] = useState("");
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
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


  // Client-side form validation
  const validateForm = () => {

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError("Password must contain at least one uppercase letter");
      return false;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError("Password must contain at least one lowercase letter");
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };


  // ── Step 1: Send OTP ─────────────────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      setLoading(true);
      await sendOtp(formData.email);
      setOtpStep("sent");
      setOtpValue("");
      setCountdown(60);
      setSuccess("Verification code sent to your email!");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to send verification code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ── Step 2: Register with OTP ────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otpValue.length !== 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: otpValue,
      };

      const loggedInUser = await register(registrationData);

      setSuccess("Account created successfully! Redirecting...");

      // Redirect immediately to appropriate dashboard
      setTimeout(() => {
        if (loggedInUser?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 1500);

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Registration failed. Please verify the code and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  // ── Resend OTP ───────────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      await sendOtp(formData.email);
      setOtpValue("");
      setCountdown(60);
      setSuccess("A new verification code has been sent!");
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Failed to resend code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-6 relative overflow-hidden">

      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* LEFT PANEL */}
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Join Today
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-bold tracking-tight leading-tight text-gray-900">
            Create your
            <br />
            <span className="text-blue-900">
              SecureExam Account
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg mt-4">
            Sign up to experience a secure, modern online examination platform with AI-powered proctoring and instant results.
          </p>

          {/* Feature List */}
          <div className="mt-10 space-y-4">

            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Email Registration
            </div>

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
              Smart Examination System
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <svg className="w-5 h-5 text-emerald-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Instant Results
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

            <h2 className="text-2xl font-bold mb-1 text-gray-900">
              Create Account
            </h2>

            <p className="text-gray-500 text-sm mb-8">
              Fill in your details and verify your email
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

            <form onSubmit={otpStep === "initial" ? handleRequestOtp : handleRegister}>

              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={otpStep === "sent" || loading}
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={otpStep === "sent" || loading}
              />

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="flex items-center bg-white border border-gray-300 rounded-xl focus-within:border-blue-600 transition-all duration-300">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="Create a password"
                    disabled={otpStep === "sent" || loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-gray-500 hover:text-blue-700 text-sm transition-colors"
                    disabled={otpStep === "sent" || loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Password strength hints — only visible when editing */}
                {otpStep === "initial" && (
                  <div className="mt-2 space-y-1">
                    <p className={`text-xs flex items-center gap-1.5 ${formData.password.length >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`inline-block w-1 h-1 rounded-full ${formData.password.length >= 8 ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                      At least 8 characters
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${/[A-Z]/.test(formData.password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`inline-block w-1 h-1 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                      One uppercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${/[a-z]/.test(formData.password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`inline-block w-1 h-1 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                      One lowercase letter
                    </p>
                    <p className={`text-xs flex items-center gap-1.5 ${/[0-9]/.test(formData.password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span className={`inline-block w-1 h-1 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-emerald-600' : 'bg-gray-400'}`} />
                      One number
                    </p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="flex items-center bg-white border border-gray-300 rounded-xl focus-within:border-blue-600 transition-all duration-300">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="Confirm password"
                    disabled={otpStep === "sent" || loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="px-3 text-gray-500 hover:text-blue-700 text-sm transition-colors"
                    disabled={otpStep === "sent" || loading}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* ── OTP Verification Section ── */}
              <AnimatePresence>
                {otpStep === "sent" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 border-t border-gray-200 pt-6"
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-500">
                        Please enter the 4-digit verification code sent to
                      </p>
                      <p className="text-blue-700 text-sm font-medium mt-0.5">
                        {formData.email}
                      </p>
                    </div>

                    <div className="mb-4">
                      <OtpInput
                        value={otpValue}
                        onChange={setOtpValue}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-center justify-between px-2">
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep("initial");
                          setError("");
                          setSuccess("");
                        }}
                        className="text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
                        disabled={loading}
                      >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Edit details
                      </button>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={countdown > 0 || loading}
                        className={`text-xs transition-colors ${
                          countdown > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-700 hover:text-blue-900"
                        }`}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dynamic Action Button */}
              {otpStep === "initial" ? (
                <Button disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              ) : (
                <Button disabled={loading || otpValue.length !== 4}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4m-3.93 7.07l-2.83-2.83M6.34 6.34L3.51 3.51" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    "Verify & Register"
                  )}
                </Button>
              )}

            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?
              <Link
                to="/login"
                className="text-blue-700 hover:text-blue-900 ml-2 transition-colors"
              >
                Login
              </Link>
            </p>

          </Card>

        </motion.div>

      </div>

    </div>
  );
}

export default Register;