import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { MyRequestsPage } from './pages/MyRequestsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            {/* Student Dashboard Route (Home view) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Academic Services Page (Full-Width Category Bar) */}
            <Route
              path="/services"
              element={
                <ProtectedRoute>
                  <ServicesPage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated My Requests Page (Stitch Academic Tracker) */}
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute>
                  <MyRequestsPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback to Dashboard */}
            <Route path="/inquiries" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
