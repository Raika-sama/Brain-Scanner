import { read, utils } from 'xlsx';
import { parseDateFromExcel } from './dateParser';

export const validateExcelFile = async (file) => {
  const errors = [];
  const validData = [];

  try {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);
    
    // Debug: stampa i dati letti
    console.log('Dati letti dall\'Excel:', jsonData);

    if (jsonData.length === 0) {
      throw new Error('Il file è vuoto o il formato non è corretto');
    }

    // Debug: stampa le chiavi della prima riga
    console.log('Colonne trovate:', Object.keys(jsonData[0]));

    jsonData.forEach((row, index) => {
      try {
        // Validazione base
        if (!row.nome || !row.cognome || !row.dataNascita || !row.sesso || !row.classe || !row.sezione) {
          throw new Error('Dati mancanti nella riga');
        }

        // Validazione specifica per ogni campo
        const student = {
          nome: row.nome.trim(),
          cognome: row.cognome.trim(),
          sesso: row.sesso.toUpperCase(),
          classe: parseInt(row.classe),
          sezione: row.sezione.toUpperCase(),
          dataNascita: parseDateFromExcel(row.dataNascita) // Usa la nuova funzione di parsing
        };

        // Validazione aggiuntiva
        if (student.nome.length < 2) throw new Error('Nome troppo corto');
        if (student.cognome.length < 2) throw new Error('Cognome troppo corto');
        if (!['M', 'F'].includes(student.sesso)) throw new Error('Sesso non valido (deve essere M o F)');
        if (student.classe < 1 || student.classe > 5) throw new Error('Classe non valida (deve essere tra 1 e 5)');
        if (!/^[A-Z]$/.test(student.sezione)) throw new Error('Sezione non valida (deve essere una lettera maiuscola)');

        validData.push(student);
      } catch (error) {
        errors.push(`Riga ${index + 2}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      return { errors, validData: [] };
    }

    return { errors: [], validData };
  } catch (error) {
    throw new Error('Errore durante la lettura del file: ' + error.message);
  }
};