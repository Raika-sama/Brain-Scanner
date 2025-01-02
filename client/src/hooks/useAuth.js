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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

 
  // Verifica automatica dello stato di autenticazione all'avvio
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoading(true);
        try {
          const response = await axios.get('/api/users/me');
          dispatch({ type: 'SET_USER', payload: response.data.user });  // Usa dispatch
        } catch (err) {
          console.error('Verifica auth fallita:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          localStorage.removeItem('rememberMe');
          dispatch({ type: 'SET_USER', payload: null });  // Usa dispatch
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
      const loginResponse = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = loginResponse.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      dispatch({ type: 'SET_USER', payload: user });  // Usa dispatch
      
      toast.success('Login effettuato con successo!');
      
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
      
      return user;

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
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });  // Usa dispatch
      
      toast.success('Registrazione effettuata con successo!');
      navigate('/dashboard');
      
      return user;

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
    dispatch({ type: 'SET_USER', payload: null });  // Usa dispatch
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