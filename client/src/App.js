// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import ClassDetail from './pages/ClassDetail';
import Classes from './pages/Classes';
import SchoolPage from './pages/SchoolPage';
import Students from './pages/Students';
import { AppProvider } from './context/AppContext';

const App = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <AppProvider>  {/* Aggiungiamo solo questo wrapper */}
      <Router>
        <Routes>
          <Route path="/login" element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />
          } />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="schools" element={<SchoolPage />} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="students" element={<Students />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;