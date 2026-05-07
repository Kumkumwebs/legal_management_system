import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import ProtectedRoute from './auth/ProtectedRoute';

import MainLayout from './layout/AppLayout';
import DashboardPage from './pages/Dashboard';
import ClientsPage from './pages/Clients';
import CasesPage from './pages/Cases';
import DocumentsPage from './pages/Documents';
import PaymentsPage from './pages/Payments';
import TeamPage from './pages/Team';
import LoginPage from './pages/Login';
import FirmsPage from './pages/firms';
import AcceptInvite from './pages/AcceptInvite';
import PlansPage from "./pages/Plans";
import AdminPlansPage from "./pages/AdminPlansPage";
import HearingsPage from "./pages/HearingsPage";

function AppRoutes() {
  const { user } = useAuth();

  const role = user?.role;
  const isSuperAdmin = role === "super_admin";

  return (
    <Routes>

      {/* 🔓 PUBLIC */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* 🔐 PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="firms" element={<FirmsPage />} />
        <Route path="cases" element={<CasesPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="cases/:caseId/hearings" element={<HearingsPage />} />

        {/* Role-based */}
        <Route
          path="plans"
          element={isSuperAdmin ? <AdminPlansPage /> : <PlansPage />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}