import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Dialog } from '@headlessui/react';
import { X, Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { downloadTemplate } from '../utils/createStudentTemplate';
import { validateExcelFile } from '../utils/excelValidation';

const ImportStudentsModal = ({ isOpen, onClose }) => {
  // Stati per gestire il processo di import
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [activeStep, setActiveStep] = useState('upload'); // 'upload', 'preview', 'complete'

  /**
   * Gestisce il caricamento del file
   * @param {File[]} acceptedFiles - Array di file caricati
   */
  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    setIsValidating(true);
    setValidationResults(null);
    setActiveStep('upload');

    try {
      // Valida il file Excel
      const results = await validateExcelFile(acceptedFiles[0]);
      setValidationResults(results);
      
      // Se non ci sono errori, passa alla preview
      if (results.errors.length === 0) {
        setActiveStep('preview');
      }
    } catch (error) {
      setValidationResults({
        errors: [error.toString()],
        validData: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    onDrop
  });

  /**
   * Gestisce l'importazione finale dei dati
   */
  const handleImport = async () => {
    if (!validationResults?.validData) return;

    try {
      // Chiamata API al backend
      const response = await fetch('/api/students/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: validationResults.validData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Errore durante l\'importazione');
      }

      // Se tutto va bene, procediamo al completamento
      setActiveStep('complete');
      
      // Opzionale: aggiorna la lista degli studenti nel componente padre
      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      setValidationResults(prev => ({
        ...prev,
        errors: [...(prev.errors || []), 'Errore durante il salvataggio: ' + error.toString()]
      }));
    }
};

  /**
   * Resetta lo stato del modale
   */
  const handleReset = () => {
    setValidationResults(null);
    setActiveStep('upload');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-lg">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-xl font-semibold">
                Importa Studenti
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className={`flex items-center ${activeStep === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className="w-8 h-8 flex items-center justify-center border-2 rounded-full">1</span>
                <span className="ml-2">Carica</span>
              </div>
              <div className="w-16 h-1 mx-2 bg-gray-200" />
              <div className={`flex items-center ${activeStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className="w-8 h-8 flex items-center justify-center border-2 rounded-full">2</span>
                <span className="ml-2">Verifica</span>
              </div>
              <div className="w-16 h-1 mx-2 bg-gray-200" />
              <div className={`flex items-center ${activeStep === 'complete' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className="w-8 h-8 flex items-center justify-center border-2 rounded-full">3</span>
                <span className="ml-2">Completa</span>
              </div>
            </div>

            {/* Content */}
            {activeStep === 'upload' && (
              <>
                {/* Template Download Section */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">
                    Prima di iniziare
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Scarica il template Excel e compilalo con i dati degli studenti.
                  </p>
                  <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Scarica Template
                  </button>
                </div>

                {/* Upload Section */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <input {...getInputProps()} />
                  <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                  {isValidating ? (
                    <p className="text-blue-500">Validazione in corso...</p>
                  ) : isDragActive ? (
                    <p className="text-blue-500">Rilascia qui il file...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-1">
                        Trascina qui il file Excel compilato
                      </p>
                      <p className="text-sm text-gray-500">
                        oppure <span className="text-blue-500">clicca per selezionarlo</span>
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Solo file .xlsx
                  </p>
                </div>

                {/* Validation Errors */}
                {validationResults?.errors && validationResults.errors.length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-medium">Errori di validazione</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-700">
                      {validationResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {/* Preview Step */}
            {activeStep === 'preview' && validationResults?.validData && (
              <div className="mt-4">
                <h3 className="font-medium mb-4">Anteprima dati ({validationResults.validData.length} studenti)</h3>
                <div className="max-h-96 overflow-y-auto">
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
                          Sesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data di Nascita
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Classe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sezione
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validationResults.validData.map((student, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.nome}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.cognome}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.sesso}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.dataNascita}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.classe}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.sezione}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleImport}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Importa {validationResults.validData.length} studenti
                  </button>
                </div>
              </div>
            )}

            {/* Complete Step */}
            {activeStep === 'complete' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Importazione completata con successo!
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Sono stati importati {validationResults.validData.length} studenti.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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