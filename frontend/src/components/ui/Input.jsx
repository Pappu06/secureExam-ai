function Input({ label, className = "", ...props }) {
  return (
    <div className="mb-5">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-3 outline-none text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;