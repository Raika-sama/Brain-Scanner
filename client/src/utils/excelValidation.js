import * as XLSX from 'xlsx';

/**
 * Configurazione delle colonne del template Excel
 */
const TEMPLATE_CONFIG = {
  columns: [
    { header: 'Nome', key: 'nome', width: 15, required: true },
    { header: 'Cognome', key: 'cognome', width: 15, required: true },
    { header: 'Sesso', key: 'sesso', width: 10, required: true, 
      validation: { type: 'list', values: ['M', 'F'] }},
    { header: 'Data di Nascita', key: 'data_nascita', width: 15, required: true,
      validation: { type: 'date' }},
    { header: 'Classe', key: 'classe', width: 10, required: true },
    { header: 'Sezione', key: 'sezione', width: 10, required: true },
    { header: 'Codice Fiscale', key: 'codice_fiscale', width: 20, required: false },
    { header: 'Indirizzo', key: 'indirizzo', width: 30, required: false }
  ]
};

/**
 * Crea un template Excel con validazioni
 * @param {Object} schoolConfig - Configurazione della scuola
 * @returns {Workbook} Workbook XLSX
 */
export const createTemplate = (schoolConfig) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    TEMPLATE_CONFIG.columns.map(col => col.header)
  ]);

  // Imposta le larghezze delle colonne
  const cols = TEMPLATE_CONFIG.columns.map(col => ({ wch: col.width }));
  worksheet['!cols'] = cols;

  // Aggiungi riga di esempio
  const exampleRow = {
    Nome: 'Mario',
    Cognome: 'Rossi',
    Sesso: 'M',
    'Data di Nascita': '01/01/2000',
    Classe: '1',
    Sezione: schoolConfig.sezioni_disponibili[0],
    'Codice Fiscale': 'RSSMRA00A01H501R',
    Indirizzo: 'Via Roma 1'
  };

  XLSX.utils.sheet_add_json(worksheet, [exampleRow], { 
    skipHeader: true, 
    origin: 'A2' 
  });

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Studenti');
  return workbook;
};

/**
 * Converte una colonna Excel (A, B, C...) in indice numerico (0, 1, 2...)
 */
const col2num = (col) => {
  let num = 0;
  for (let i = 0; i < col.length; i++) {
    num = num * 26 + col.charCodeAt(i) - 64;
  }
  return num - 1;
};

/**
 * Legge e valida i dati dal file Excel
 */
export const validateExcelFile = async (file, schoolConfig) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        console.log('Inizio lettura file');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('Fogli nel workbook:', workbook.SheetNames);
        
        if (!workbook.SheetNames.includes('Studenti')) {
          throw new Error('Il file non contiene il foglio "Studenti"');
        }

        const worksheet = workbook.Sheets['Studenti'];
        console.log('Struttura worksheet:', worksheet);

        // Converti il foglio in array di oggetti mantenendo i tipi di dato
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: 'DD/MM/YYYY',
          defval: ''
        });

        console.log('Righe lette:', rows);

        const errors = [];
        const validData = [];

        // Valida ogni riga
        rows.forEach((row, idx) => {
          // Salta la prima riga (è l'esempio)
          if (idx === 0) return;

          const rowErrors = validateRow(row, schoolConfig, idx + 2);
          
          if (rowErrors.length === 0) {
            validData.push(normalizeStudentData(row, schoolConfig));
          } else {
            errors.push(...rowErrors);
          }
        });

        resolve({
          errors,
          validData,
          totalRows: rows.length - 1, // Escludi riga esempio
          validRows: validData.length
        });

      } catch (error) {
        console.error('Errore durante la validazione:', error);
        reject(new Error(`Errore durante la lettura del file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Valida una singola riga di dati
 */
const validateRow = (row, schoolConfig, rowIndex) => {
  const errors = [];

  // Log dei dati in ingresso per debug
  console.log(`Validazione riga ${rowIndex}:`, row);

  // Validazione Nome
  if (!row.Nome || typeof row.Nome !== 'string' || row.Nome.trim().length === 0) {
    errors.push(`Riga ${rowIndex}: Nome mancante o non valido`);
  }

  // Validazione Cognome
  if (!row.Cognome || typeof row.Cognome !== 'string' || row.Cognome.trim().length === 0) {
    errors.push(`Riga ${rowIndex}: Cognome mancante o non valido`);
  }

  // Validazione Sesso
  if (!row.Sesso || !['M', 'F'].includes(row.Sesso.toUpperCase())) {
    errors.push(`Riga ${rowIndex}: Sesso non valido (deve essere M o F)`);
  }

  // Validazione Data di Nascita
  if (!row['Data di Nascita'] || !isValidDate(row['Data di Nascita'])) {
    errors.push(`Riga ${rowIndex}: Data di nascita non valida (formato: GG/MM/AAAA)`);
  }

  // Validazione Classe
  const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
  const classe = parseInt(row.Classe);
  if (isNaN(classe) || classe < 1 || classe > maxClass) {
    errors.push(`Riga ${rowIndex}: Classe non valida (deve essere tra 1 e ${maxClass})`);
  }

  // Validazione Sezione
  if (!row.Sezione || !schoolConfig.sezioni_disponibili.includes(row.Sezione.toUpperCase())) {
    errors.push(`Riga ${rowIndex}: Sezione non valida (deve essere una tra: ${schoolConfig.sezioni_disponibili.join(', ')})`);
  }

  // Validazione opzionale Codice Fiscale
  if (row['Codice Fiscale'] && !isValidCodiceFiscale(row['Codice Fiscale'])) {
    errors.push(`Riga ${rowIndex}: Codice fiscale non valido`);
  }

  return errors;
};

/**
 * Normalizza i dati per il salvataggio
 */
const normalizeStudentData = (row, schoolConfig) => {
  return {
    nome: row.Nome.trim(),
    cognome: row.Cognome.trim(),
    sesso: row.Sesso.toUpperCase(),
    data_nascita: formatDate(row['Data di Nascita']),
    classe: parseInt(row.Classe),
    sezione: row.Sezione.toUpperCase(),
    codice_fiscale: row['Codice Fiscale'] ? row['Codice Fiscale'].toUpperCase() : null,
    indirizzo: row.Indirizzo ? row.Indirizzo.trim() : null,
    school: schoolConfig._id
  };
};

// Funzioni di utilità riutilizzate dal tuo codice originale
const isValidDate = (dateStr) => {
  if (!dateStr) return false;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);
  return date.getDate() === day &&
         date.getMonth() === month &&
         date.getFullYear() === year &&
         year >= 1990 && 
         year <= new Date().getFullYear() - 10;
};

const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const isValidCodiceFiscale = (cf) => {
  if (!cf) return true;
  return /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(cf.toUpperCase());
};

export { TEMPLATE_CONFIG };