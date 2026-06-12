function Logo({ size = "default" }) {
  const sizes = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  };

  return (
    <div className="flex items-center gap-2.5">
      {/* Emblem-style icon */}
      <div className="relative">
        <div className={`${size === "small" ? "w-8 h-8" : "w-10 h-10"} bg-blue-900 rounded-lg flex items-center justify-center shadow-md`}>
          <svg className={`${size === "small" ? "w-4 h-4" : "w-5 h-5"} text-white`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col leading-tight">
        <span className={`${sizes[size]} font-bold tracking-tight text-blue-900`}>
          SecureExam
        </span>
        <span className="text-[10px] font-semibold text-amber-600 tracking-widest uppercase">
          Government Portal
        </span>
      </div>
    </div>
  );
}

export default Logo;
