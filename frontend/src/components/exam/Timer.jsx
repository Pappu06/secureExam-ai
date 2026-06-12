function Timer({ timeLeft }) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft < 60;

  return (
    <div
      className={`inline-flex items-center gap-3 bg-white border rounded-xl px-5 py-2.5 transition-all duration-300 shadow-sm ${
        isUrgent
          ? "border-red-300 bg-red-50"
          : "border-gray-200"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 ${isUrgent ? "text-red-500 animate-pulse" : "text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <span
        className={`font-mono text-lg font-semibold ${
          isUrgent ? "text-red-600" : "text-gray-900"
        }`}
      >
        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </span>
    </div>
  );
}

export default Timer;