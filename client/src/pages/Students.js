import React, { useState, useEffect } from 'react';
import { Card } from "../components/ui/card";
import { FileUp, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import StudentModal from '../components/StudentModal';
import { toast } from 'react-hot-toast';

const STUDENTS_PER_PAGE = 10;

const Students = () => {
  // Stati per la gestione degli studenti
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [schoolConfig, setSchoolConfig] = useState(null);

  // Stati per i filtri
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    section: '',
    gender: ''
  });

  // Effetto per caricare la configurazione della scuola
  useEffect(() => {
    const fetchSchoolConfig = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schools/assigned');
        if (response.data.success && response.data.data) {
          console.log('School config received:', response.data.data);
          setSchoolConfig(response.data.data);
        } else {
          setError('Nessuna scuola assegnata');
        }
      } catch (error) {
        console.error('Errore nel recupero configurazione scuola:', error);
        setError('Errore nel caricamento della configurazione della scuola');
      }
    };

    fetchSchoolConfig();
  }, []);

  // Effetto per caricare gli studenti
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/students', {
          params: {
            page: currentPage,
            limit: STUDENTS_PER_PAGE,
            ...filters
          }
        });
        
        if (response.data.success) {
          setStudents(response.data.data);
          setTotalPages(Math.ceil(response.data.total / STUDENTS_PER_PAGE));
        } else {
          setError('Errore nel caricamento degli studenti');
        }
      } catch (error) {
        console.error('Errore nel recupero degli studenti:', error);
        setError('Errore nel caricamento degli studenti');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, filters]);

  // Handlers
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo studente?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`);
      setStudents(prev => prev.filter(s => s._id !== studentId));
      toast.success('Studente eliminato con successo');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dello studente');
    }
  };

  const handleStudentSubmit = async (data) => {
    try {
      if (selectedStudent) {
        const response = await axios.put(`http://localhost:5000/api/students/${selectedStudent._id}`, data);
        if (response.data.success) {
          setStudents(prev => prev.map(s => 
            s._id === selectedStudent._id ? response.data.data : s
          ));
          toast.success('Studente modificato con successo');
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/students', {
          ...data,
          school: schoolConfig._id // Aggiungi l'ID della scuola
        });
        if (response.data.success) {
          setStudents(prev => [...prev, response.data.data]);
          toast.success('Studente aggiunto con successo');
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Errore durante il salvataggio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Studenti</h1>
        <div className="flex gap-2">
          <button
            onClick={handleAddStudent}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Aggiungi Studente
          </button>
        </div>
      </div>

      {/* Filtri */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Barra di ricerca */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cerca studente..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
            >
              <option value="">Tutte le classi</option>
              {Array.from(
                { length: schoolConfig?.tipo_istituto === 'primo_grado' ? 3 : 5 }, 
                (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                )
              )}
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.section}
              onChange={(e) => handleFilterChange('section', e.target.value)}
            >
              <option value="">Tutte le sezioni</option>
              {schoolConfig?.sezioni_disponibili.map(sezione => (
                <option key={sezione} value={sezione}>{sezione}</option>
              ))}
            </select>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.gender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
            >
              <option value="">Tutti i generi</option>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabella Studenti */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cognome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sezione</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">{student.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.cognome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.classe?.nome || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.sezione}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Paginazione */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                  ${currentPage === index + 1
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }
                  ${index === 0 ? 'rounded-l-md' : ''}
                  ${index === totalPages - 1 ? 'rounded-r-md' : ''}
                `}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Modals */}
      {schoolConfig && (
        <>
          <StudentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleStudentSubmit}
            student={selectedStudent}
            schoolConfig={schoolConfig}
          />
        
        </>
      )}
    </div>
  );
};

export default Students;