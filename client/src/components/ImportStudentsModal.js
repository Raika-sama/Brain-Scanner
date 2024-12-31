import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadTemplate } from '../utils/excelTemplate'; // Il nuovo file che abbiamo creato
import { validateExcelFile } from '../utils/excelValidation';
import axios from 'axios';

const ImportStudentsModal = ({ isOpen, onClose, onImportComplete }) => {
  const [user, setUser] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [activeStep, setActiveStep] = useState('upload'); // 'upload', 'preview', 'complete'
  const [uploadProgress, setUploadProgress] = useState(0);

  // Carica i dati dell'utente all'apertura del modale
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success && response.data.user.school) {
          setUser(response.data.user);
        } else {
          setValidationResults({
            errors: ['Non è stata trovata una scuola associata al tuo account'],
            validData: []
          });
        }
      } catch (error) {
        setValidationResults({
          errors: ['Errore nel caricamento dei dati della scuola'],
          validData: []
        });
      }
    };

    if (isOpen) {
      fetchUserData();
      setActiveStep('upload');
      setValidationResults(null);
      setUploadProgress(0);
    }
  }, [isOpen]);

  const handleFileUpload = async (file) => {
    if (!user?.school) {
      setValidationResults({
        errors: ['Non è stata trovata una scuola associata al tuo account'],
        validData: []
      });
      return;
    }

    setIsValidating(true);
    setValidationResults(null);
    setActiveStep('upload');
    setUploadProgress(0);

    try {
      const results = await validateExcelFile(file, user.school);
      setValidationResults(results);
      
      if (results.errors.length === 0) {
        setActiveStep('preview');
      }
      
      setUploadProgress(100);
    } catch (error) {
      setValidationResults({
        errors: [error.message],
        validData: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.xlsx')) {
      setValidationResults({
        errors: ['Il file deve essere in formato .xlsx'],
        validData: []
      });
      return;
    }

    await handleFileUpload(file);
  };

  const handleDownloadTemplate = async () => {
    if (!user?.school) {
      setValidationResults({
        errors: ['Non è stata trovata una scuola associata al tuo account'],
        validData: []
      });
      return;
    }

    if (!user.school.tipo_istituto || !user.school.sezioni_disponibili) {
      setValidationResults({
        errors: ['La configurazione della scuola è incompleta. Contattare l\'amministratore.'],
        validData: []
      });
      return;
    }

    try {
      await downloadTemplate(user.school);
    } catch (error) {
      setValidationResults({
        errors: ['Errore durante il download del template'],
        validData: []
      });
    }
  };

  const handleImport = async () => {
    if (!validationResults?.validData || validationResults.validData.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/students/batch',
        {
          students: validationResults.validData
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setActiveStep('complete');
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        errors: [...(prev.errors || []), 'Errore durante il salvataggio: ' + error.message]
      }));
    }
  };

  const renderValidationStatus = () => {
    if (!validationResults) return null;

    return (
      <div className="mt-4">
        {validationResults.errors.length > 0 ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-red-500 mr-2" />
              <h3 className="text-red-700 font-medium">Errori di validazione:</h3>
            </div>
            <ul className="list-disc list-inside text-red-600 text-sm">
              {validationResults.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-500 mr-2" />
              <span className="text-green-700">
                {validationResults.validRows} studenti pronti per l'importazione
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPreview = () => {
    if (!validationResults?.validData) return null;

    return (
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-2">Anteprima dati</h3>
        <div className="max-h-60 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Nome', 'Cognome', 'Sesso', 'Data Nascita', 'Classe', 'Sezione', 'Indirizzo'].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validationResults.validData.map((student, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{student.nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.cognome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.sesso}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.data_nascita}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.classe}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.sezione}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{student.indirizzo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Importa Studenti
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            {activeStep === 'upload' && (
              <>
                <div 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-500"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Trascina qui il file Excel o clicca per selezionarlo
                  </p>
                  <input
                    id="fileInput"
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center justify-center mt-4">
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <Download className="h-5 w-5" />
                    Scarica Template
                  </button>
                </div>

                {renderValidationStatus()}
              </>
            )}

            {activeStep === 'preview' && (
              <>
                {renderPreview()}
                <div className="mt-4 flex justify-end gap-4">
                  <button
                    onClick={() => setActiveStep('upload')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
                  >
                    Indietro
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Importa
                  </button>
                </div>
              </>
            )}

            {activeStep === 'complete' && (
              <div className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Importazione completata!
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {validationResults.validData.length} studenti sono stati importati con successo.
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ImportStudentsModal;