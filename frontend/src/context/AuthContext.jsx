import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContextInstance";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import toast from "react-hot-toast";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [role, setRole] = useState(localStorage.getItem("userRole"));
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token && role) {
      setUser({ token, role });
    }
    setLoading(false);
  }, [token, role]);

  // Sign up
  const signup = async (userData) => {
    try {
      await axiosInstance.post(API_PATHS.SIGNUP, userData);
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Sign in
  const signin = async (credentials) => {
    try {
      const response = await axiosInstance.post(API_PATHS.SIGNIN, credentials);
      const { accessToken, role: userRole } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("userRole", userRole);

      setToken(accessToken);
      setRole(userRole);
      setUser({ token: accessToken, role: userRole });

      toast.success("Đăng nhập thành công!");
      return { success: true, role: userRole };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Sign out
  const signout = async () => {
    try {
      await axiosInstance.post(API_PATHS.SIGNOUT);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
      setToken(null);
      setRole(null);
      setUser(null);
      toast.success("Đã đăng xuất!");
    }
  };

  // Check role permissions
  const hasRole = (allowedRoles) => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  const isModerator = () => hasRole(["moderator", "admin", "superadmin"]);
  const isAdmin = () => hasRole(["admin", "superadmin"]);
  const isSuperAdmin = () => hasRole(["superadmin"]);

  const value = {
    user,
    token,
    role,
    loading,
    signup,
    signin,
    signout,
    isAuthenticated: !!token,
    hasRole,
    isModerator,
    isAdmin,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
