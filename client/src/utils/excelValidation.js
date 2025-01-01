import ExcelJS from 'exceljs';

const validateStudentData = (row, schoolConfig, rowIndex) => {
  const errors = [];
  
  // Funzioni helper per validazione
  const isValidName = (name) => name && name.toString().trim().length >= 2;
  const isValidGender = (gender) => gender && ['M', 'F'].includes(gender.toString().toUpperCase());
  const isValidClass = (classNum) => {
    const num = parseInt(classNum);
    const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
    return !isNaN(num) && num >= 1 && num <= maxClass;
  };
  const isValidSection = (section) => 
    section && schoolConfig.sezioni_disponibili.includes(section.toString().toUpperCase());

  // Validazione Nome
  if (!isValidName(row.Nome)) {
    errors.push(`Riga ${rowIndex}: Nome mancante o non valido (minimo 2 caratteri)`);
  }

  // Validazione Cognome
  if (!isValidName(row.Cognome)) {
    errors.push(`Riga ${rowIndex}: Cognome mancante o non valido (minimo 2 caratteri)`);
  }

  // Validazione Sesso
  if (!isValidGender(row.Sesso)) {
    errors.push(`Riga ${rowIndex}: Sesso non valido (deve essere M o F)`);
  }

  // Validazione Classe
  if (!isValidClass(row.Classe)) {
    const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
    errors.push(`Riga ${rowIndex}: Classe non valida (deve essere un numero da 1 a ${maxClass})`);
  }

  // Validazione Sezione
  if (!isValidSection(row.Sezione)) {
    errors.push(`Riga ${rowIndex}: Sezione non valida (deve essere una tra: ${schoolConfig.sezioni_disponibili.join(', ')})`);
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

        const errors = [];
        const validData = [];
        const studentsByClass = {};

        // Verifica intestazioni
        const requiredHeaders = ['Nome', 'Cognome', 'Sesso', 'Classe', 'Sezione'];
        const headers = worksheet.getRow(1).values.slice(1); // Ignora la prima cella vuota
        const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
        
        if (missingHeaders.length > 0) {
          throw new Error(`Colonne mancanti: ${missingHeaders.join(', ')}`);
        }

        // Processa le righe
        for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
          const row = worksheet.getRow(rowNumber);
          const rowData = {
            Nome: row.getCell(1).value,
            Cognome: row.getCell(2).value,
            Sesso: row.getCell(3).value,
            Classe: row.getCell(4).value,
            Sezione: row.getCell(5).value,
            Note: row.getCell(6).value || ''
          };

          // Verifica se la riga è vuota
          const hasData = Object.values(rowData).some(val => 
            val && val.toString().trim() !== ''
          );

          if (hasData) {
            const rowErrors = validateStudentData(rowData, schoolConfig, rowNumber);
            
            if (rowErrors.length === 0) {
              const normalizedData = {
                nome: rowData.Nome.toString().trim(),
                cognome: rowData.Cognome.toString().trim(),
                sesso: rowData.Sesso.toString().toUpperCase(),
                classe: rowData.Classe.toString(),
                sezione: rowData.Sezione.toString().toUpperCase(),
                note: rowData.Note?.toString().trim() || ''
              };

              // Raggruppa per classe
              const classKey = `${normalizedData.classe}${normalizedData.sezione}`;
              if (!studentsByClass[classKey]) {
                studentsByClass[classKey] = [];
              }
              studentsByClass[classKey].push(normalizedData);
              validData.push(normalizedData);
            } else {
              errors.push(...rowErrors);
            }
          }
        }

        resolve({
          errors,
          validData,
          studentsByClass,
          totalRows: worksheet.rowCount - 1,
          validRows: validData.length
        });

      } catch (error) {
        reject(new Error(`Errore durante la lettura del file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    reader.readAsArrayBuffer(file);
  });
};