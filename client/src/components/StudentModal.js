import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { TbMars, TbVenus } from 'react-icons/tb';
import { Card } from "./ui/card";
import { toast } from 'react-hot-toast';
import axios from '../utils/axios'; // Importa l'istanza axios configurata

const StudentModal = ({ isOpen, onClose, student, onSubmit, schoolConfig }) => {
  // Stati base
  const [formData, setFormData] = useState({
    name: '',
    cognome: '',
    sesso: '',
    classe: '',
    sezione: '',
    note: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Nuovi stati per la gestione delle classi
  const [existingClasses, setExistingClasses] = useState([]);
  const [shouldCreateNewClass, setShouldCreateNewClass] = useState(false);
  const [isCheckingClass, setIsCheckingClass] = useState(false);

  // Opzioni della scuola (invariato)
  const schoolOptions = useMemo(() => ({
    classi: Array.from(
      { length: schoolConfig?.tipo_istituto === 'primo_grado' ? 3 : 5 }, 
      (_, i) => ({ id: (i + 1).toString(), name: (i + 1).toString() })
    ),
    sezioni: schoolConfig?.sezioni_disponibili.map(s => ({ id: s, name: s })) || []
  }), [schoolConfig]);

  // Carica le classi esistenti quando il modal si apre
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('/api/classes', {
          params: { school: schoolConfig._id }
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

  // Imposta i dati iniziali del form
  useEffect(() => {
    setFormData({
      nome: student?.nome || '',
      cognome: student?.cognome || '',
      sesso: student?.sesso || '',
      classe: student?.classe || '',
      sezione: student?.sezione || '',
      note: student?.note || ''
    });
  }, [student]);

  // Controlla se la classe esiste quando cambiano classe o sezione
  useEffect(() => {
    const checkClassExists = async () => {
      if (!formData.classe || !formData.sezione) return;
      
      setIsCheckingClass(true);
      const classExists = existingClasses.some(
        c => c.numero === formData.classe && c.sezione === formData.sezione
      );
      setShouldCreateNewClass(!classExists);
      setIsCheckingClass(false);
    };

    checkClassExists();
  }, [formData.classe, formData.sezione, existingClasses]);

  // Validazione del form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio';
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio';
    if (!formData.sesso) newErrors.sesso = 'Il sesso è obbligatorio';
    if (!formData.classe) newErrors.classe = 'La classe è obbligatoria';
    if (!formData.sezione) newErrors.sezione = 'La sezione è obbligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestione cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Gestione del submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const studentData = {
        ...formData,
        school: schoolConfig._id,
        annoScolastico: ClassService.getCurrentSchoolYear()
      };

      if (shouldCreateNewClass) {
        const createClass = window.confirm(
          `La classe ${formData.classe}${formData.sezione} non esiste. Vuoi crearla?`
        );

        if (createClass) {
          // Crea la nuova classe
          const newClassResponse = await axios.post('/api/classes', {
            numero: formData.classe,
            sezione: formData.sezione,
            school: schoolConfig._id
          });

          // Aggiungi l'ID della classe appena creata allo studente
          studentData.classe = newClassResponse.data.data._id;
        } else {
          setIsLoading(false);
          return;
        }
      } else {
        // Usa l'ID della classe esistente
        const existingClass = existingClasses.find(
          c => c.numero === formData.classe && c.sezione === formData.sezione
        );
        if (existingClass) {
          studentData.classe = existingClass._id;
        }
      }

      await onSubmit(studentData);
      toast.success(student ? 'Studente modificato con successo' : 'Studente aggiunto con successo');
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Errore durante il salvataggio dello studente');
      }
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
            {/* Nome e Cognome */}
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

            {/* Sesso, Classe e Sezione */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sesso *</label>
                <select
                  name="sesso"
                  value={formData.sesso}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.sesso ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                </select>
                {errors.sesso && <p className="mt-1 text-sm text-red-500">{errors.sesso}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                <select
                  name="classe"
                  value={formData.classe}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.classe ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  {schoolOptions.classi.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                {errors.classe && <p className="mt-1 text-sm text-red-500">{errors.classe}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sezione *</label>
                <select
                  name="sezione"
                  value={formData.sezione}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md ${errors.sezione ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  {schoolOptions.sezioni.map(option => (
                    <option key={option.id} value={option.id}>{option.name}</option>
                  ))}
                </select>
                {errors.sezione && <p className="mt-1 text-sm text-red-500">{errors.sezione}</p>}
              </div>
            </div>

            {/* Note */}
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

            {/* Pulsanti */}
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