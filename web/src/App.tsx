import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { I18nProvider, useI18n } from "./i18n/context";
import { AppShell } from "./components/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { ResultsPage } from "./pages/ResultsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { MePage } from "./pages/MePage";
import { MedicationsPage } from "./pages/MedicationsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { NotificationsPage } from "./pages/NotificationsPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  if (loading) return <div className="loading-screen">{t.loading}</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  );
}
