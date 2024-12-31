import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
} from '@chakra-ui/react';
import * as ExcelJS from 'exceljs';

const validateExcelFile = async (file, schoolConfig) => {
  const workbook = new ExcelJS.Workbook();
  const validData = [];
  const errors = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);
    
    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('Foglio di lavoro non trovato nel file Excel');
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      try {
        const studentData = {
          name: row.getCell(1).text.trim(),
          surname: row.getCell(2).text.trim(),
          birthDate: row.getCell(3).text.trim(),
          fiscalCode: row.getCell(4).text.trim(),
          class: row.getCell(5).text.trim(),
          section: row.getCell(6).text.trim(),
        };

        // Validazione dei dati
        if (!studentData.name) {
          errors.push(`Riga ${rowNumber}: Nome mancante`);
          return;
        }
        if (!studentData.surname) {
          errors.push(`Riga ${rowNumber}: Cognome mancante`);
          return;
        }
        if (!studentData.fiscalCode || studentData.fiscalCode.length !== 16) {
          errors.push(`Riga ${rowNumber}: Codice fiscale non valido`);
          return;
        }
        if (!studentData.class) {
          errors.push(`Riga ${rowNumber}: Classe mancante`);
          return;
        }
        if (!studentData.section) {
          errors.push(`Riga ${rowNumber}: Sezione mancante`);
          return;
        }

        // Verifica che la classe e sezione siano valide secondo la configurazione della scuola
        if (schoolConfig && schoolConfig.classes) {
          const classConfig = schoolConfig.classes.find(
            c => c.name === studentData.class && c.section === studentData.section
          );
          
          if (!classConfig) {
            errors.push(`Riga ${rowNumber}: Combinazione classe/sezione non valida`);
            return;
          }
        }

        validData.push(studentData);
      } catch (error) {
        errors.push(`Errore nella riga ${rowNumber}: ${error.message}`);
      }
    });

    return { validData, errors };
  } catch (error) {
    throw new Error(`Errore nella lettura del file Excel: ${error.message}`);
  }
};

const ImportStudentsModal = ({ isOpen, onClose, schoolConfig }) => {
  const [file, setFile] = useState(null);
  const [validatedData, setValidatedData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [notification, setNotification] = useState(null);

  const showNotification = (title, description, status) => {
    setNotification({ title, description, status });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    try {
      const result = await validateExcelFile(selectedFile, schoolConfig);
      console.log("Risultato validazione:", result);
      
      setValidatedData(result.validData);
      setErrors(result.errors);

      if (result.validData.length > 0) {
        showNotification(
          "Success",
          `Trovati ${result.validData.length} studenti validi`,
          'success'
        );
      }
    } catch (error) {
      setErrors([error.message]);
      showNotification("Error", error.message, 'error');
    }
  };

  const handleImport = async () => {
    if (!validatedData || validatedData.length === 0) {
      showNotification("Error", "Nessun dato valido da importare", 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token di autenticazione non trovato');
      }

      const response = await fetch('http://localhost:5000/api/students/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(validatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Errore del server: ${response.status}`);
      }

      showNotification("Success", "Studenti importati correttamente", 'success');
      onClose();
    } catch (error) {
      console.error("Errore:", error);
      setErrors([error.message]);
      showNotification("Error", error.message, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      backgroundColor="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={1000}
    >
      <Box
        backgroundColor="white"
        padding={6}
        borderRadius="md"
        maxWidth="500px"
        width="90%"
      >
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Importa Studenti da Excel
        </Text>

        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          style={{ marginBottom: '1rem' }}
        />

        {notification && (
          <Box
            mt={4}
            p={3}
            borderRadius="md"
            backgroundColor={notification.status === 'success' ? 'green.100' : 'red.100'}
          >
            <Text fontWeight="bold" color={notification.status === 'success' ? 'green.600' : 'red.600'}>
              {notification.title}
            </Text>
            <Text color={notification.status === 'success' ? 'green.600' : 'red.600'}>
              {notification.description}
            </Text>
          </Box>
        )}

        {errors.length > 0 && (
          <Box mt={4}>
            <Text color="red.500" fontWeight="bold">Errori di validazione:</Text>
            {errors.map((error, index) => (
              <Text key={index} color="red.500">{error}</Text>
            ))}
          </Box>
        )}

        {validatedData && validatedData.length > 0 && (
          <Box mt={4}>
            <Text color="green.500" fontWeight="bold">
              Studenti validi trovati: {validatedData.length}
            </Text>
          </Box>
        )}

        <Box display="flex" justifyContent="flex-end" mt={6}>
          <Button 
            colorScheme="blue" 
            mr={3} 
            onClick={handleImport}
            isDisabled={!validatedData || validatedData.length === 0}
          >
            Inserisci Studenti
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
          >
            Annulla
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ImportStudentsModal;