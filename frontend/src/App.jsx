import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { isAdminUser } from './utils/adminAccess.js';

// Pages
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const AuthCallback = lazy(() => import('./pages/AuthCallback.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Expenses = lazy(() => import('./pages/Expenses.jsx'));
const Income = lazy(() => import('./pages/Income.jsx'));
const Loans = lazy(() => import('./pages/Loans.jsx'));
const Vehicles = lazy(() => import('./pages/Vehicles.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Notifications = lazy(() => import('./pages/Notifications.jsx'));
const Budgets = lazy(() => import('./pages/Budgets.jsx'));
const SavingsGoals = lazy(() => import('./pages/SavingsGoals.jsx'));
const Investments = lazy(() => import('./pages/Investments.jsx'));
const Bills = lazy(() => import('./pages/Bills.jsx'));
const Reports = lazy(() => import('./pages/Reports.jsx'));
const AIAssistant = lazy(() => import('./pages/AIAssistant.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));

// Layout
const MainLayout = lazy(() => import('./components/Layout/MainLayout.jsx'));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
  </div>
);

const getStoredUser = () => {
  const token = localStorage.getItem('token');
  const rawUser = localStorage.getItem('user');

  if (!token || !rawUser) return null;

  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decodedToken = JSON.parse(atob(normalizedPayload));
    if (!decodedToken?.id || typeof decodedToken.exp !== 'number' || decodedToken.exp * 1000 <= Date.now()) {
      return null;
    }

    const parsedUser = JSON.parse(rawUser);
    if (
      parsedUser &&
      typeof parsedUser === 'object' &&
      parsedUser.id === decodedToken.id &&
      parsedUser.email
    ) {
      return parsedUser;
    }
  } catch {
    return null;
  }

  return null;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const offline = import.meta.env.VITE_OFFLINE === 'true';
  const storedUser = getStoredUser();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!offline && !user && !storedUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const offline = import.meta.env.VITE_OFFLINE === 'true';
  const storedUser = getStoredUser();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!offline && (user || storedUser)) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const offline = import.meta.env.VITE_OFFLINE === 'true';

  if (loading) {
    return <LoadingScreen />;
  }

  if (!offline && !user) {
    return <Navigate to="/login" />;
  }

  if (!isAdminUser(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="income" element={<Income />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="savings-goals" element={<SavingsGoals />} />
              <Route path="loans" element={<Loans />} />
              <Route path="investments" element={<Investments />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="bills" element={<Bills />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
            </Route>
          </Routes>
        </Suspense>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
