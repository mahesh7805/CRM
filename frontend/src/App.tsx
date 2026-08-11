import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { Inventory } from './pages/Inventory';
import { Challans } from './pages/Challans';
import { ChallanCreate } from './pages/ChallanCreate';
import { ChallanDetail } from './pages/ChallanDetail';
import { Followups } from './pages/Followups';
import { UsersPage } from './pages/Users';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { RoleName } from './types';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: RoleName[] }> = ({ children, roles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-slate-400">
        Verifying Session Credentials...
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Portal Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="challans" element={<Challans />} />
            <Route path="challans/new" element={<ChallanCreate />} />
            <Route path="challans/:id" element={<ChallanDetail />} />
            <Route path="followups" element={<Followups />} />
            <Route
              path="users"
              element={
                <ProtectedRoute roles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ToastProvider>
  );
};

export default App;
