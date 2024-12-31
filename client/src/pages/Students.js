// src/pages/Students.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChartBar,
  X
} from 'lucide-react';
import { TbMars, TbVenus } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import axios from '../utils/axios';
import { Card } from "../components/ui/card";
import StudentModal from '../components/StudentModal';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from '../layouts/MainLayout'; 






// Componente LoadingSpinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Componente ErrorFallback
const ErrorFallback = ({ error }) => (
  <div className="p-4 text-red-500">
    <h2>Qualcosa è andato storto:</h2>
    <pre>{error.message}</pre>
  </div>
);

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired
};

function Students() {
  const navigate = useNavigate();
  
  // Stati principali
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Stati per il modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Stati per i filtri
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    section: '',
    schoolYear: '',
    gender: '',
    address: ''
  });

  // Costanti
  const STUDENTS_PER_PAGE = 10; // Aggiungi questa riga
  const GENDER_OPTIONS = [
    { value: 'M', label: 'Maschio', icon: TbMars },
    { value: 'F', label: 'Femmina', icon: TbVenus }
    ];
  const DEFAULT_FILTER_OPTIONS = {
    classi: [],
    sezioni: [],
    indirizzi: []
  };


  // Stati per la paginazione
  const [currentPage, setCurrentPage] = useState(1);
  
  // Stati per le opzioni di filtro disponibili
  const [filterOptions, setFilterOptions] = useState({
    classi: [],
    sezioni: [],
    indirizzi: []
  });
  // Effetti
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students');
        setStudents(response.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Errore nel caricamento degli studenti';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Errore nel fetch degli studenti:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fix API endpoint path
        const response = await axios.get('/api/filter/options');  // Changed from '/api/filterptions');  // Changed from '../../server/routes/api/filterOptions'
        setFilterOptions(response.data || DEFAULT_FILTER_OPTIONS);
      } catch (error) {
        console.error('Errore nel caricamento delle opzioni di filtro:', error);
        setFilterOptions(DEFAULT_FILTER_OPTIONS);
        toast.error('Impossibile caricare le opzioni di filtro. Usando valori predefiniti.');
      }
    };

    fetchFilterOptions();
  }, []);

  // Funzioni di callback memorizzate
  const handleFilterChange = useCallback((name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset alla prima pagina quando cambia un filtro
  }, []);

  /// Aggiorna il resetFilters per gestire il loading state
const resetFilters = useCallback(() => {
    setLoadingFilters(true);
    try {
      setFilters({
        search: '',
        class: '',
        section: '',
        schoolYear: '',
        gender: '',
        address: ''
      });
      setCurrentPage(1);
    } finally {
      setLoadingFilters(false);
    }
  }, []);

  const handleNavigateToAnalysis = useCallback((studentId) => {
    navigate(`/students/${studentId}/analysis`);
  }, [navigate]);

  const handleAddStudent = useCallback(() => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  }, []);

  const handleEditStudent = useCallback((student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  }, []);

  const handleDeleteStudent = useCallback(async (studentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo studente?')) return;
    
    setActionLoading(true);
    try {
      await axios.delete(`/api/students/${studentId}`);
      setStudents(prev => prev.filter(s => s._id !== studentId));
      toast.success('Studente eliminato con successo');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Errore durante l\'eliminazione dello studente';
      toast.error(errorMessage);
      console.error('Errore durante l\'eliminazione:', error);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleSubmitStudent = useCallback(async (studentData) => {
    try {
      const endpoint = selectedStudent 
        ? `/api/students/${selectedStudent._id}`
        : '/api/students';
      const method = selectedStudent ? 'put' : 'post';
      
      const response = await axios[method](endpoint, studentData);
      
      setStudents(prev => 
        selectedStudent 
          ? prev.map(s => s._id === selectedStudent._id ? response.data : s)
          : [...prev, response.data]
      );
      
      toast.success(`Studente ${selectedStudent ? 'modificato' : 'aggiunto'} con successo`);
      setIsModalOpen(false);
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Errore durante il salvataggio';
      toast.error(errorMessage);
      throw error;
    }
  }, [selectedStudent]);




// Filtraggio memorizzato degli studenti
const filteredStudents = useMemo(() => {
  return students.filter(student => {
    // Ricerca per nome/cognome
    const searchTerm = filters.search.toLowerCase();
    const fullName = `${student.nome} ${student.cognome}`.toLowerCase();
    const searchMatch = !filters.search || 
      fullName.includes(searchTerm) || 
      student.codiceFiscale?.toLowerCase().includes(searchTerm);

    // Filtri principali
    const classMatch = !filters.class || student.classe === filters.class;
    const sectionMatch = !filters.section || student.sezione === filters.section;
    const genderMatch = !filters.gender || student.sesso === filters.gender;
    const addressMatch = !filters.address || student.indirizzo === filters.address;

    return searchMatch && classMatch && sectionMatch && genderMatch && addressMatch;
  });
}, [students, filters]);

  // Calcoli per la paginazione
  const paginationData = useMemo(() => {
    const indexOfLastStudent = currentPage * STUDENTS_PER_PAGE;
    const indexOfFirstStudent = indexOfLastStudent - STUDENTS_PER_PAGE;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE);

    return {
      currentStudents,
      totalPages,
      indexOfFirstStudent,
      indexOfLastStudent,
      totalStudents: filteredStudents.length
    };
  }, [filteredStudents, currentPage]);

  // Componente Paginazione
  const Pagination = useCallback(({ currentPage, totalPages, onPageChange }) => {
    return (
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border 
                      border-gray-300 text-sm font-medium rounded-md text-gray-700 
                      bg-white hover:bg-gray-50 disabled:bg-gray-100 
                      disabled:text-gray-400"
          >
            Precedente
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border 
                      border-gray-300 text-sm font-medium rounded-md text-gray-700 
                      bg-white hover:bg-gray-50 disabled:bg-gray-100 
                      disabled:text-gray-400"
          >
            Successivo
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrati{' '}
              <span className="font-medium">
                {paginationData.indexOfFirstStudent + 1}
              </span>
              {' '}-{' '}
              <span className="font-medium">
                {Math.min(paginationData.indexOfLastStudent, paginationData.totalStudents)}
              </span>
              {' '}di{' '}
              <span className="font-medium">{paginationData.totalStudents}</span>
              {' '}risultati
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => onPageChange(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border 
                    text-sm font-medium
                    ${currentPage === index + 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  }, [paginationData]);

  Pagination.propTypes = {
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageChange: PropTypes.func.isRequired
  };
  return (
    <MainLayout>
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Studenti</h1>
        <button 
          onClick={handleAddStudent}
          disabled={actionLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white 
                   rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
        >
          <Plus className="w-5 h-5" />
          Aggiungi Studente
        </button>
      </div>

      {/* Sezione Filtri */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca studente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>


          {/* Filtri */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Filtro Classe */}
            <select
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
              disabled={loadingFilters}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Tutte le classi</option>
              {(filterOptions.classi || DEFAULT_FILTER_OPTIONS.classi).map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.name}
                </option>
              ))}
            </select>

            {/* Filtro Sezione */}
            <select
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
              disabled={loadingFilters}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Tutte le sezioni</option>
              {(filterOptions.sezioni || DEFAULT_FILTER_OPTIONS.sezioni).map(sezione => (
                <option key={sezione.id} value={sezione.id}>
                  {sezione.name}
                </option>
              ))}
            </select>

            {/* Filtro Sesso */}
            <select
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              disabled={loadingFilters}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                        disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Tutti</option>
              {GENDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    {option.label}
                  </span>
                </option>
              ))}
            </select>

            {/* Filtro Indirizzo */}
            <select
              value={filters.address}
              onChange={(e) => handleFilterChange('address', e.target.value)}
              disabled={loadingFilters}
              className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                        disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              <option value="">Tutti gli indirizzi</option>
              {(filterOptions.indirizzi || DEFAULT_FILTER_OPTIONS.indirizzi).map(indirizzo => (
                <option key={indirizzo.id} value={indirizzo.id}>
                  {indirizzo.name}
                </option>
              ))}
            </select>

            {/* Pulsante Reset */}
            <button
              onClick={resetFilters}
              disabled={actionLoading || loadingFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 
                        text-gray-600 hover:text-gray-900 border border-gray-200 
                        rounded-lg hover:bg-gray-50 transition-colors 
                        disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {loadingFilters ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
              Reset
            </button>
          </div>

          {/* Indicatore numero risultati */}
          {!loading && !error && (
            <div className="text-sm text-gray-500 mt-2">
              {paginationData.totalStudents} risultati trovati
            </div>
          )}
        </div>
      </Card>
{/* Tabella Studenti */}
<Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome e Cognome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indirizzo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : paginationData.currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Nessuno studente trovato
                  </td>
                </tr>
              ) : (
                paginationData.currentStudents.map((student) => (
                  <tr 
                    key={student._id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {student.cognome} {student.nome}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {student.sesso === 'M' ? (
                          <TbMars className="w-5 h-5 text-blue-500" />
                        ) : (
                          <TbVenus className="w-5 h-5 text-pink-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.classe}° {student.sezione}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {student.indirizzo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 
                                   font-semibold rounded-full bg-green-100 
                                   text-green-800">
                        Attivo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleNavigateToAnalysis(student._id)}
                          disabled={actionLoading}
                          className="text-blue-600 hover:text-blue-900 disabled:text-blue-300"
                          title="Analisi"
                        >
                          <ChartBar className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEditStudent(student)}
                          disabled={actionLoading}
                          className="text-gray-600 hover:text-gray-900 disabled:text-gray-300"
                          title="Modifica"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student._id)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-900 disabled:text-red-300"
                          title="Elimina"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginazione */}
        {!loading && !error && paginationData.totalStudents > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Modal Studente */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSubmit={handleSubmitStudent}
      />
    </div>
    </MainLayout>
  );
   
}


export default Students;