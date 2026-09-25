import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ExpertDetails from './pages/ExpertDetails';
import ExpertDashboard from './pages/ExpertDashboard';
import SkillsAdmin from './pages/SkillsAdmin';
import Bookings from './pages/Bookings';
import ExpertBookings from './pages/ExpertBookings';
import BookingHistory from './pages/BookingHistory';
import Notifications from './pages/Notifications';
import BookingDetails from './pages/BookingDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/experts/:id" element={<ExpertDetails />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <Bookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:id"
                element={
                  <ProtectedRoute>
                    <BookingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['EXPERT']}>
                    <ExpertDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/expert/bookings"
                element={
                  <ProtectedRoute allowedRoles={['EXPERT']}>
                    <ExpertBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/skills"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <SkillsAdmin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <BookingHistory />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          
          <footer className="border-t border-slate-200 bg-white py-6">
            <div className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
              &copy; {new Date().getFullYear()} Mentora Platform. All rights reserved. Sprint 3 Build.
            </div>
          </footer>
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </Router>
  );
}

export default App;
