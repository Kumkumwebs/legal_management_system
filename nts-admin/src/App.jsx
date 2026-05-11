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
import TasksPage from './pages/TasksPage';
import SupportPage from './pages/SupportPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import TermsPage from './pages/legal/TermsPage';
import FAQPage from './pages/legal/FAQPage';
import { FirmThemeProvider } from './context/ThemeContext';
import BrandingSettingsPage from './pages/BrandingSettingsPage';


function AppRoutes() {
  const { user } = useAuth();

  const role = user?.role;
  const isSuperAdmin = role === "super_admin";

  return (
    <Routes>

      {/* 🔓 PUBLIC */}
      {/* ✅ Only redirect to '/' if user is already logged in */}
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
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="brand_setting" element={<BrandingSettingsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="cases/:caseId/hearings" element={<HearingsPage />} />

        {/* Role-based */}
        <Route
          path="plans"
          element={isSuperAdmin ? <AdminPlansPage /> : <PlansPage />}
        />

        {/* ✅ Catch-all inside protected routes → redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* 🔓 PUBLIC LEGAL PAGES */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/faq" element={<FAQPage />} />

      {/* ✅ Global catch-all → login if not authenticated, home if authenticated */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />

    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <FirmThemeProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FirmThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}