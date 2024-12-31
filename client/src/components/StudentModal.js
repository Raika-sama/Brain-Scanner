// src/components/students/StudentModal.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { TbMars, TbVenus } from 'react-icons/tb';
import { Card } from "./ui/card";
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

const StudentModal = ({ isOpen, onClose, student, onSubmit }) => {
  // Stati
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    sesso: '',
    dataNascita: '',
    classe: '',
    sezione: '',
    indirizzo: '',
    codiceFiscale: '',
    note: ''
  });

  const [schoolOptions, setSchoolOptions] = useState({
    classi: [],
    sezioni: [],
    indirizzi: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Effetti
  useEffect(() => {
    if (student) {
      setFormData({
        ...student,
        dataNascita: student.dataNascita?.split('T')[0]
      });
    } else {
      setFormData({
        nome: '',
        cognome: '',
        sesso: '',
        dataNascita: '',
        classe: '',
        sezione: '',
        indirizzo: '',
        codiceFiscale: '',
        note: ''
      });
    }
  }, [student]);

  useEffect(() => {
    if (isOpen) {
      const controller = new AbortController();
      
      const fetchSchoolOptions = async () => {
        try {
          const response = await axios.get('/api/school/options', {
            signal: controller.signal
          });
          setSchoolOptions(response.data);
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error('Errore nel caricamento delle opzioni:', error);
            toast.error('Errore nel caricamento delle opzioni della scuola');
          }
        }
      };

      fetchSchoolOptions();
      return () => controller.abort();
    }
  }, [isOpen]);

  // Validazioni
  const validateCodiceFiscale = useCallback((cf) => {
    if (!cf) return true; // opzionale
    const regex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    return regex.test(cf.toUpperCase());
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio';
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio';
    if (!formData.sesso) newErrors.sesso = 'Il sesso è obbligatorio';
    if (!formData.dataNascita) newErrors.dataNascita = 'La data di nascita è obbligatoria';
    if (!formData.classe) newErrors.classe = 'La classe è obbligatoria';
    if (!formData.sezione) newErrors.sezione = 'La sezione è obbligatoria';
    
    if (formData.codiceFiscale && !validateCodiceFiscale(formData.codiceFiscale)) {
      newErrors.codiceFiscale = 'Codice fiscale non valido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateCodiceFiscale]);

  // Handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Rimuovi l'errore quando l'utente inizia a digitare
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
      toast.error('Errore durante il salvataggio dello studente');
    } finally {
      setIsLoading(false);
    }
  };

  // Componenti
  const SelectField = useMemo(() => ({ 
    options, 
    value, 
    onChange, 
    name, 
    label, 
    required, 
    error 
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={isLoading}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   ${error ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Seleziona...</option>
        {options.length === 0 ? (
          <option value="" disabled>Nessun dato disponibile</option>
        ) : (
          options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))
        )}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  ), [isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4">
        <Card className="bg-white p-6">
          {/* Header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome e Cognome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            ${errors.nome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-500">{errors.nome}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            ${errors.cognome ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.cognome && (
                  <p className="mt-1 text-sm text-red-500">{errors.cognome}</p>
                )}
              </div>
            </div>

            {/* Sesso e Data di Nascita */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sesso *
                </label>
                <select
                  name="sesso"
                  value={formData.sesso}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            ${errors.sesso ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Seleziona...</option>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
                </select>
                {formData.sesso === 'M' && (
                  <TbMars className="absolute right-3 top-9 w-5 h-5 text-blue-500" />
                )}
                {formData.sesso === 'F' && (
                  <TbVenus className="absolute right-3 top-9 w-5 h-5 text-pink-500" />
                )}
                {errors.sesso && (
                  <p className="mt-1 text-sm text-red-500">{errors.sesso}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Nascita *
                </label>
                <input
                  type="date"
                  name="dataNascita"
                  value={formData.dataNascita}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                            ${errors.dataNascita ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.dataNascita && (
                  <p className="mt-1 text-sm text-red-500">{errors.dataNascita}</p>
                )}
              </div>
            </div>

            {/* Classe, Sezione e Indirizzo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                options={schoolOptions.classi}
                value={formData.classe}
                onChange={handleChange}
                name="classe"
                label="Classe"
                required
                error={errors.classe}
              />
              
              <SelectField
                options={schoolOptions.sezioni}
                value={formData.sezione}
                onChange={handleChange}
                name="sezione"
                label="Sezione"
                required
                error={errors.sezione}
              />
              
              <SelectField
                options={schoolOptions.indirizzi}
                value={formData.indirizzo}
                onChange={handleChange}
                name="indirizzo"
                label="Indirizzo"
                error={errors.indirizzo}
              />
            </div>

            {/* Codice Fiscale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codice Fiscale (opzionale)
              </label>
              <input
                type="text"
                name="codiceFiscale"
                value={formData.codiceFiscale}
                onChange={handleChange}
                disabled={isLoading}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500
                          disabled:bg-gray-100 disabled:cursor-not-allowed
                          ${errors.codiceFiscale ? 'border-red-500' : 'border-gray-300'}`}
                pattern="[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]"
                title="Inserisci un codice fiscale valido"
              />
              {errors.codiceFiscale && (
                <p className="mt-1 text-sm text-red-500">{errors.codiceFiscale}</p>
              )}
            </div>

{/* Note */}
<div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (opzionale)
              </label>
              <textarea
                name="note"
                disabled={isLoading}
                value={formData.note}
                onChange={handleChange}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-md 
                         focus:ring-blue-500 focus:border-blue-500
                         disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Errori del form */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Pulsanti */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                         bg-white border border-gray-300 rounded-md 
                         hover:bg-gray-50 disabled:bg-gray-100 
                         disabled:cursor-not-allowed"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white 
                         bg-blue-600 rounded-md hover:bg-blue-700
                         disabled:bg-blue-400 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-blue-500"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                         xmlns="http://www.w3.org/2000/svg" fill="none" 
                         viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" 
                              stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Salvataggio...
                  </div>
                ) : student ? 'Salva Modifiche' : 'Aggiungi Studente'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

// PropTypes
StudentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.shape({
    _id: PropTypes.string,
    nome: PropTypes.string,
    cognome: PropTypes.string,
    sesso: PropTypes.oneOf(['M', 'F']),
    dataNascita: PropTypes.string,
    classe: PropTypes.string,
    sezione: PropTypes.string,
    indirizzo: PropTypes.string,
    codiceFiscale: PropTypes.string,
    note: PropTypes.string
  }),
  onSubmit: PropTypes.func.isRequired
};

// Default Props
StudentModal.defaultProps = {
  student: null
};

export default StudentModal;