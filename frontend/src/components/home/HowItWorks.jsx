function HowItWorks() {
  const steps = [
    { number: 1, label: "Register Account" },
    { number: 2, label: "Login Securely" },
    { number: 3, label: "Start Exam" },
    { number: 4, label: "Submit Answers" },
    { number: 5, label: "View Results" },
  ];

  return (
    <section className="bg-white py-20 px-4">
      {/* Section Header */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-blue-900">
          How It Works
        </h2>
        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Get started in minutes with our simple, streamlined process.
        </p>
      </div>

      {/* Timeline */}
      <div className="max-w-5xl mx-auto">
        {/* Desktop Timeline */}
        <div className="hidden md:flex items-start justify-between relative">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center relative z-10" style={{ flex: 1 }}>
              {/* Step Circle */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900 text-white font-bold text-lg shadow-md">
                {step.number}
              </div>
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-6 left-[calc(50%+24px)] h-0.5 bg-blue-300"
                  style={{
                    width: "calc(100% - 48px)",
                  }}
                />
              )}
              {/* Label */}
              <p className="mt-4 text-sm font-medium text-gray-700 text-center">
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Timeline (Vertical) */}
        <div className="md:hidden flex flex-col items-center gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Step Circle */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900 text-white font-bold text-lg shadow-md">
                {step.number}
              </div>
              {/* Label */}
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">
                {step.label}
              </p>
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="w-0.5 h-8 bg-blue-300 my-2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;