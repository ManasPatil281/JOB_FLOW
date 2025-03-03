import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './components/login';
import UserDashboard from './components/userDashboard';

// ProtectedRoute component to guard authenticated routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('jobflow_token') !== null;

  if (!isAuthenticated) {
    // Redirect to login and preserve the current location for post-login redirection
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('jobflow_token') !== null
  );

  // Handle login success
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jobflow_token');
    localStorage.removeItem('jobflow_user');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login onLoginSuccess={handleLogin} />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Redirect based on authentication status */}
          <Route
            path="*"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/landing" replace />
              )
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

// Simple landing page that doesn't require authentication
const LandingPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-8">
        Welcome to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          JobFlow AI
        </span>
      </h1>
      <p className="text-xl text-gray-300 mb-8">
        Please log in to access our AI-powered recruitment platform.
      </p>
      <a
        href="/login"
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors inline-block"
      >
        Login to Continue
      </a>
    </div>
  );
};

export default App;