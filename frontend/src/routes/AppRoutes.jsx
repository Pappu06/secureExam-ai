import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import StudentDashboard from "../pages/StudentDashboard";
import ExamPage from "../pages/ExamPage";
import ExamsPage from "../pages/ExamsPage";
import ResultPage from "../pages/ResultPage";
import ExamResultPage from "../pages/ExamResultPage";
import ProfilePage from "../pages/ProfilePage";
import AdminDashboard from "../pages/AdminDashboard";
import CreateExam from "../pages/CreateExam";
import AddQuestion from "../pages/AddQuestion";
import ResultsPage from "../pages/admin/ResultsPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Student Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ExamsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam/:examId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ExamPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/results"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ResultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/result/:resultId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ExamResultPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-exam"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateExam />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-question"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddQuestion />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/results"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <ResultsPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;