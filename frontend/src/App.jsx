import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout       from "./components/layout/Layout";
import LoginPage       from "./pages/auth/LoginPage";
import RegisterPage    from "./pages/auth/RegisterPage";
import DashboardPage   from "./pages/dashboard/DashboardPage";
import CasesPage       from "./pages/cases/CasesPage";
import CaseDetailPage  from "./pages/cases/CaseDetailPage";
import EvidencePage    from "./pages/evidence/EvidencePage";
import ReportsPage     from "./pages/reports/ReportsPage";
import UsersPage       from "./pages/users/UsersPage";
import { Spinner } from "./components/ui";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Spinner size="lg"/></div>;
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-surface"><Spinner size="lg"/></div>;
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: "#1c2333", color: "#e6edf3", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "14px" },
            success: { iconTheme: { primary: "#10b981", secondary: "#1c2333" } },
            error:   { iconTheme: { primary: "#ef4444", secondary: "#1c2333" } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected */}
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/cases"        element={<CasesPage />} />
            <Route path="/cases/:id"    element={<CaseDetailPage />} />
            <Route path="/evidence"     element={<EvidencePage />} />
            <Route path="/reports"      element={<ReportsPage />} />
            <Route path="/users"        element={<UsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}