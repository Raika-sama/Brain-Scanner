import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const AppContext = createContext();

// Definizione dello stato iniziale
const initialState = {
  user: JSON.parse(localStorage.getItem('userData')) || null,// Aggiungi questo
  students: [],
  classes: [],
  schoolConfig: null,
  loading: false,
  error: null
};


// Reducer per gestire le azioni
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
    console.log('Setting user in reducer:', action.payload);  
     // Se i dati sono nidificati, prendi l'oggetto user interno
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

    case 'ADD_STUDENT':
      const { student, classId } = action.payload;
      return {
        ...state,
        students: [...state.students, {
          ...student,
          teachers: student.teachers || [] // Assicuriamo che teachers sia sempre un array
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
                teachers: action.payload.teachers || [] // Assicuriamo che teachers sia sempre un array
              }
            : student
        )
      };

    case 'DELETE_STUDENT':
      return {
        ...state,
        students: state.students.filter(student => student._id !== action.payload),
        classes: state.classes.map(cls => ({
          ...cls,
          students: cls.students ? cls.students.filter(id => id !== action.payload) : []
        }))
      };

    case 'ADD_CLASS':
      return {
        ...state,
        classes: [...state.classes, action.payload]
      };

    default:
      return state;
  }
};




// Helper functions per le operazioni CRUD
const addStudent = async (dispatch, studentData) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    let classId = studentData.classId;

    // Se non abbiamo un classId, verifichiamo/creiamo la classe
    if (!classId) {
      const classResponse = await axios.post('http://localhost:5000/api/classes', {
        number: studentData.number,
        section: studentData.section,
        schoolYear: new Date().getFullYear()
      });
      
      if (classResponse.data.success) {
        classId = classResponse.data.data._id;
        dispatch({
          type: 'ADD_CLASS',
          payload: classResponse.data.data
        });
      } else {
        throw new Error('Errore nella creazione della classe');
      }
    }

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


    // Creiamo lo studente con i campi teacher
    const studentResponse = await axios.post('http://localhost:5000/api/students', {
      ...studentData,
      classId,
      teacherId: studentData.teacherId,
      teachers: studentData.teachers || []
    });

        if (studentResponse.data.success) {
          dispatch({
            type: 'ADD_STUDENT',
            payload: {
              student: studentResponse.data.data,
              classId
            }
          });
          return studentResponse.data.data;
        } else {
          throw new Error(studentResponse.data.message || 'Errore nella creazione dello studente');
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.message || error.message || 'Errore nella creazione dello studente' 
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

const updateStudent = async (dispatch, studentId, studentData) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const response = await axios.put(`http://localhost:5000/api/students/${studentId}`, {
      ...studentData,
      teachers: studentData.teachers || []  // Assicuriamo che teachers sia sempre presente
    });
    
    if (response.data.success) {
      dispatch({
        type: 'UPDATE_STUDENT',
        payload: response.data.data
      });
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Errore nell\'aggiornamento dello studente');
    }
  } catch (error) {
    dispatch({ 
      type: 'SET_ERROR', 
      payload: error.response?.data?.message || error.message || 'Errore nell\'aggiornamento dello studente' 
    });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

const deleteStudent = async (dispatch, studentId) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    const response = await axios.delete(`http://localhost:5000/api/students/${studentId}`);
    
    if (response.data.success) {
      dispatch({
        type: 'DELETE_STUDENT',
        payload: studentId
      });
      return true;
    } else {
      throw new Error(response.data.message || 'Errore nella eliminazione dello studente');
    }
  } catch (error) {
    dispatch({ 
      type: 'SET_ERROR', 
      payload: error.response?.data?.message || error.message || 'Errore nella eliminazione dello studente' 
    });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};
// Provider Component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Wrapper functions per i metodi helper
  const studentOperations = {
    addStudent: (studentData) => addStudent(dispatch, studentData),
    updateStudent: (studentId, studentData) => updateStudent(dispatch, studentId, studentData),
    deleteStudent: (studentId) => deleteStudent(dispatch, studentId),
    
    // Funzioni addizionali per il caricamento dei dati
    fetchStudents: async (teacherId) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('http://localhost:5000/api/students', {
          params: {
            teacherId,
            includeTeachers: true  // Per includere anche studenti dove l'utente è nell'array teachers
          }
        });
        
        if (response.data.success) {
          // Assicuriamoci che tutti gli studenti abbiano l'array teachers
          const studentsWithTeachers = response.data.data.map(student => ({
            ...student,
            teachers: student.teachers || []
          }));
          dispatch({ type: 'SET_STUDENTS', payload: studentsWithTeachers });
        } else {
          throw new Error('Errore nel caricamento degli studenti');
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.message || error.message 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    fetchSchoolConfig: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('http://localhost:5000/api/schools/assigned');
        if (response.data.success) {
          dispatch({ type: 'SET_SCHOOL_CONFIG', payload: response.data.data });
        } else {
          throw new Error('Errore nel caricamento della configurazione scuola');
        }
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.message || error.message 
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  };

  const value = {
    state,
    dispatch,
    ...studentOperations
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

