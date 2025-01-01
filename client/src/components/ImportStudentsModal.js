import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Card } from "./ui/card";
import { downloadTemplate } from '../utils/excelTemplate';

const ImportStudentsModal = ({ isOpen, onClose, schoolConfig }) => {
  const [file, setFile] = useState(null);
  const [validatedData, setValidatedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const validateExcelData = (data) => {
    const errors = [];
    const validData = [];

    // Debug - stampa i dati grezzi
    console.log('Dati Excel grezzi:', data);

    data.forEach((row, index) => {
      const rowNumber = index + 2;
     // Debug - stampa ogni riga
     console.log(`Riga ${rowNumber}:`, row);
     
     
      // Converti la data da formato Excel a stringa
      let formattedDate = row.dataNascita;
      if (typeof row.dataNascita === 'number') {
        // Converti il numero seriale Excel in data
        const date = new Date((row.dataNascita - 25569) * 86400 * 1000);
        formattedDate = date.toLocaleDateString('it-IT');
      }

      const student = {
        nome: row['Nome']?.toString().trim(),        // Prova con Nome invece di nome
        cognome: row['Cognome']?.toString().trim(),  // Prova con Cognome invece di cognome
        sesso: row['Sesso']?.toString().trim().toUpperCase(),
        dataNascita: formattedDate,
        classe: row['Classe']?.toString(),
        sezione: row['Sezione']?.toString().trim().toUpperCase(),
        school: schoolConfig._id
      };

      // Debug - stampa l'oggetto student
      console.log(`Student oggetto riga ${rowNumber}:`, student);

      // Validazione campi obbligatori
      if (!student.nome) {
        console.log(`Nome mancante nella riga ${rowNumber}. Valore ricevuto:`, row['Nome']);
        errors.push(`Riga ${rowNumber}: Nome mancante`);
        return;
      }
      if (!student.cognome) {
        errors.push(`Riga ${rowNumber}: Cognome mancante`);
        return;
      }
      if (!student.sesso || !['M', 'F'].includes(student.sesso)) {
        errors.push(`Riga ${rowNumber}: Sesso non valido (deve essere M o F)`);
        return;
      }
      if (!student.dataNascita) {
        errors.push(`Riga ${rowNumber}: Data di nascita mancante`);
        return;
      }
      if (!student.classe) {
        errors.push(`Riga ${rowNumber}: Classe mancante`);
        return;
      }
      if (!student.sezione) {
        errors.push(`Riga ${rowNumber}: Sezione mancante`);
        return;
      }

      // Validazione classe in base al tipo di istituto
      const maxClasse = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
      const classeNum = parseInt(student.classe);
      if (isNaN(classeNum) || classeNum < 1 || classeNum > maxClasse) {
        errors.push(`Riga ${rowNumber}: Classe non valida (deve essere tra 1 e ${maxClasse})`);
        return;
      }

      // Validazione sezione
      if (!schoolConfig.sezioni_disponibili.includes(student.sezione)) {
        errors.push(`Riga ${rowNumber}: Sezione non valida (deve essere una tra: ${schoolConfig.sezioni_disponibili.join(', ')})`);
        return;
      }

      // Se tutte le validazioni passano, aggiungi lo studente ai dati validi
      validData.push({
        ...student,
        school: schoolConfig._id // Aggiungi il riferimento alla scuola
      });
    });

    return { validData, errors };
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessing(true);
    setErrors([]);
    setValidatedData(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, {
            header: 'A',  // usa le lettere come intestazioni temporanee
            range: 1,     // inizia dalla seconda riga
            raw: false,   // non convertire i valori
            defval: ''    // valore di default per celle vuote
          });
          console.log('Intestazioni foglio:', Object.keys(worksheet));
          console.log('Prima riga dati:', data[0]);

          const { validData, errors } = validateExcelData(data);
          setValidatedData(validData);
          setErrors(errors);

          if (validData.length > 0) {
            toast.success(`Trovati ${validData.length} studenti validi`);
          }
          if (errors.length > 0) {
            toast.error(`Trovati ${errors.length} errori`);
          }
        } catch (error) {
          console.error('Errore durante la lettura del file:', error);
          setErrors(['Errore durante la lettura del file Excel']);
          toast.error('Errore durante la lettura del file');
        }
      };
      reader.readAsArrayBuffer(selectedFile);
    } catch (error) {
      console.error('Errore durante il processo di validazione:', error);
      setErrors(['Errore durante il processo di validazione']);
      toast.error('Errore durante la validazione');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!validatedData || validatedData.length === 0) {
      toast.error('Nessun dato valido da importare');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/students/batch', {
        students: validatedData
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onClose();
      } else {
        toast.error(response.data.message || 'Errore durante l\'importazione');
      }
    } catch (error) {
      console.error('Errore durante l\'importazione:', error);
      toast.error(error.response?.data?.message || 'Errore durante l\'importazione');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadTemplate(schoolConfig);
};

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg bg-white p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Importa Studenti da Excel</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template download */}
        <button
        onClick={handleDownloadTemplate}  // invece di downloadTemplate
        className="text-blue-600 hover:text-blue-800 text-sm underline"
    >
        Scarica template Excel
    </button>

        {/* Upload area */}
        <div className="mb-6">
          <label className="flex flex-col items-center px-4 py-6 border-2 border-dashed rounded-lg hover:bg-gray-50 cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              {file ? file.name : "Seleziona file Excel"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Validation results */}
        {errors.length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold text-red-600 mb-2">Errori di validazione:</h3>
            <ul className="list-disc list-inside text-red-600 text-sm max-h-40 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {validatedData && validatedData.length > 0 && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
            Studenti validi trovati: {validatedData.length}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isProcessing}
          >
            Annulla
          </button>
          <button 
            onClick={handleImport}
            disabled={!validatedData || validatedData.length === 0 || isProcessing}
            className={`px-4 py-2 rounded-lg ${
              validatedData && validatedData.length > 0 && !isProcessing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Importazione...' : 'Importa Studenti'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ImportStudentsModal;