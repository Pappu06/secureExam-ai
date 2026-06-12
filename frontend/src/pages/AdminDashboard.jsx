import { useEffect, useState, useCallback } from "react";

import { getAllExams } from "../services/examService";

import AdminSidebar, { MobileMenuButton } from "../components/admin/AdminSidebar";
import AdminBanner from "../components/admin/AdminBanner";
import AdminStatCard from "../components/admin/AdminStatCard";
import QuickActions from "../components/admin/QuickActions";
import ExamManagementTable from "../components/admin/ExamManagementTable";
import { getAdminStats } from "../services/adminService";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalQuestions: 0,
    totalStudents: 0,
    totalAttempts: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const fetchExams = useCallback(async () => {
    try {
      const data = await getAllExams();
      setExams(data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      await fetchExams();
      await fetchStats();
    };
    loadDashboardData();
  }, [fetchExams, fetchStats]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-72">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AdminBanner />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <AdminStatCard title="Total Exams" value={stats.totalExams} />
            <AdminStatCard title="Questions" value={stats.totalQuestions} />
            <AdminStatCard title="Students" value={stats.totalStudents} />
            <AdminStatCard title="Attempts" value={stats.totalAttempts} />
          </div>

          <QuickActions />

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Exam Management</h2>
            <span className="text-sm text-gray-500">{exams.length} exams total</span>
          </div>

          <ExamManagementTable exams={exams} refreshExams={fetchExams} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;