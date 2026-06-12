import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExamCodeModal from "./ExamCodeModal";

function ExamCard({ exam, attemptsTaken = 0, maxAllowed = 1 }) {
  const navigate = useNavigate();
  const [showCodeModal, setShowCodeModal] = useState(false);

  const isFullyCompleted = attemptsTaken >= maxAllowed;
  const hasAttempted = attemptsTaken > 0;
  const remainingAttempts = maxAllowed - attemptsTaken;
  const requiresExamCode = exam.accessType === "private" && Boolean(exam.examCode);

  const handleCodeVerified = () => {
    setShowCodeModal(false);
    navigate(`/exam/${exam._id}`, { state: { codeVerified: true } });
  };

  const handleStart = () => {
    if (requiresExamCode) {
      setShowCodeModal(true);
      return;
    }

    navigate(`/exam/${exam._id}`, { state: { codeVerified: true } });
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-800 transition-colors">
            {exam.title}
          </h2>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ml-3 ${
            isFullyCompleted
              ? "bg-emerald-100 text-emerald-700"
              : hasAttempted
              ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-800"
          }`}>
            {isFullyCompleted ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Done
              </>
            ) : hasAttempted ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                {attemptsTaken}/{maxAllowed}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {exam.duration} mins
              </>
            )}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
          {exam.description}
        </p>

        {/* Bottom Section */}
        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            Duration: {exam.duration} mins
          </span>
          {isFullyCompleted ? (
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              Completed
            </span>
          ) : hasAttempted ? (
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-amber-600 px-5 py-2 rounded-lg text-sm font-medium text-white hover:bg-amber-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Retake ({remainingAttempts} left)
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="bg-blue-900 px-5 py-2 rounded-lg text-sm font-medium text-white hover:bg-blue-800 transition-colors duration-200"
            >
              Start Exam
            </button>
          )}
        </div>
      </div>

      <ExamCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        examCode={exam.examCode}
        onVerified={handleCodeVerified}
      />
    </>
  );
}

export default ExamCard;
