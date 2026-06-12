import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);


  // Initialize auth state from localStorage on mount
  useEffect(() => {

    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedToken && storedUser) {
        try {
          // Verify token is still valid by hitting the /me endpoint
          const response = await API.get("/auth/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          setToken(storedToken);
          setUser(response.data.user);

          // Update stored user in case profile changed elsewhere
          localStorage.setItem("user", JSON.stringify(response.data.user));

        } catch {
          // Token is invalid or expired — clean up
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);


  // Login
  const login = useCallback(async (email, password) => {

    const response = await API.post("/auth/login", { email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);


  // Send OTP
  const sendOtp = useCallback(async (email) => {

    const response = await API.post("/auth/send-otp", { email });
    return response.data;
  }, []);


  // Forgot Password — send OTP to existing user for password reset
  const forgotPassword = useCallback(async (email) => {

    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  }, []);


  // Reset Password — verify OTP and set new password
  const resetPassword = useCallback(async (email, otp, newPassword) => {

    const response = await API.post("/auth/reset-password", { email, otp, newPassword });
    return response.data;
  }, []);


  // Register
  const register = useCallback(async (userData) => {

    const response = await API.post("/auth/register", userData);
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    return newUser;
  }, []);


  // Logout
  const logout = useCallback(async () => {

    try {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        // Server-side logout — increment tokenVersion
        await API.post("/auth/logout", {}, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
      }
    } catch {
      // Even if server-side logout fails, clear local state
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  }, [navigate]);


  // Force logout — called by Axios interceptor when 401 is received
  const forceLogout = useCallback(() => {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  }, [navigate]);


  // Update user state after profile edit
  const updateUserState = useCallback((updatedUser) => {

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }, []);


  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    sendOtp,
    forgotPassword,
    resetPassword,
    register,
    logout,
    forceLogout,
    updateUserState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
