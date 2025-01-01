import React, { useState } from 'react';
import { Card } from "./ui/card";
import { Upload, FileX, FileSpreadsheet, AlertTriangle, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ImportPreviewModal from './ImportPreviewModal';
import axios from 'axios';  // <- Aggiungi questa riga
import { downloadTemplate } from '../utils/excelTemplate';

const ImportStudentsModal = ({ isOpen, onClose, onSuccess, schoolConfig }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'preview'
  const [validatedData, setValidatedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const user = JSON.parse(localStorage.getItem('userData')); // Otteniamo l'utente autenticato
        console.log('User data in ImportStudentsModal:', {
            userId: user._id,
            scuola: user.school,
            ruolo: user.ruolo,
            nome: user.nome,
            cognome: user.cognome
        });

  const importStudents = async (data) => {
    try {
      const response = await axios.post('/api/students/import', data, {
        headers: {
          'Content-Type': 'application/json',
          // Il token viene gestito automaticamente da axios se configurato
        }
      });
      return response.data;
    } catch (error) {
      // Gestiamo i diversi tipi di errore
      if (error.response) {
        // Il server ha risposto con un errore
        throw new Error(error.response.data.message || 'Errore durante l\'importazione');
      } else if (error.request) {
        // La richiesta è stata fatta ma non c'è stata risposta
        throw new Error('Nessuna risposta dal server');
      } else {
        // Errore nella configurazione della richiesta
        throw new Error('Errore nella richiesta');
      }
    }
  };

    // Aggiungi handleConfirmImport qui
    const handleConfirmImport = async () => {
        if (!validatedData || validatedData.length === 0) {
        toast.error('Nessun dato da importare');
        return;
        }

        setIsLoading(true);
        
        try {
        // Prepariamo i dati per l'invio
        const importData = {
            students: validatedData,
            schoolId: user.school,
            teacherId: user._id
        };

        // Chiamiamo la funzione di import
        const result = await importStudents(importData);

        // Gestione successo
        toast.success(`Importati con successo ${result.imported} studenti`);
        
        // Chiudiamo il modale e resettiamo lo stato
        handleClose();
        
        // Chiamiamo la callback di successo per aggiornare la lista
        onSuccess?.();

        } catch (error) {
        // Gestione errori specifica
        if (error.message.includes('già presenti')) {
            toast.error('Alcuni studenti sono già presenti nel sistema');
        } else if (error.message.includes('autorizzazione')) {
            toast.error('Non hai i permessi per importare studenti');
        } else {
            toast.error(`Errore durante l'importazione: ${error.message}`);
        }
        } finally {
        setIsLoading(false);
        }
    };



  // Reset dello stato quando il modal viene chiuso
  const handleClose = () => {
    setFile(null);
    setIsLoading(false);
    setCurrentStep('upload');
    setValidatedData(null);
    setErrors([]);
    onClose();
  };

  // Validazione base dei dati Excel
  const validateExcelData = (data) => {
    const errors = [];
    const validatedRows = [];

    // Verifica che ci siano le colonne necessarie
    const requiredColumns = [
      'nome',
      'cognome',
      'sesso',
      'classe',
      'sezione'
    ];

    const headers = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));

    if (missingColumns.length > 0) {
      errors.push(`Colonne mancanti: ${missingColumns.join(', ')}`);
      return { errors, validatedRows: [] };
    }

    // Validazione riga per riga
    data.forEach((row, index) => {
      const rowErrors = [];

      // Validazione nome e cognome
      if (!row.nome?.trim()) rowErrors.push('Nome mancante');
      if (!row.cognome?.trim()) rowErrors.push('Cognome mancante');

      // Validazione classe
      const classNum = parseInt(row.classe);
      const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
      if (!classNum || classNum < 1 || classNum > maxClass) {
        rowErrors.push(`Classe non valida (deve essere un numero da 1 a ${maxClass})`);
      }

      // Validazione sezione
      if (!schoolConfig.sezioni_disponibili.includes(row.sezione?.trim().toUpperCase())) {
        rowErrors.push(`Sezione non valida (deve essere una tra: ${schoolConfig.sezioni_disponibili.join(', ')})`);
      }

      // Validazione sesso
      if (!['M', 'F'].includes(row.sesso?.toUpperCase())) {
        rowErrors.push('Sesso non valido (deve essere M o F)');
      }

      if (rowErrors.length > 0) {
        errors.push(`Riga ${index + 2}: ${rowErrors.join(', ')}`);
      } else {
        validatedRows.push({
          ...row,
          sesso: row.sesso.toUpperCase(),
          classe: classNum.toString(),
          sezione: row.sezione.toUpperCase(),
          teachers: [user._id], // Aggiungiamo l'utente corrente come teacher
          school: user.school // Aggiungiamo la scuola dell'utente
        });
      }
    });

    return { errors, validatedRows };
  };
  // Gestione del caricamento del file
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verifica estensione del file
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(fileExt)) {
      toast.error('Per favore carica un file Excel (.xlsx o .xls)');
      return;
    }

    setFile(file);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Verifica che esista il foglio "Studenti"
        if (!workbook.SheetNames.includes('Studenti')) {
          toast.error('Il file non contiene il foglio "Studenti"');
          setIsLoading(false);
          return;
        }

        const worksheet = workbook.Sheets['Studenti'];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        if (jsonData.length === 0) {
          toast.error('Il file non contiene dati');
          setIsLoading(false);
          return;
        }

        // Validazione dei dati
        const { errors, validatedRows } = validateExcelData(jsonData);
        
        setErrors(errors);
        if (errors.length === 0) {
          setValidatedData(validatedRows);
          setCurrentStep('preview');
          toast.success(`File caricato con successo: ${validatedRows.length} studenti trovati`);
        } else {
          toast.error(`Trovati ${errors.length} errori nel file`);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Errore durante la lettura del file:', error);
      toast.error('Errore durante la lettura del file');
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per scaricare il template
  const handleDownloadTemplate = () => {
        downloadTemplate(schoolConfig);
  };
    
// Render del componente
if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
    <div className="w-full max-w-3xl">
      {currentStep === 'upload' ? (
        <Card className="bg-white shadow-xl">
          {/* Header con info utente */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Importa Studenti
              </h2>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
                disabled={isLoading}
              >
                <FileX className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-2 text-sm text-white/80">
              <p>Scuola: {schoolConfig.nome}</p>
              <p>Docente: {user.nome} {user.cognome}</p>
            </div>
          </div>

          <div className="p-6">
            {/* Area Upload */}
            <div className="mb-6">
              <div 
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center 
                  transition-colors duration-200
                  ${isLoading ? 'bg-gray-50 border-gray-300' : 'border-blue-300 hover:border-blue-400'}
                `}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-upload"
                  className={`
                    cursor-pointer flex flex-col items-center
                    ${isLoading ? 'cursor-not-allowed opacity-60' : ''}
                  `}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                  ) : (
                    <Upload className="w-12 h-12 text-blue-600 mb-4" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isLoading ? 'Elaborazione in corso...' : 'Trascina qui il file Excel o'}
                  </span>
                  <span className="text-sm font-semibold text-blue-600 mt-1">
                    {!isLoading && 'clicca per selezionare'}
                  </span>
                </label>
              </div>
            </div>

            {/* File Info */}
            {file && !isLoading && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-600">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
              </div>
            )}

            {/* Errori */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg animate-fadeIn">
                <div className="flex items-start mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-red-700">
                    Errori trovati nel file:
                  </span>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="text-sm text-red-600 ml-7 list-disc space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Informazioni Importanti:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Utilizzare il template fornito per evitare errori</li>
                    <li>Classi consentite: {schoolConfig.tipo_istituto === 'primo_grado' ? '1-3' : '1-5'}</li>
                    <li>Sezioni disponibili: {schoolConfig.sezioni_disponibili.join(', ')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica template
              </button>

              <div className="text-xs text-gray-500">
                {isLoading ? 'Elaborazione in corso...' : 'Formato supportato: .xlsx, .xls'}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <ImportPreviewModal
          isOpen={true}
          onClose={handleClose}
          onBack={() => setCurrentStep('upload')}
          onConfirm={handleConfirmImport}
          validatedData={validatedData}
          schoolConfig={schoolConfig}
          isLoading={isLoading}
        />
      )}
    </div>
  </div>
);
};

export default ImportStudentsModal;