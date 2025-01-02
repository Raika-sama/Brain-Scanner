// src/hooks/useAuth.js
import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';

export const useAuth = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password, rememberMe) => {
    setIsLoading(true);
    setError(null);

    try {
      // Login request
      const loginResponse = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = loginResponse.data;

      // Salva token e user data
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Aggiorna context
      dispatch({ type: 'SET_USER', payload: user });
      
      toast.success('Login effettuato con successo!');
      navigate('/dashboard');
      
      return user;

    } catch (err) {
      const message = err.response?.data?.message || 'Errore durante il login';
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, navigate]);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(user));
      
      dispatch({ type: 'SET_USER', payload: user });
      
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
    dispatch({ type: 'SET_USER', payload: null });
    navigate('/login');
  }, [dispatch, navigate]);

  return {
    login,
    register,
    logout,
    isLoading,
    error
  };
};