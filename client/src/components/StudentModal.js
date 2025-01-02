import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { TbMars, TbVenus } from 'react-icons/tb';
import { Card } from "./ui/card";
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';

const StudentModal = ({ isOpen, onClose, student, onSubmit, schoolConfig }) => {
  useEffect(() => {
    console.log('=== PROPS STUDENT MODAL ===');
    console.log('schoolConfig:', schoolConfig);
    console.log('isOpen:', isOpen);
    console.log('student:', student);
  }, [schoolConfig, isOpen, student]);

  console.log('StudentModal props:', { isOpen, student, schoolConfig });
  
  useEffect(() => {
    if (schoolConfig && !schoolConfig._id) {
      console.error('schoolConfig non contiene _id:', schoolConfig);
    }
  }, [schoolConfig]);  
  
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    gender: '',
    number: '',
    section: '',
    note: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [existingClasses, setExistingClasses] = useState([]);
  const [shouldCreateNewClass, setShouldCreateNewClass] = useState(false);
  const [isCheckingClass, setIsCheckingClass] = useState(false);
  
  const getCurrentSchoolYear = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    if (currentMonth >= 9) {
      return `${currentYear}/${currentYear + 1}`;
    } else {
      return `${currentYear - 1}/${currentYear}`;
    }
  };

  const schoolOptions = useMemo(() => ({
    classi: Array.from(
      { length: schoolConfig?.tipo_istituto === 'primo_grado' ? 3 : 5 }, 
      (_, i) => ({ id: (i + 1).toString(), name: (i + 1).toString() })
    ),
    sezioni: schoolConfig?.sezioni_disponibili.map(s => ({ id: s, name: s })) || []
  }), [schoolConfig]);

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const currentSchoolYear = getCurrentSchoolYear();
            const response = await axios.get('/api/classes', {
                params: { 
                    school: schoolConfig._id,
                    schoolYear: currentSchoolYear  // Aggiungiamo questo parametro
                }
            });
            setExistingClasses(response.data.data || []);
        } catch (error) {
            console.error('Errore nel caricamento delle classi:', error);
            toast.error('Errore nel caricamento delle classi');
        }
    };

    if (isOpen && schoolConfig._id) {
        fetchClasses();
    }
}, [isOpen, schoolConfig._id]);

  useEffect(() => {
    setFormData({
      nome: student?.nome || '',
      cognome: student?.cognome || '',
      gender: student?.gender || '',
      number: student?.number || '',
      section: student?.section || '',
      note: student?.note || ''
    });
  }, [student]);

  useEffect(() => {
    const checkClassExists = async () => {
      if (!formData.number || !formData.section) return;
      
      setIsCheckingClass(true);
      const currentSchoolYear = getCurrentSchoolYear();
        
      const classExists = existingClasses.some(
            c => c.number === parseInt(formData.number) && 
                 c.section === formData.section.toUpperCase() &&
                 c.schoolYear === currentSchoolYear  // Aggiungiamo questo controllo
      );
      setShouldCreateNewClass(!classExists);
      setIsCheckingClass(false);
    };

    checkClassExists();
  }, [formData.number, formData.section, existingClasses]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio';
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio';
    if (!formData.gender) newErrors.gender = 'Il genere è obbligatorio';
    if (!formData.number) newErrors.number = 'La classe è obbligatoria';
    if (!formData.section) newErrors.section = 'La sezione è obbligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      let classId = null;
      
      if (shouldCreateNewClass) {
        const classData = {
          number: parseInt(formData.number),
          section: formData.section.toUpperCase(),
          schoolYear: getCurrentSchoolYear(),
          schoolId: schoolConfig._id
        };

        // Aggiungiamo log per debug
        console.log('=== TENTATIVO CREAZIONE CLASSE ===');
        console.log('Class Data:', classData);
        console.log('SchoolConfig:', schoolConfig);

        const createClass = window.confirm(
          `La classe ${formData.number}${formData.section} non esiste. Vuoi crearla?`
        );

        if (createClass) {
          try {
            // Log della richiesta
            console.log('Invio richiesta POST a /api/classes con dati:', classData);
            
            const newClassResponse = await axios.post('/api/classes', classData);
            console.log('Risposta creazione classe:', newClassResponse.data);
            if (newClassResponse.data.success) {
              classId = newClassResponse.data.data._id;
            }
          } catch (classError) {
            
            console.error('Dettagli errore creazione classe:', {
              message: classError.message,
              response: classError.response?.data,
              status: classError.response?.status,
              data: classData
          });
            
            toast.error(classError.response?.data?.message || 'Errore durante la creazione della classe');
            setIsLoading(false);
            return;
          }
        } else {
          setIsLoading(false);
          return;
        }
      } else {
        const existingClass = existingClasses.find(
          c => c.number === parseInt(formData.number) && 
               c.section === formData.section.toUpperCase()
        );
        classId = existingClass?._id;
      }

      const studentData = {
        nome: formData.nome,
        cognome: formData.cognome,
        gender: formData.gender.toUpperCase(),
        number: parseInt(formData.number),
        section: formData.section.toUpperCase(),
        schoolYear: getCurrentSchoolYear(),
        schoolId: schoolConfig._id,
        note: formData.note || ''
      };

      const result = await onSubmit(studentData);
      
      if (result && result.success) {
        toast.success(student ? 'Studente modificato con successo' : 'Studente aggiunto con successo');
        onClose();
      } else {
        toast.error(result?.message || 'Errore durante il salvataggio dello studente');
      }
    } catch (error) {
      console.error('Errore generale:', error);
      toast.error(error.response?.data?.message || 'Errore durante il salvataggio dello studente');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4">
        <Card className="bg-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {student ? 'Modifica Studente' : 'Aggiungi Studente'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.cognome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cognome && <p className="mt-1 text-sm text-red-500">{errors.cognome}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Genere *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.gender ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.number ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  {schoolOptions.classi.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                {errors.number && <p className="mt-1 text-sm text-red-500">{errors.number}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sezione *</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.section ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  {schoolOptions.sezioni.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                {errors.section && <p className="mt-1 text-sm text-red-500">{errors.section}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (opzionale)</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                disabled={isLoading}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {isLoading ? 'Salvataggio...' : student ? 'Salva Modifiche' : 'Aggiungi Studente'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentModal;