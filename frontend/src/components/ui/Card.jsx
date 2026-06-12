function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl shadow-gov ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;