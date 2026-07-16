import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { FirmThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './auth/ProtectedRoute';

import MainLayout           from './layout/AppLayout';
import DashboardPage        from './pages/Dashboard';
import ClientsPage          from './pages/Clients';
import CasesPage            from './pages/Cases';
import DocumentsPage        from './pages/Documents';
import PaymentsPage         from './pages/Payments';
import TeamPage             from './pages/Team';
import LoginPage            from './pages/Login';
import FirmsPage            from './pages/firms';
import AcceptInvite         from './pages/AcceptInvite';
import PlansPage            from './pages/Plans';
import AdminPlansPage       from './pages/AdminPlansPage';
import HearingsPage         from './pages/HearingsPage';
import TasksPage            from './pages/TasksPage';
import SupportPage          from './pages/SupportPage';
import ProfilePage          from './pages/ProfilePage';
import SettingsPage         from './pages/SettingsPage';
import BrandingSettingsPage from './pages/BrandingSettingsPage';
import ForgotPasswordPage   from './pages/ForgotPasswordPage';
import ResetPasswordPage    from './pages/ResetPasswordPage';

// ── NTS online services opc pvt LTD Public Website ──────────────────────────────────────────────
import HPHighCourtWebsite from './pages/website/hphighcourt';
import TKVermaWebsite from "./pages/website/Tkvermalawfirm";


// ── Full-viewport wrapper — escapes AppLayout sidebar DOM entirely ─────────────
function WebsiteWrapper() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw', height: '100vh',
      zIndex: 99999,
      overflowY: 'auto', overflowX: 'hidden',
      background: '#fff',
      margin: 0, padding: 0,
    }}>
      <HPHighCourtWebsite />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <Routes>

      {/* ================================================================
          🌐  PUBLIC — NTS online services opc pvt LTD Marketing Website
          Rendered in a fixed full-viewport wrapper so no dashboard
          sidebar/layout CSS can bleed in from AppLayout.
      ================================================================ */}
      <Route path="/"               element={<WebsiteWrapper />} />
      <Route path="/about"          element={<WebsiteWrapper />} />
      <Route path="/contact"        element={<WebsiteWrapper />} />
      <Route path="/faq"            element={<WebsiteWrapper />} />
      <Route path="/privacy-policy" element={<WebsiteWrapper />} />
      <Route path="/terms"          element={<WebsiteWrapper />} />
      <Route path="/tk-verma"        element={<TKVermaWebsite />} />


      {/* ================================================================
          🔓  PUBLIC — Auth & Utility Pages
          ✅ FIXED: logged-in users redirect to /dashboard (NOT /)
          Previously was <Navigate to="/" /> which flashed the website
      ================================================================ */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password"  element={<ResetPasswordPage />} />
      <Route path="/accept-invite"   element={<AcceptInvite />} />

      {/* ================================================================
          🔐  PROTECTED — Dashboard
          All routes live under /dashboard/* so they never conflict
          with the public website routes above.
      ================================================================ */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index                         element={<DashboardPage />} />
        <Route path="firms"                  element={<FirmsPage />} />
        <Route path="cases"                  element={<CasesPage />} />
        <Route path="cases/:caseId/hearings" element={<HearingsPage />} />
        <Route path="clients"                element={<ClientsPage />} />
        <Route path="documents"              element={<DocumentsPage />} />
        <Route path="payments"               element={<PaymentsPage />} />
        <Route path="team"                   element={<TeamPage />} />
        <Route path="tasks"                  element={<TasksPage />} />
        <Route path="support"                element={<SupportPage />} />
        <Route path="profile"                element={<ProfilePage />} />
        <Route path="settings"               element={<SettingsPage />} />
        <Route path="brand_setting"          element={<BrandingSettingsPage />} />
        <Route path="plans"                  element={isSuperAdmin ? <AdminPlansPage /> : <PlansPage />} />
        <Route path="*"                      element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* ================================================================
          🔀  Global catch-all
          ✅ FIXED: logged-in → /dashboard (NOT / which is the website)
      ================================================================ */}
      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />

    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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