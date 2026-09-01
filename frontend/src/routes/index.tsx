import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/features/auth/LoginPage';
import DashboardPage from '@/features/dashboard/DashboardPage';
import ModulesHubPage from '@/features/dashboard/ModulesHubPage';
import UsersPage from '@/features/users/UsersPage';
import ClientsPage from '@/features/clients/ClientsPage';
import AccountsPage from '@/features/accounts/AccountsPage';
import CashRegisterPage from '@/features/cash-register/CashRegisterPage';
import MovementsPage from '@/features/movements/MovementsPage';
import ReportsPage from '@/features/reports/ReportsPage';
import MainLayout from '@/components/layout/MainLayout';
import { useAuthStore } from '@/stores/auth.store';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Wrapper (only for non-authenticated users)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      {/* Hub Route */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ModulesHubPage />
          </ProtectedRoute>
        }
      />

      {/* Main App Routes (Sidebar Layout) */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="cash-register" element={<CashRegisterPage />} />
        <Route path="movements" element={<MovementsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
