function Button({ 
  children, 
  variant = "primary", 
  size = "md",
  fullWidth = false,
  icon = null,
  iconPosition = "left",
  className = "", 
  ...props 
}) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const sizes = {
    sm: "py-2 px-4 text-xs",
    md: "py-2.5 px-5 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const variants = {
    primary: "bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-900 shadow-sm hover:shadow-md",
    secondary: "bg-white text-blue-900 border border-blue-900 hover:bg-blue-50 focus:ring-blue-900",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-sm",
    "danger-ghost": "bg-transparent text-red-600 hover:bg-red-50 focus:ring-red-600",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600 shadow-sm",
    ghost: "bg-transparent text-blue-900 hover:bg-blue-50 focus:ring-blue-900",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant] || variants.primary} ${widthClass} ${className}`}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="ml-2 flex-shrink-0">{icon}</span>}
    </button>
  );
}

export default Button;