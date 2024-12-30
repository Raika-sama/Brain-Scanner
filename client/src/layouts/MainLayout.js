import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, User, LogOut, Settings } from 'lucide-react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen h-screen flex flex-col">
      {/* Header - manteniamo la posizione fixed come era prima */}
      <header className="h-16 bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-xl font-semibold">Test Platform</span>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              {userData && (
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium">{userData.nome} {userData.cognome}</div>
                  <div className="text-xs text-gray-500">{userData.email}</div>
                </div>
              )}
            </button>

            {isUserMenuOpen && userData && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container - adattato per lavorare con il Sidebar esistente */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - usando il componente esistente */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content - adattato per funzionare con il Sidebar */}
        <main 
          className={`flex-1 overflow-auto transition-all duration-300 bg-gray-50
            ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}
        >
          <div className="h-full p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;