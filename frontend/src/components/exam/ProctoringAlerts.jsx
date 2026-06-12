import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ProctoringAlerts — BLOCKING modal overlay for AI proctoring warnings.
 *
 * When a violation is detected, it shows a full-screen overlay
 * that the student MUST acknowledge ("I Understand") before
 * they can continue the exam. This forces them to stop and
 * take corrective action.
 */
function ProctoringAlerts({ alerts = [], onDismiss }) {
  // Map violation types to display info
  const getViolationMeta = useCallback((type) => {
    switch (type) {
      case "GOGGLES_DETECTED":
        return {
          label: "Sunglasses / Goggles Detected",
          description: "Remove your sunglasses or goggles immediately. Your face must be clearly visible to the AI proctoring system at all times during the examination.",
          color: "amber",
          borderColor: "border-amber-400",
          bgGradient: "from-amber-500 to-orange-600",
          lightBg: "bg-amber-50",
          textColor: "text-amber-800",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          ),
        };
      case "MULTIPLE_FACES":
        return {
          label: "Multiple Faces Detected",
          description: "More than one face has been detected in your webcam feed. Ensure you are alone in the room. Any person near your screen is considered a violation and will be reported.",
          color: "red",
          borderColor: "border-red-400",
          bgGradient: "from-red-500 to-rose-600",
          lightBg: "bg-red-50",
          textColor: "text-red-800",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
          ),
        };
      case "LOW_LIGHT":
        return {
          label: "Low Light Detected",
          description: "Your environment is too dark for proper monitoring. Increase the lighting in your room immediately so that your face is clearly visible to the proctoring camera.",
          color: "violet",
          borderColor: "border-violet-400",
          bgGradient: "from-violet-500 to-purple-600",
          lightBg: "bg-violet-50",
          textColor: "text-violet-800",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
          ),
        };
      default:
        return {
          label: "Proctoring Violation",
          description: "A violation has been detected by the AI proctoring system. This incident has been recorded and will be reviewed by the examiner.",
          color: "gray",
          borderColor: "border-gray-400",
          bgGradient: "from-gray-500 to-gray-600",
          lightBg: "bg-gray-50",
          textColor: "text-gray-800",
          icon: (
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          ),
        };
    }
  }, []);

  if (alerts.length === 0) return null;

  // Show the FIRST alert as a blocking modal (one at a time)
  const currentAlert = alerts[0];
  const meta = getViolationMeta(currentAlert.type);

  return (
    <>
      {/* ── Red Pulsing Border Overlay ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[80] pointer-events-none"
        style={{
          boxShadow: "inset 0 0 0 6px rgba(239, 68, 68, 0.85)",
          animation: "proctor-pulse 1s infinite",
        }}
      />

      {/* ── Full-Screen Blocking Overlay ── */}
      <AnimatePresence>
        <motion.div
          key={currentAlert.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 ${meta.borderColor}`}
          >
            {/* Top Gradient Bar */}
            <div className={`h-2 bg-gradient-to-r ${meta.bgGradient}`} />

            {/* Header with Icon */}
            <div className="px-6 pt-6 pb-4 text-center">
              {/* Warning Shield Icon */}
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${meta.bgGradient} text-white flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                {meta.icon}
              </div>

              {/* Violation Warning Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 border border-red-200 mb-3">
                <svg className="w-3.5 h-3.5 text-red-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Proctoring Warning</span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 mb-2">{meta.label}</h2>

              {/* Description */}
              <p className="text-sm text-gray-600 leading-relaxed">{meta.description}</p>
            </div>

            {/* Warning Notice Box */}
            <div className="mx-6 mb-5">
              <div className={`${meta.lightBg} border ${meta.borderColor} rounded-xl p-3.5`}>
                <div className="flex items-start gap-2.5">
                  <svg className={`w-5 h-5 ${meta.textColor} flex-shrink-0 mt-0.5`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p className={`text-xs ${meta.textColor} font-medium leading-relaxed`}>
                    This violation has been recorded and will be visible to the examiner. Repeated violations may lead to automatic exam submission.
                  </p>
                </div>
              </div>
            </div>

            {/* Violation Count */}
            {alerts.length > 1 && (
              <div className="mx-6 mb-4 text-center">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  +{alerts.length - 1} more warning{alerts.length > 2 ? "s" : ""} pending
                </span>
              </div>
            )}

            {/* Action Button */}
            <div className="px-6 pb-6">
              <button
                onClick={() => onDismiss && onDismiss(currentAlert.id)}
                className={`w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r ${meta.bgGradient} hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl text-sm flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                I Understand — Continue Exam
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ── Keyframe Animation ── */}
      <style>{`
        @keyframes proctor-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}

export default ProctoringAlerts;
