// src/App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';


// Lazy loading dei componenti
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ClassDetail = lazy(() => import('./pages/ClassDetail'));
const Classes = lazy(() => import('./pages/Classes'));
const SchoolPage = lazy(() => import('./pages/SchoolPage'));
const Students = lazy(() => import('./pages/Students'));
const StudentDetails = lazy(() => import('./pages/studentDetail'));
const PlaceholderPage = lazy(() => import('./pages/placeholder'));
// Modifica l'import del ProfilePage
const ProfilePage = lazy(() => import('./pages/ProfilePages/Index')); // Import corretto del componente ProfilePage


// Loading component per Suspense
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
  </div>
);

// Componente per proteggere le rotte
const PrivateWrapper = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingFallback />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AppProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
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
              
              {/* Profilo Utente - Nuovo componente */}
              <Route path="profile" element={<ProfilePage />} />
              
              {/* Gestione scuola */}
              <Route path="schools" element={<SchoolPage />} />
              <Route path="classes" element={<Classes />} />
              <Route path="classes/:classId" element={<ClassDetail />} />
              <Route path="students" element={<Students />} />
              <Route path="students/:id" element={<StudentDetails />} />
              
              {/* Placeholder pages */}
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
        </Suspense>
      </Router>
    </AppProvider>
  );
};

export default App;