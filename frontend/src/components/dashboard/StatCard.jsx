function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="h-1 w-12 bg-blue-900 rounded mb-4" />
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
        {title}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-900">
        {value}
      </h2>
    </div>
  );
}

export default StatCard;