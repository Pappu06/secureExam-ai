import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-blue-900 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
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
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-white">
                SecureExam
              </span>
              <span className="text-[9px] font-semibold text-amber-400 tracking-widest uppercase hidden sm:block">
                Government Portal
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg transition-all duration-200"
            >
              Register
            </Link>
            <Link
              to="/register"
              className="ml-2 inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-blue-900 rounded-lg bg-amber-400 hover:bg-amber-300 transition-all duration-200 shadow-md"
            >
              Get Started
              <svg
                className="w-4 h-4"
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
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-blue-950 border-t border-white/10 animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
            >
              Home
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-blue-100 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg transition-colors"
            >
              Register
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              className="block text-center text-sm font-semibold text-blue-900 bg-amber-400 hover:bg-amber-300 px-4 py-3 rounded-lg transition-colors mt-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;