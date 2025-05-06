import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/adminLayout';
import UserLayout from './layouts/userLayout';
import LoginPage from './pages/auth/loginPage';

function App() {
  // Kiểm tra cả project1_token và project1_role để xác định isLoggedIn
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('project1_token') && !!localStorage.getItem('project1_role')
  );
  const [role, setRole] = useState(localStorage.getItem('project1_role')?.toLowerCase());

  const handleLogin = (newRole) => {
    // Cập nhật isLoggedIn chỉ khi có token và role
    const hasToken = !!localStorage.getItem('project1_token');
    const hasRole = !!newRole;
    setIsLoggedIn(hasToken && hasRole);
    setRole(newRole);
    console.log('After login - isLoggedIn:', hasToken && hasRole, 'role:', newRole);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole(null);
    console.log('After logout - isLoggedIn:', false, 'role:', null);
  };

  console.log('isLoggedIn:', isLoggedIn, 'role:', role);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        {isLoggedIn ? (
          role === 'manager' ? (
            <Route path="/*" element={<AdminLayout onLogout={handleLogout} />} />
          ) : (
            <Route path="/*" element={<UserLayout onLogout={handleLogout} />} />
          )
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;