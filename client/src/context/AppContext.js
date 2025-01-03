import React, { createContext, useContext, useReducer } from 'react';
import axios from '../utils/axios';

const AppContext = createContext();

// Stato iniziale
const initialState = {
  user: JSON.parse(localStorage.getItem('userData')) || null,
  students: [],
  classes: [],
  schoolConfig: null,
  loading: false,
  error: null
};

// Utility per gestione errori
const handleError = (dispatch, error, customMessage) => {
  const errorMessage = error.response?.data?.message || 
                      error.message || 
                      customMessage;
  dispatch({ 
    type: 'SET_ERROR', 
    payload: errorMessage 
  });
  return errorMessage;
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null
      };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'SET_STUDENTS':
      return {
        ...state,
        students: action.payload
      };

    case 'SET_CLASSES':
      return {
        ...state,
        classes: action.payload
      };

    case 'SET_SCHOOL_CONFIG':
      return {
        ...state,
        schoolConfig: action.payload
      };

    default:
      return state;
  }
};

// Helper functions per le operazioni base
const studentOperations = {
  fetchStudents: async (dispatch) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/students/school/assigned');
      
      if (response.data.success) {
        dispatch({ type: 'SET_STUDENTS', payload: response.data.data });
      } else {
        throw new Error('Errore nel caricamento degli studenti');
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nel caricamento degli studenti');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
};

const classOperations = {
  fetchClasses: async (dispatch) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/classes');
      
      if (response.data.success) {
        dispatch({ type: 'SET_CLASSES', payload: response.data.data });
      } else {
        throw new Error('Errore nel caricamento delle classi');
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nel caricamento delle classi');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
};

// User operations
const userOperations = {
  setUser: (dispatch, userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
    dispatch({ type: 'SET_USER', payload: userData });
  },
  
  clearUser: (dispatch) => {
    localStorage.removeItem('userData');
    dispatch({ type: 'SET_USER', payload: null });
  },
  
  updateUser: (dispatch, updates) => {
    const currentUser = JSON.parse(localStorage.getItem('userData'));
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('userData', JSON.stringify(updatedUser));
    dispatch({ type: 'SET_USER', payload: updatedUser });
  }
};

// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch,
    ...studentOperations,
    ...classOperations,
    ...userOperations
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}