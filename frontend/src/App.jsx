import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProfilePage from "./pages/Profile/ProfilePage";
import ModeratorPanel from "./pages/Moderator/ModeratorPanel";
import AdminPanel from "./pages/Admin/AdminPanel";
import DepartmentPage from "./pages/Department/DepartmentPage";
import ComputerManagement from "./pages/IT/ComputerManagement";
import PositionManagement from "./pages/PositionManagement/PositionManagement";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Các route công khai */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Các route được bảo vệ - Tất cả người dùng được xác thực */}
          <Route element={<ProtectedRouter />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="departments" element={<DepartmentPage />} />
            <Route path="it/computers" element={<ComputerManagement />} />

            {/* Các route Moderator - Moderator, Admin */}
            <Route
              path="moderator"
              element={
                <RoleProtectedRoute allowedRoles={["moderator", "admin"]}>
                  <ModeratorPanel />
                </RoleProtectedRoute>
              }
            />

            {/* Các route Admin - Admin */}
            <Route
              path="admin"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <AdminPanel />
                </RoleProtectedRoute>
              }
            />
            <Route
              path="admin/positions"
              element={
                <RoleProtectedRoute allowedRoles={["admin"]}>
                  <PositionManagement />
                </RoleProtectedRoute>
              }
            />
          </Route>

          {/* Bắt tất cả các route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
};

export default App;
