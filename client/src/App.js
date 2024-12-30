// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';  // Aggiungi questo import
import LoginPage from './pages/LoginPage';
import ClassDetail from './pages/ClassDetail';
import Classes from './pages/Classes';
import SchoolPage from './pages/SchoolPage';  // Aggiungi questo import

const App = () => {  // Corretta la sintassi della dichiarazione
  // Funzione per verificare se l'utente è autenticato
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // Componente per proteggere le route
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Route pubblica per il login */}
        <Route path="/login" element={
          isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />
        } />

        {/* Route protette wrappate nel MainLayout */}
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schools" element={<SchoolPage />} /> {/* Aggiunta route per schools */}
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:classId" element={<ClassDetail />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;