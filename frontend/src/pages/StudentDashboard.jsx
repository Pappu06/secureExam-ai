import { useEffect, useState } from "react";

import { getAllExams } from "../services/examService";
import { getMyResults } from "../services/resultService";

import Sidebar, { MobileMenuButton } from "../components/dashboard/Sidebar";
import WelcomeBanner from "../components/dashboard/WelcomeBanner";
import StatCard from "../components/dashboard/StatCard";
import ExamCard from "../components/dashboard/ExamCard";

function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsData, resultsData] = await Promise.all([
          getAllExams(),
          getMyResults(),
        ]);
        setExams(examsData);
        setResults(resultsData);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  // Calculate dynamic stats
  const completedExams = results.length;
  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length
        )
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Overview of your exam activities</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
              </button>
              {/* User Avatar */}
              <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer hover:bg-blue-800 transition-colors">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <WelcomeBanner user={user} />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <StatCard
              title="Available Exams"
              value={exams.length}
            />
            <StatCard
              title="Completed"
              value={completedExams}
            />
            <StatCard
              title="Average Score"
              value={`${averageScore}%`}
            />
            <StatCard
              title="Active"
              value="Yes"
            />
          </div>

          {/* Available Exams Section */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Available Exams</h2>
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              {exams.length} exams
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {exams.map((exam) => {
              const attemptsTaken = results.filter(
                (r) => (r.exam?._id || r.exam) === exam._id
              ).length;
              const maxAllowed = exam.allowReattempt ? exam.maxAttempts : 1;
              return (
                <ExamCard
                  key={exam._id}
                  exam={exam}
                  attemptsTaken={attemptsTaken}
                  maxAllowed={maxAllowed}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;