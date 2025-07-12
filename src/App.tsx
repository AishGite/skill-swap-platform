import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import DashboardPage from './components/DashboardPage';
import ProfilePage from './components/ProfilePage';
import './App.css';

interface User {
  email: string;
  name?: string;
  profilePhoto?: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would validate against the database
    setCurrentUser({
      email,
      name: email.split('@')[0], // Use email prefix as name for demo
      profilePhoto: undefined
    });
  };

  const handleSignup = (userData: any) => {
    // In a real app, this would save to the database
    setCurrentUser({
      email: userData.email,
      name: userData.email.split('@')[0], // Use email prefix as name for demo
      profilePhoto: userData.profilePhoto ? URL.createObjectURL(userData.profilePhoto) : undefined
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

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
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
