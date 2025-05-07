import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLayout from './layouts/adminLayout';
import UserLayout from './layouts/userLayout';
import LoginPage from './pages/auth/loginPage';

function AppContent({ isLoggedIn, setIsLoggedIn, role, setRole, handleLogin, handleLogout }) {
  const location = useLocation();

  // Kiểm tra token và điều hướng về /login nếu không có token
  useEffect(() => {
    const token = localStorage.getItem('project1_token');
    if (!token && location.pathname !== '/login') {
      setIsLoggedIn(false);
      setRole(null);
      console.log('No token found, redirecting to /login');
    }
  }, [location.pathname, setIsLoggedIn, setRole]);

  console.log('isLoggedIn:', isLoggedIn, 'role:', role, 'pathname:', location.pathname);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      {isLoggedIn ? (
        role === 'manager' ? (
          <Route path="/*" element={<AdminLayout onLogout={handleLogout} />} />
        ) : (
          <Route path="/*" element={<UserLayout onLogout={handleLogout} />} />
        )
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('project1_token'));
  const [role, setRole] = useState(localStorage.getItem('project1_role')?.toLowerCase());

  const handleLogin = (newRole) => {
    const hasToken = !!localStorage.getItem('project1_token');
    setIsLoggedIn(hasToken);
    setRole(newRole || localStorage.getItem('project1_role')?.toLowerCase());
    console.log('After login - isLoggedIn:', hasToken, 'role:', newRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    console.log('After logout - isLoggedIn:', false, 'role:', null);
  };

  return (
    <Router>
      <AppContent
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        role={role}
        setRole={setRole}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;