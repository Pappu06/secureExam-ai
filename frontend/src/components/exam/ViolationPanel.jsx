function ViolationPanel({ violations }) {
  const isCritical = violations >= 2;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-5 py-2.5 border transition-all duration-300 shadow-sm ${
        isCritical
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-5 h-5 flex-shrink-0 ${
          isCritical ? "text-red-500" : "text-amber-500"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>
      <span
        className={`text-sm font-medium ${
          isCritical ? "text-red-700" : "text-amber-700"
        }`}
      >
        Violations:{" "}
        <span className="font-bold">{violations}</span>
      </span>
    </div>
  );
}

export default ViolationPanel;