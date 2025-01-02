import React, { createContext, useContext, useReducer } from 'react';
import axios from '../utils/axios';

const AppContext = createContext();

// Stato iniziale
const initialState = {
  user: JSON.parse(localStorage.getItem('userData')) || null,
  students: [],
  classes: [],
  schoolConfig: null,
  currentClass: null,
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

// Selectors
export const selectors = {
  getStudentsByClass: (state, classId) => 
    state.students.filter(s => s.class?._id === classId),
  
  getFilteredStudents: (state, filters) => {
    let filtered = state.students;
    if (filters.year) {
      filtered = filtered.filter(s => s.year === filters.year);
    }
    if (filters.section) {
      filtered = filtered.filter(s => s.section === filters.section);
    }
    if (filters.institutionType) {
      filtered = filtered.filter(s => s.institutionType === filters.institutionType);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.firstName.toLowerCase().includes(term) ||
        s.lastName.toLowerCase().includes(term)
      );
    }
    return filtered;
  }
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
        user: null,
        
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
        students: action.payload.map(student => ({
          ...student,
          teachers: student.teachers || []
        }))
      };

    case 'SET_CLASSES':
      return {
        ...state,
        classes: action.payload
      };

    case 'SET_CURRENT_CLASS':
      return {
        ...state,
        currentClass: action.payload
      };

    case 'SET_SCHOOL_CONFIG':
      return {
        ...state,
        schoolConfig: action.payload
      };

    case 'ADD_STUDENT':
      const { student, classId } = action.payload;
      return {
        ...state,
        students: [...state.students, {
          ...student,
          teachers: student.teachers || []
        }],
        classes: state.classes.map(cls => 
          cls._id === classId 
            ? { 
                ...cls, 
                students: [...(cls.students || []), student._id] 
              }
            : cls
        )
      };

    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student =>
          student._id === action.payload._id 
            ? {
                ...action.payload,
                teachers: action.payload.teachers || []
              }
            : student
        )
      };

    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => 
          student._id !== action.payload
        ),
        classes: state.classes.map(cls => ({
          ...cls,
          students: cls.students?.filter(id => 
            id !== action.payload
          ) || []
        }))
      };

    case 'ADD_CLASS':
      return {
        ...state,
        classes: [...state.classes, action.payload]
      };

    case 'UPDATE_CLASS':
      return {
        ...state,
        classes: state.classes.map(cls =>
          cls._id === action.payload._id
            ? action.payload
            : cls
        )
      };

    case 'DELETE_CLASS':
      return {
        ...state,
        classes: state.classes.filter(cls => 
          cls._id !== action.payload
        ),
        students: state.students.filter(student => 
          student.class?._id !== action.payload
        )
      };

    default:
      return state;
  }
};
// Helper functions per le operazioni CRUD
const studentOperations = {
  fetchStudents: async (dispatch, teacherId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get('/api/students', {
        params: {
          teacherId,
          includeTeachers: true
        }
      });
      
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
  },

  addStudent: async (dispatch, studentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/students', {
        ...studentData,
        teachers: studentData.teachers || []
      });

      if (response.data.success) {
        dispatch({
          type: 'ADD_STUDENT',
          payload: {
            student: response.data.data,
            classId: studentData.classId
          }
        });
        return response.data.data;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nella creazione dello studente');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },

  updateStudent: async (dispatch, studentId, studentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.put(`/api/students/${studentId}`, studentData);
      
      if (response.data.success) {
        dispatch({
          type: 'UPDATE_STUDENT',
          payload: response.data.data
        });
        return response.data.data;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nell\'aggiornamento dello studente');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },

  deleteStudent: async (dispatch, studentId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.delete(`/api/students/${studentId}`);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_STUDENT', payload: studentId });
        return true;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nella eliminazione dello studente');
      throw error;
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
  },

  addClass: async (dispatch, classData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/classes', classData);
      
      if (response.data.success) {
        dispatch({ type: 'ADD_CLASS', payload: response.data.data });
        return response.data.data;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nella creazione della classe');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },

  updateClass: async (dispatch, classId, classData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.put(`/api/classes/${classId}`, classData);
      
      if (response.data.success) {
        dispatch({ type: 'UPDATE_CLASS', payload: response.data.data });
        return response.data.data;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nell\'aggiornamento della classe');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  },

  deleteClass: async (dispatch, classId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.delete(`/api/classes/${classId}`);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_CLASS', payload: classId });
        return true;
      }
    } catch (error) {
      handleError(dispatch, error, 'Errore nella eliminazione della classe');
      throw error;
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
    ...userOperations,
    selectors
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