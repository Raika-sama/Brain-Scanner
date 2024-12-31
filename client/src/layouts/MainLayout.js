import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { ErrorBoundary } from 'react-error-boundary';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log('Current location:', location);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Manteniamo tutti gli interceptor e la logica di autenticazione invariati
  useEffect(() => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
  }, [navigate]);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await axios.get('/api/users/me');
        console.log('Risposta API /users/me:', response.data);
        
        const user = response.data.user || response.data;
        console.log('Dati utente estratti:', user);
        
        if (!user) {
          throw new Error('Nessun dato utente nella risposta');
        }
        
        setUserData(user);
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  useEffect(() => {
    console.log('userData aggiornato:', userData);
  }, [userData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  if (isLoading) {
    return <div>Caricamento...</div>;
  }

  return (
  <div className="min-h-screen h-screen flex flex-col bg-gray-50">
    {/* Header */}
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="h-full px-4 max-w-screen-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Brain Scanner
            </span>
            <span className="text-sm text-gray-500 hidden md:inline">| Test Platform</span>
          </div>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            {userData && (
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-700">
                  {userData.nome} {userData.cognome}
                </div>
                <div className="text-xs text-gray-500">{userData.email}</div>
              </div>
            )}
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && userData && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200 transform transition-all duration-200 ease-out">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-700">Account</p>
                <p className="text-xs text-gray-500 truncate">{userData.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Main Container */}
    <div className="flex flex-1 pt-16">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />
      
      {/* Main Content */}
      <main 
        className={`flex-1 transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-64' : 'ml-20'}
          overflow-hidden`}
      >
        <div className="h-full p-6 overflow-auto">
          <Suspense 
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            {console.log('Rendering route:', location.pathname)}
            <ErrorBoundary
              fallback={
                <div className="p-4 bg-red-50 text-red-600 rounded-lg">
                  Something went wrong. Please try again.
                </div>
              }
            >
              <Outlet />
            </ErrorBoundary>
          </Suspense>
        </div>
      </main>
    </div>
  </div>
);
};


export default MainLayout;