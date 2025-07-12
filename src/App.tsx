import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import NotificationsPage from './components/NotificationsPage';
import UserProfilePage from './components/UserProfilePage';
import { apiService, User } from './services/api';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = apiService.getToken();
    if (token) {
      // Try to get current user profile to validate token
      apiService.getCurrentUserProfile()
        .then(user => {
          setCurrentUser(user);
        })
        .catch(() => {
          // Token is invalid, clear it
          apiService.clearToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      setCurrentUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const handleSignup = async (userData: {
    email: string;
    password: string;
    dateOfBirth: string;
    profilePhoto: File | null;
  }) => {
    try {
      const response = await apiService.register({
        email: userData.email,
        password: userData.password,
        dateOfBirth: userData.dateOfBirth,
        profilePhoto: userData.profilePhoto || undefined
      });
      setCurrentUser(response.user);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  };

  const handleLogout = () => {
    apiService.clearToken();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                isAuthenticated={!!currentUser}
                onLoginClick={() => window.location.href = '/login'}
              />
            } 
          />
          <Route 
            path="/login" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/signup" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <SignupPage onSignup={handleSignup} />
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <ForgotPasswordPage />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? 
                <DashboardPage currentUser={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              currentUser ? 
                <ProfilePage currentUser={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/notifications" 
            element={
              currentUser ? 
                <NotificationsPage currentUser={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/user/:userId" 
            element={
              currentUser ? 
                <UserProfilePage currentUser={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/test" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Route Working!</h1>
                  <p className="text-gray-600">Current user: {currentUser ? currentUser.email : 'Not logged in'}</p>
                </div>
              </div>
            } 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
