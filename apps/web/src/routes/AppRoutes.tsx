import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleName } from '@thevisagate/shared';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ClientLayout } from '../layouts/ClientLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { AboutPage } from '../pages/public/AboutPage';
import { ServicesPage } from '../pages/public/ServicesPage';
import { CountriesPage } from '../pages/public/CountriesPage';
import { HowItWorksPage } from '../pages/public/HowItWorksPage';
import { FaqPage } from '../pages/public/FaqPage';
import { ContactPage } from '../pages/public/ContactPage';
import { LoginPage } from '../pages/public/LoginPage';
import { AdminLoginPage } from '../pages/public/AdminLoginPage';
import { PrivacyPage } from '../pages/public/PrivacyPage';
import { TermsPage } from '../pages/public/TermsPage';

// Client Portal
import { ClientPortalPage } from '../pages/client/ClientPortalPage';

// Admin / Staff Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ClientsPage } from '../pages/admin/ClientsPage';
import { ApplicationsPage } from '../pages/admin/ApplicationsPage';
import { DocumentsPage } from '../pages/admin/DocumentsPage';
import { PaymentsPage } from '../pages/admin/PaymentsPage';
import { StaffPage } from '../pages/admin/StaffPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { CountriesAdminPage } from '../pages/admin/CountriesAdminPage';
import { WorkflowsAdminPage } from '../pages/admin/WorkflowsAdminPage';
import { AppointmentsPage } from '../pages/admin/AppointmentsPage';

// Route Guards
const ProtectedRoute: React.FC<{
  allowedRoles: RoleName[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xs font-semibold text-slate-500">Loading session...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === RoleName.CLIENT) {
      return <Navigate to="/client/portal" replace />;
    } else {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Corporate Website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServicesPage />} />
        <Route path="/countries" element={<CountriesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Route>

      {/* Dedicated Restricted Admin Authentication Route */}
      <Route path="/admin-access" element={<AdminLoginPage />} />
      <Route path="/portal/admin" element={<AdminLoginPage />} />

      {/* 2. Client Application Tracking Portal */}
      <Route
        path="/client"
        element={
          <ProtectedRoute allowedRoles={[RoleName.CLIENT]}>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/client/portal" replace />} />
        <Route path="portal" element={<ClientPortalPage />} />
      </Route>

      {/* 3. Admin & Staff Operations Console */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN, RoleName.STAFF]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        
        {/* Admin Restricted */}
        <Route
          path="countries"
          element={
            <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
              <CountriesAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="workflows"
          element={
            <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
              <WorkflowsAdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
              <StaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit-logs"
          element={
            <ProtectedRoute allowedRoles={[RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
