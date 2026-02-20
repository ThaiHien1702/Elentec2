import { Navigate, Outlet } from "react-router-dom";
import DashboardLayout from "../layout/DashboardLayout";


const ProtectedRouter = ({children}) => {
  const isAuthenticated = true
  const loading = false
  if (loading) {
    //you can render  Loading spinner here
    return <div>Loading...</div>
  }
  if (!isAuthenticated) {
    return <Navigate to = "/login" replace />
  }
  return (
    <DashboardLayout>{children ? children : <Outlet/>}</DashboardLayout>
  )
}

export default ProtectedRouter