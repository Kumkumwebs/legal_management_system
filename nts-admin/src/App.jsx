import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { FirmThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './auth/ProtectedRoute';

import MainLayout        from './layout/AppLayout';
import DashboardPage     from './pages/Dashboard';
import ClientsPage       from './pages/Clients';
import CasesPage         from './pages/Cases';
import DocumentsPage     from './pages/Documents';
import PaymentsPage      from './pages/Payments';
import TeamPage          from './pages/Team';
import LoginPage         from './pages/Login';
import FirmsPage         from './pages/firms';
import AcceptInvite      from './pages/AcceptInvite';
import PlansPage         from './pages/Plans';
import AdminPlansPage    from './pages/AdminPlansPage';
import HearingsPage      from './pages/HearingsPage';
import TasksPage         from './pages/TasksPage';
import SupportPage       from './pages/SupportPage';
import ProfilePage       from './pages/ProfilePage';
import SettingsPage      from './pages/SettingsPage';
import BrandingSettingsPage from './pages/BrandingSettingsPage';

// ✅ Legal pages
import { PrivacyPolicyPage } from './pages/legal/PrivacyPolicyPage';
import TermsPage             from './pages/legal/TermsPage';
import FAQPage               from './pages/legal/FAQPage';


function AppRoutes() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <Routes>

      {/* 🔓 PUBLIC */}
      <Route path="/login"         element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      {/* 🔓 LEGAL PAGES (no auth needed) */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms"   element={<TermsPage />} />
      <Route path="/faq"     element={<FAQPage />} />

      {/* 🔐 PROTECTED */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index                          element={<DashboardPage />} />
        <Route path="firms"                   element={<FirmsPage />} />
        <Route path="cases"                   element={<CasesPage />} />
        <Route path="clients"                 element={<ClientsPage />} />
        <Route path="documents"               element={<DocumentsPage />} />
        <Route path="payments"                element={<PaymentsPage />} />
        <Route path="settings"                element={<SettingsPage />} />
        <Route path="profile"                 element={<ProfilePage />} />
        <Route path="tasks"                   element={<TasksPage />} />
        <Route path="support"                 element={<SupportPage />} />
        <Route path="brand_setting"           element={<BrandingSettingsPage />} />
        <Route path="team"                    element={<TeamPage />} />
        <Route path="cases/:caseId/hearings"  element={<HearingsPage />} />
        <Route
          path="plans"
          element={isSuperAdmin ? <AdminPlansPage /> : <PlansPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      {/* Global catch-all */}
      <Route path="*" element={<Navigate to={user ? '/' : '/login'} replace />} />

    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/*
        ✅ Correct nesting order:
        1. BrowserRouter  — outermost, enables routing everywhere
        2. AuthProvider   — user state, dispatches auth:login / auth:logout events
        3. FirmThemeProvider — listens to those events, loads theme from DB
      */}
      <BrowserRouter>
        <AuthProvider>
          <FirmThemeProvider>
            <AppRoutes />
          </FirmThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}