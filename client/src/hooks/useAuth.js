// src/hooks/useAuth.js
import { useState, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';

export const useAuth = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verifica automatica dello stato di autenticazione all'avvio
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          const { data } = await axios.get('/api/users/me');
          if (data.success && data.user) {
            dispatch({ type: 'SET_USER', payload: data.user });
          }
        } catch (err) {
          console.error('Verifica auth fallita:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('rememberMe');
          dispatch({ type: 'SET_USER', payload: null });
        } finally {
          setIsLoading(false);
        }
      }
    };

    verifyAuth();
  }, [dispatch]);

  const login = useCallback(async (email, password, rememberMe) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/auth/login', {
        email,
        password
      });

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        dispatch({ type: 'SET_USER', payload: data.user });
        
        toast.success('Login effettuato con successo!');
        
        // Reindirizza alla pagina precedente se disponibile
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
        
        return data.user;
      } else {
        throw new Error('Dati di login non validi');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Errore durante il login';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate, location]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/auth/register', userData);

      if (data.success && data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        dispatch({ type: 'SET_USER', payload: data.user });
        
        toast.success('Registrazione effettuata con successo!');
        navigate('/dashboard');
        
        return data.user;
      } else {
        throw new Error('Errore durante la registrazione');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Errore durante la registrazione';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    dispatch({ type: 'SET_USER', payload: null });
    toast.success('Logout effettuato con successo');
    navigate('/login');
  }, [dispatch, navigate]);

  const isAuthenticated = useCallback(() => {
    return !!state.user;
  }, [state.user]);

  return {
    user: state.user,
    login,
    register,
    logout,
    isLoading,
    error,
    isAuthenticated
  };
};