import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../ui/Button";

function ExamCodeModal({ isOpen, onClose, examCode, onVerified }) {
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleVerify = () => {
    if (inputCode.trim().toUpperCase() === examCode?.toUpperCase()) {
      setError("");
      setInputCode("");
      onVerified();
    } else {
      setError("Invalid exam code. Please try again.");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const handleClose = () => {
    setInputCode("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={handleClose}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                x: shaking ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
              }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-2 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Enter Exam Code</h3>
                <p className="text-sm text-gray-500 mt-1.5">
                  Please enter the exam access code provided by your instructor.
                </p>
              </div>

              {/* Input */}
              <div className="px-6 py-4">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    if (error) setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  autoFocus
                  className={`w-full text-center text-2xl font-mono font-bold tracking-[0.4em] px-4 py-4 rounded-xl border-2 outline-none transition-all duration-200 ${
                    error
                      ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-300 bg-gray-50 text-gray-900 focus:ring-blue-200 focus:border-blue-500"
                  } focus:ring-4`}
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-600 mt-2 text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleVerify}
                  disabled={inputCode.trim().length === 0}
                >
                  Verify & Start
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ExamCodeModal;
