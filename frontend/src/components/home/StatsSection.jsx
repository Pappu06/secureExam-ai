function StatsSection() {
  const stats = [
    { value: "100+", label: "Students" },
    { value: "50+", label: "Exams" },
    { value: "95%", label: "Accuracy" },
    { value: "24/7", label: "Availability" },
  ];

  return (
    <section className="bg-blue-900 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-5xl font-bold text-amber-400">
                  {stat.value}
                </p>
                <p className="mt-2 text-blue-200 text-sm font-medium tracking-wide uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatsSection;