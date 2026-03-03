import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import DashboardLayout from "../layout/DashboardLayout";

const ProtectedRouter = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children ? children : <Outlet />}</DashboardLayout>;
};

export default ProtectedRouter;
