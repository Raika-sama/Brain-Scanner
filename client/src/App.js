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
import { ProtectedRoute } from './components/ProtectedRoute';
import PlaceholderPage from './pages/placeholder'; // Aggiungi questo import

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Rotte pubbliche */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<PlaceholderPage pageName="Recupero Password" />} />
          <Route path="/reset-password/:token" element={<PlaceholderPage pageName="Reset Password" />} />

          {/* Rotte protette */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Gestione scuola */}
            <Route path="schools" element={<SchoolPage />} />
            <Route path="classes" element={<Classes />} />
            <Route path="classes/:classId" element={<ClassDetail />} />
            <Route path="students" element={<Students />} />

            {/* Nuove rotte con placeholder */}
            <Route path="profile" element={<PlaceholderPage pageName="Profilo Utente" />} />
            <Route path="settings" element={<PlaceholderPage pageName="Impostazioni" />} />
            <Route path="tests" element={<PlaceholderPage pageName="Test" />} />
            <Route path="tests/create" element={<PlaceholderPage pageName="Crea Test" />} />
            <Route path="tests/:testId" element={<PlaceholderPage pageName="Dettaglio Test" />} />
            <Route path="results" element={<PlaceholderPage pageName="Risultati" />} />

            {/* Redirect e 404 */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<PlaceholderPage pageName="Pagina non trovata - 404" />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
};

export default App;