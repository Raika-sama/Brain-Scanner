import ExcelJS from 'exceljs';  // oppure const ExcelJS = require('exceljs');

// Helper functions
const isValidDate = (dateString) => {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return false;
  }

  const [day, month, year] = dateString.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  return date.getDate() === day &&
         date.getMonth() === month - 1 &&
         date.getFullYear() === year &&
         date.getFullYear() >= 1900 &&
         date.getFullYear() <= new Date().getFullYear();
};

const normalizeStudentData = (row) => {
  return {
    nome: (row.Nome || '').trim(),
    cognome: (row.Cognome || '').trim(),
    sesso: (row.Sesso || '').toString().toUpperCase().trim(),
    data_nascita: (row['Data di Nascita'] || '').trim(),
    classe: parseInt(row.Classe || '0'),
    sezione: (row.Sezione || '').toString().toUpperCase().trim(),
    indirizzo: (row.Indirizzo || '').trim()
  };
};

const validateRow = (row, schoolConfig, rowIndex) => {
  const errors = [];
  const { tipo_istituto, sezioni_disponibili } = schoolConfig;

  // Verifica se la riga è vuota
  const isEmptyRow = !row || Object.values(row).every(value => 
    !value || value.toString().trim() === ''
  );
  
  if (isEmptyRow) {
    return [];
  }

  const maxClasse = tipo_istituto === 'primo_grado' ? 3 : 5;

  if (!row.Nome || row.Nome.toString().trim() === '') {
    errors.push(`Riga ${rowIndex}: Nome mancante o non valido`);
  }

  if (!row.Cognome || row.Cognome.toString().trim() === '') {
    errors.push(`Riga ${rowIndex}: Cognome mancante o non valido`);
  }

  const sesso = row.Sesso ? row.Sesso.toString().toUpperCase().trim() : '';
  if (!sesso || !['M', 'F'].includes(sesso)) {
    errors.push(`Riga ${rowIndex}: Sesso non valido (deve essere M o F)`);
  }

  if (!row['Data di Nascita'] || !isValidDate(row['Data di Nascita'].toString())) {
    errors.push(`Riga ${rowIndex}: Data di nascita non valida (formato: GG/MM/AAAA)`);
  }

  const classe = parseInt(row.Classe || '0');
  if (isNaN(classe) || classe < 1 || classe > maxClasse) {
    errors.push(`Riga ${rowIndex}: Classe non valida (deve essere tra 1 e ${maxClasse})`);
  }

  const sezione = row.Sezione ? row.Sezione.toString().toUpperCase().trim() : '';
  if (!sezione || !sezioni_disponibili.includes(sezione)) {
    errors.push(`Riga ${rowIndex}: Sezione non valida (deve essere una tra: ${sezioni_disponibili.join(', ')})`);
  }

  return errors;
};

export const validateExcelFile = async (file, schoolConfig) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(e.target.result);

        const worksheet = workbook.getWorksheet('Studenti');
        if (!worksheet) {
          throw new Error('Il file non contiene il foglio "Studenti"');
        }

        console.log("Numero di righe nel foglio:", worksheet.rowCount);
        
        const errors = [];
        const validData = [];

        // Inizia dalla riga 2 (dopo l'intestazione)
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          
          // Log per debug
          console.log(`\nProcessing Row ${rowNumber}:`);
          console.log('Nome:', row.getCell(1).value);
          console.log('Cognome:', row.getCell(2).value);
          console.log('Sesso:', row.getCell(3).value);
          console.log('Data di Nascita:', row.getCell(4).value);
          console.log('Classe:', row.getCell(5).value);
          console.log('Sezione:', row.getCell(6).value);

          const rowData = {
            Nome: row.getCell(1).value || '',
            Cognome: row.getCell(2).value || '',
            Sesso: row.getCell(3).value || '',
            'Data di Nascita': row.getCell(4).value || '',
            Classe: row.getCell(5).value || '',
            Sezione: row.getCell(6).value || '',
            Indirizzo: row.getCell(7).value || ''
          };

          // Verifica se la riga è vuota
          const hasData = Object.values(rowData).some(val => 
            val && val.toString().trim() !== ''
          );

          if (hasData) {
            const rowErrors = validateRow(rowData, schoolConfig, rowNumber);
            if (rowErrors.length === 0) {
              validData.push(normalizeStudentData(rowData));
            } else {
              errors.push(...rowErrors);
            }
          }
        }

        resolve({
          errors,
          validData,
          totalRows: worksheet.rowCount - 1,
          validRows: validData.length
        });

      } catch (error) {
        console.error('Error details:', error);
        reject(new Error(`Errore durante la lettura del file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    reader.readAsArrayBuffer(file);
  });
};