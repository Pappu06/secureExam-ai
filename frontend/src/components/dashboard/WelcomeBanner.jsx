function WelcomeBanner({ user }) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-blue-900 text-white rounded-xl p-6 sm:p-8 mb-8 shadow-md relative overflow-hidden">
      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-blue-200 text-sm font-medium tracking-wide uppercase mb-1">
            Welcome back,
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {user?.name}
          </h1>
          <p className="mt-3 text-blue-200">
            Ready to attempt your next exam? Your journey to success continues here.
          </p>
        </div>

        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center gap-2 text-blue-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
            <span className="text-sm font-medium">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;