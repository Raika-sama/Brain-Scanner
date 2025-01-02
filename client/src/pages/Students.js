import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { FileUp, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import StudentModal from '../components/StudentModal';
import { toast } from 'react-hot-toast';
import { useApp } from '../context/AppContext';


const STUDENTS_PER_PAGE = 10;

const Students = () => {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  
  // Stati per UI
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Stati per i filtri
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    section: '',
    gender: ''
  });
  useEffect(() => {
    const fetchSchoolConfig = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('http://localhost:5000/api/schools/assigned');
        if (response.data.success && response.data.data) {
          dispatch({ type: 'SET_SCHOOL_CONFIG', payload: response.data.data });
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Nessuna scuola assegnata' });
        }
      } catch (error) {
        console.error('Errore nel recupero configurazione scuola:', error);
        dispatch({ 
          type: 'SET_ERROR', 
          payload: 'Errore nel caricamento della configurazione della scuola' 
        });
      }
    };

    fetchSchoolConfig();
  }, [dispatch]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await axios.get('http://localhost:5000/api/students', {
          params: {
            page: currentPage,
            limit: STUDENTS_PER_PAGE,
            teacherId: user._id,        // Aggiunto per filtrare per teacher principale
            includeTeachers: true,      // Nuovo parametro per includere anche studenti dove l'utente è nell'array teachers
            ...filters
          }
        });
        
        if (response.data.success) {
          // Filtra gli studenti per mostrare solo quelli dove l'utente è teacherId o è presente in teachers
          const filteredStudents = response.data.data.filter(student => 
            student.teacherId === user._id || 
            (student.teachers && student.teachers.includes(user._id))
          );

          dispatch({ type: 'SET_STUDENTS', payload: filteredStudents });
          setTotalPages(Math.ceil(response.data.total / STUDENTS_PER_PAGE));
        } else {
          dispatch({ type: 'SET_ERROR', payload: 'Errore nel caricamento degli studenti' });
        }
      } catch (error) {
        console.error('Errore nel recupero degli studenti:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Errore nel caricamento degli studenti' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchStudents();
  }, [currentPage, filters, dispatch, user._id]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };
  const handleAddStudent = async (studentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('http://localhost:5000/api/students', {
        ...studentData,
        teacherId: user._id,
        teachers: [user._id]
      });

      if (response.data.success) {
        dispatch({ 
          type: 'ADD_STUDENT', 
          payload: response.data.data 
        });
        return { success: true };
      } else {
        toast.error('Errore durante l\'aggiunta dello studente');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Errore durante l\'aggiunta dello studente:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Errore durante l\'aggiunta dello studente' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleEditStudent = async (studentData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Manteniamo i teacher esistenti
      const response = await axios.put(
        `http://localhost:5000/api/students/${studentData._id}`, 
        studentData
      );

      if (response.data.success) {
        dispatch({ 
          type: 'UPDATE_STUDENT', 
          payload: response.data.data 
        });
        return { success: true };
      } else {
        toast.error('Errore durante la modifica dello studente');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Errore durante la modifica dello studente:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Errore durante la modifica dello studente' 
      };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo studente?')) {
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.delete(`http://localhost:5000/api/students/${studentId}`);
      
      if (response.data.success) {
        dispatch({ type: 'DELETE_STUDENT', payload: studentId });
        toast.success('Studente eliminato con successo');
      } else {
        toast.error('Errore durante l\'eliminazione dello studente');
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione dello studente:', error);
      toast.error(error.response?.data?.message || 'Errore durante l\'eliminazione dello studente');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  return (
    <div className="p-4">
      <Card className="p-6">
        {/* Header con titolo e pulsanti */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestione Studenti</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Aggiungi Studente
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              <FileUp className="w-5 h-5 mr-2" />
              Importa CSV
            </button>
          </div>
        </div>

        {/* Filtri */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Cerca..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full p-2 pl-8 border border-gray-300 rounded-md"
              />
              <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div>
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Tutte le classi</option>
              {state.schoolConfig?.tipo_istituto === 'primo_grado' 
                ? [1, 2, 3].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))
                : [1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))
              }
            </select>
          </div>
          <div>
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Tutte le sezioni</option>
              {state.schoolConfig?.sezioni_disponibili?.map(section => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Tutti i generi</option>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
            </select>
          </div>
        </div>

        {/* Tabella Studenti */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cognome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Genere
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.nome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.cognome}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.number}{student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {student.gender}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {student.note || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedStudent(student);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginazione */}
        <div className="flex justify-between items-center mt-4">
          <div>
            <span className="text-sm text-gray-700">
              Pagina {currentPage} di {totalPages}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Precedente
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Successiva
            </button>
          </div>
        </div>
      </Card>

      {/* Modal per aggiunta/modifica studente */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={selectedStudent ? handleEditStudent : handleAddStudent}
        schoolConfig={state.schoolConfig}
      />
    </div>
  );
};

export default Students;