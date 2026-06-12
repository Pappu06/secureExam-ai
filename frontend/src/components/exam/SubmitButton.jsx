function SubmitButton({ handleSubmit, submitted }) {
  return (
    <button
      onClick={handleSubmit}
      disabled={submitted}
      className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
        submitted
          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
          : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
      }`}
    >
      {submitted ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          Submitted
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
          Submit Exam
        </>
      )}
    </button>
  );
}

export default SubmitButton;