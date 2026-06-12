function AdminBanner() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="bg-blue-900 text-white rounded-xl p-6 sm:p-8 relative overflow-hidden mb-8 shadow-md">
      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/10 rounded-full translate-y-1/2" />
      </div>

      <div className="relative z-10">
        <p className="text-blue-200 text-sm font-medium mb-1">Welcome back,</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {user?.name}
        </h1>
        <p className="text-blue-200/80 mt-2 text-sm sm:text-base">
          Manage exams, questions, and student assessments from your dashboard.
        </p>
      </div>
    </div>
  );
}

export default AdminBanner;