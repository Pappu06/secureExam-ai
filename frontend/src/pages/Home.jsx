import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/home/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturesSection from "../components/home/FeaturesSection";
import HowItWorks from "../components/home/HowItWorks";
import StatsSection from "../components/home/StatsSection";
import Footer from "../components/home/Footer";

function Home() {
  const { isAuthenticated, user, loading } = useAuth();

  // If authenticated, redirect to appropriate dashboard
  if (!loading && isAuthenticated && user) {
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="bg-white text-gray-900 min-h-screen">

      <Navbar />

      <HeroSection />

      <FeaturesSection />

      <HowItWorks />

      <StatsSection />

      <Footer />

    </div>
  );
}

export default Home;