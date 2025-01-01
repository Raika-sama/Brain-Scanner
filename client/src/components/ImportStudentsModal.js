import React, { useState } from 'react';
import { Card } from "./ui/card";
import { Upload, FileX, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import * as XLSX from 'xlsx';
import ImportPreviewModal from './ImportPreviewModal';

const ImportStudentsModal = ({ isOpen, onClose, onSuccess, schoolConfig }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'preview'
  const [validatedData, setValidatedData] = useState(null);
  const [errors, setErrors] = useState([]);

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
      'classe',
      'sezione',
      'dataNascita',
      'codiceFiscale',
      'sesso'
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

      // Validazione classe e sezione
      if (!row.classe?.trim()) rowErrors.push('Classe mancante');
      if (!row.sezione?.trim()) rowErrors.push('Sezione mancante');

      // Validazione codice fiscale
      if (!row.codiceFiscale?.trim()) {
        rowErrors.push('Codice fiscale mancante');
      } else if (!/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i.test(row.codiceFiscale)) {
        rowErrors.push('Formato codice fiscale non valido');
      }

      // Validazione data di nascita
      if (!row.dataNascita) {
        rowErrors.push('Data di nascita mancante');
      } else {
        const date = new Date(row.dataNascita);
        if (isNaN(date.getTime())) {
          rowErrors.push('Data di nascita non valida');
        }
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
          codiceFiscale: row.codiceFiscale.toUpperCase(),
          dataNascita: new Date(row.dataNascita)
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
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });

        // Validazione dei dati
        const { errors, validatedRows } = validateExcelData(jsonData);
        
        setErrors(errors);
        if (errors.length === 0) {
          setValidatedData(validatedRows);
          setCurrentStep('preview');
          toast.success('File caricato con successo');
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

  // Gestione della conferma dell'importazione
  const handleConfirmImport = async () => {
    if (!validatedData) return;

    try {
      setIsLoading(true);
      
      // Qui andrà la chiamata API per l'importazione
      // await importStudents(validatedData);
      
      toast.success('Importazione completata con successo');
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error('Errore durante l\'importazione');
    } finally {
      setIsLoading(false);
    }
  };

  // Template di esempio
  const downloadTemplate = () => {
    const template = XLSX.utils.book_new();
    const data = [
      {
        nome: 'Mario',
        cognome: 'Rossi',
        classe: '1',
        sezione: 'A',
        dataNascita: '2000-01-01',
        codiceFiscale: 'RSSMRA00A01H501R',
        sesso: 'M'
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(template, ws, 'Template');
    XLSX.writeFile(template, 'template_studenti.xlsx');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-2xl mx-4">
        {currentStep === 'upload' ? (
          <Card className="bg-white p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Importa Studenti
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FileX className="w-6 h-6" />
              </button>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-sm text-gray-600">
                    Trascina qui il file Excel o
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    clicca per selezionare
                  </span>
                </label>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileSpreadsheet className="w-6 h-6 text-green-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
              </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <div className="flex items-start mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold text-red-700">
                    Errori trovati nel file:
                  </span>
                </div>
                <ul className="text-sm text-red-600 ml-7 list-disc">
                  {errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li>...e altri {errors.length - 5} errori</li>
                  )}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={downloadTemplate}
                className="text-sm text-blue-600 hover:text-blue-700"
                disabled={isLoading}
              >
                Scarica template
              </button>
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
          />
        )}
      </div>
    </div>
  );
};

export default ImportStudentsModal;