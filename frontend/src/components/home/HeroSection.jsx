import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
      {/* Center Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight"
        >
          The Future of
          <br />
          <span className="text-amber-400">
            Secure Examinations
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed"
        >
          Experience next-generation online examinations powered by AI proctoring,
          real-time monitoring, and military-grade encryption. Trusted by
          institutions worldwide for secure, fair, and seamless assessments.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-bold text-blue-900 rounded-xl bg-amber-500 hover:bg-amber-400 transition-all duration-300 shadow-lg"
          >
            Start Free
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white rounded-xl border-2 border-white/30 hover:bg-white/10 transition-all duration-300"
          >
            Learn More
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
              />
            </svg>
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8"
        >
          {/* Badge: 256-bit Encryption */}
          <div className="flex items-center gap-2.5 text-blue-100 text-sm">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/20">
              <svg
                className="w-5 h-5 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <span>256-bit Encryption</span>
          </div>

          {/* Badge: AI Proctoring */}
          <div className="flex items-center gap-2.5 text-blue-100 text-sm">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/20">
              <svg
                className="w-5 h-5 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span>AI Proctoring</span>
          </div>

          {/* Badge: Instant Results */}
          <div className="flex items-center gap-2.5 text-blue-100 text-sm">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 border border-white/20">
              <svg
                className="w-5 h-5 text-amber-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <span>Instant Results</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;