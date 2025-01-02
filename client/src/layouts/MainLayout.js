// client/src/layouts/MainLayout.js
import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion'; // Nuovo import
import { Menu, User, LogOut, Settings, Bell } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { ErrorBoundary } from 'react-error-boundary';
import { useAuth } from '../hooks/useAuth';

// Componente Loading elegante
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <motion.div
      className="w-16 h-16 border-4 border-blue-200 rounded-full"
      style={{ borderTopColor: '#60A5FA' }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: userData, logout, isLoading } = useAuth(); // Usiamo useAuth invece dello state locale
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


  

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50"
    >
      {/* Header con Glassmorphism */}
      <header className="h-16 fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="h-full px-4 max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Menu className="h-5 w-5 text-gray-700" />
            </motion.button>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Brain Scanner
              </span>
              <span className="text-sm text-gray-500 hidden md:inline">| Test Platform</span>
            </motion.div>
          </div>

          {/* User Menu con Animazioni */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                {/* Notification dot */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              
              {userData && (
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-700">
                    {userData.nome} {userData.cognome}
                  </div>
                  <div className="text-xs text-gray-500">{userData.email}</div>
                </div>
              )}
            </motion.button>

            {/* User Dropdown con Animazioni */}
            <AnimatePresence>
              {isUserMenuOpen && userData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md rounded-lg shadow-lg py-1 border border-gray-200/50"
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Account</p>
                    <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                  </div>
                  
                  <motion.button
                    whileHover={{ backgroundColor: '#FEE2E2' }}
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Container con Transizioni */}
      <div className="flex flex-1 pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main className={`flex-1 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <div className="h-full p-6 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Suspense fallback={<LoadingSpinner />}>
                  <ErrorBoundary
                    fallback={
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-red-50 text-red-600 rounded-lg"
                      >
                        Something went wrong. Please try again.
                      </motion.div>
                    }
                  >
                    <Outlet />
                  </ErrorBoundary>
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default MainLayout;