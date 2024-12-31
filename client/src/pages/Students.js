import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, ChartBar, X, FileUp } from 'lucide-react';
import { TbMars, TbVenus } from 'react-icons/tb';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';
import { Card } from "../components/ui/card";
import StudentModal from '../components/StudentModal';
import ImportStudentsModal from '../components/ImportStudentsModal';


const Students = () => {
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Stati base
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Stati per filtri e paginazione
  const [filters, setFilters] = useState({
    search: '',
    class: '',
    section: '',
    gender: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const STUDENTS_PER_PAGE = 10;

  // Fetch iniziale degli studenti
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/students');
        console.log('Students API response:', response.data);
        setStudents(response.data.data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
        setError(err.response?.data?.message || 'Errore nel caricamento degli studenti');
        toast.error('Errore nel caricamento degli studenti');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filtraggio studenti
  const filteredStudents = students.filter(student => {
    const searchTerm = filters.search.toLowerCase();
    const fullName = `${student.nome} ${student.cognome}`.toLowerCase();
    
    return (
      (searchTerm === '' || fullName.includes(searchTerm)) &&
      (filters.class === '' || student.classe === filters.class) &&
      (filters.section === '' || student.sezione === filters.section) &&
      (filters.gender === '' || student.sesso === filters.gender)
    );
  });

  // Paginazione
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

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
      await axios.delete(`/api/students/${studentId}`);
      setStudents(prev => prev.filter(s => s._id !== studentId));
      toast.success('Studente eliminato con successo');
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dello studente');
    }
  };

  const handleSubmitStudent = async (data) => {
    try {
      if (selectedStudent) {
        const response = await axios.put(`/api/students/${selectedStudent._id}`, data);
        setStudents(prev => prev.map(s => 
          s._id === selectedStudent._id ? response.data : s
        ));
        toast.success('Studente modificato con successo');
      } else {
        const response = await axios.post('/api/students', data);
        setStudents(prev => [...prev, response.data]);
        toast.success('Studente aggiunto con successo');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Errore durante il salvataggio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestione Studenti</h1>
        <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
            <FileUp className="w-5 h-5" />
            Importa Studenti
        </button>
        <button
          onClick={handleAddStudent}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Aggiungi Studente
        </button>
      </div>

      {/* Filtri */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cerca studente..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Altri filtri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtri esistenti */}
          </div>
        </div>
      </Card>

      {/* Tabella Studenti */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome e Cognome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sesso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Classe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    Nessuno studente trovato
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {student.cognome} {student.nome}
                    </td>
                    <td className="px-6 py-4">
                      {student.sesso === 'M' ? (
                        <TbMars className="w-5 h-5 text-blue-500" />
                      ) : (
                        <TbVenus className="w-5 h-5 text-pink-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {student.classe}° {student.sezione}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => navigate(`/students/${student._id}/analysis`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <ChartBar className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="text-gray-600 hover:text-gray-900"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitStudent}
        student={selectedStudent}
      />
      <ImportStudentsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        />
    </div>
  );
};

export default Students;