import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { ServiceRequestProvider } from './context/ServiceRequestContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceRequestFormPage } from './pages/ServiceRequestFormPage';
import { CustomServiceRequestPage } from './pages/CustomServiceRequestPage';
import { ReviewRequestPage } from './pages/ReviewRequestPage';
import { RequestSuccessPage } from './pages/RequestSuccessPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { InquiriesPage } from './pages/InquiriesPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Target Launch Time: 5th October 2026, 7:00 PM IST (19:00:00)
const LAUNCH_TIMESTAMP = new Date('2026-10-05T19:00:00+05:30').getTime();

function CountdownGate({ children }) {
  return children;
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ServiceRequestProvider>
          <BrowserRouter>
            <CountdownGate>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/sneak-peek" element={<Navigate to="/" replace />} />
                <Route path="/sneak-peek.html" element={<Navigate to="/" replace />} />
                <Route path="/preview" element={<Navigate to="/" replace />} />
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

              {/* Dedicated Academic Services Directory (Stitch Academic Services) */}
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <ServicesPage />
                  </ProtectedRoute>
                }
              />

              {/* Service Request Form (Stitch Service Request Form) */}
              <Route
                path="/services/new"
                element={
                  <ProtectedRoute>
                    <ServiceRequestFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services/request"
                element={
                  <ProtectedRoute>
                    <ServiceRequestFormPage />
                  </ProtectedRoute>
                }
              />

              {/* Custom Service Request Form (Stitch Custom Service Form) */}
              <Route
                path="/services/custom"
                element={
                  <ProtectedRoute>
                    <CustomServiceRequestPage />
                  </ProtectedRoute>
                }
              />

              {/* Request Review Screen (Stitch Review Request) */}
              <Route
                path="/services/review"
                element={
                  <ProtectedRoute>
                    <ReviewRequestPage />
                  </ProtectedRoute>
                }
              />

              {/* Request Submission Success Screen (Stitch Request Submission Success) */}
              <Route
                path="/services/success"
                element={
                  <ProtectedRoute>
                    <RequestSuccessPage />
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

              {/* Dedicated Inquiries Page (Stitch Inquiries Chat Center) */}
              <Route
                path="/inquiries"
                element={
                  <ProtectedRoute>
                    <InquiriesPage />
                  </ProtectedRoute>
                }
              />

              {/* Student Profile Page */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Public Legal & Policy Pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Catch-all 404 handler */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </CountdownGate>
        </BrowserRouter>
        </ServiceRequestProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
