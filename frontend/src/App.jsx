import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import {Toaster} from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import SingUp from "./pages/Auth/SingUp";
import Login from "./pages/Auth/Login";
import ProtectedRouter from "./components/auth/ProtectedRouter";
import Dashboard from "./pages/Dashboard/Dashboard";
import AllInvoices from "./pages/Invoices/AllInvoices";
import ProfilePage from "./pages/Profile/ProfilePage";
import InvoiceDetail from "./pages/Invoices/InvoiceDetail";
import CreateInvoice from "./pages/Invoices/CreateInvoice";


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Public Rotes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SingUp />} />
          <Route path="/login" element={<Login />} />
          {/* protected Router */}
          <Route path="/" element = {<ProtectedRouter />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/invoices" element={<AllInvoices />} />
            <Route path="/invoices" element={<CreateInvoice />} />
            <Route path="/invoices/:id" element={<InvoiceDetail />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          {/* Catch all router */}
          <Route path="*" element={<Navigate />} />
        </Routes>
      </Router>
      <Toaster>
        toastOptions = {{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      </Toaster>
    </div>
  )
}

export default App