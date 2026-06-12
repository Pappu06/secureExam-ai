function AdminStatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-gov relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-900" />
      <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">
        {title}
      </p>
      <h2 className="text-3xl font-bold mt-2 text-gray-900">
        {value}
      </h2>
    </div>
  );
}

export default AdminStatCard;