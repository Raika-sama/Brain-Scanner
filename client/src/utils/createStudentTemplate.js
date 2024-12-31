import * as XLSX from 'xlsx';

export function createStudentTemplate() {
  // Creiamo un nuovo workbook
  const wb = XLSX.utils.book_new();
  
  // Dati di esempio e intestazioni
  const headers = [
    'Nome',
    'Cognome',
    'Sesso',
    'Data di Nascita',
    'Classe',
    'Sezione'
  ];

  const exampleData = [
    'Mario',
    'Rossi',
    'M',
    '01/01/2008',
    '1',
    'A'
  ];

  // Creiamo il foglio di lavoro
  const wsData = [
    headers,
    exampleData,
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Impostiamo la larghezza delle colonne
  const colWidths = [
    { wch: 15 }, // Nome
    { wch: 15 }, // Cognome
    { wch: 8 },  // Sesso
    { wch: 15 }, // Data di Nascita
    { wch: 8 },  // Classe
    { wch: 8 }   // Sezione
  ];

  ws['!cols'] = colWidths;

  // Aggiungiamo le validazioni
  ws['!datavalidation'] = {
    C2: { // Sesso (dalla cella C2 in giù)
      type: 'list',
      operator: 'equal',
      formula1: '"M,F"',
      showErrorMessage: true,
      error: 'Valore non valido',
      errorTitle: 'Errore',
      prompt: 'Seleziona M o F',
      promptTitle: 'Sesso'
    },
    E2: { // Classe (dalla cella E2 in giù)
      type: 'whole',
      operator: 'between',
      formula1: '1',
      formula2: '5',
      showErrorMessage: true,
      error: 'La classe deve essere tra 1 e 5',
      errorTitle: 'Errore'
    },
    F2: { // Sezione (dalla cella F2 in giù)
      type: 'custom',
      operator: 'equal',
      formula1: 'AND(CODE(UPPER(F2))>=65,CODE(UPPER(F2))<=90)',
      showErrorMessage: true,
      error: 'La sezione deve essere una lettera maiuscola',
      errorTitle: 'Errore'
    }
  };

  // Aggiungiamo stili per le intestazioni
  const headerStyle = {
    fill: { fgColor: { rgb: "CCE5FF" } },
    font: { bold: true },
    alignment: { horizontal: "center" }
  };

  // Applichiamo gli stili alle intestazioni
  for (let i = 0; i < headers.length; i++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    ws[cellRef].s = headerStyle;
  }

  // Aggiungiamo i commenti alle celle
  ws['!comments'] = {
    A1: { t: 'Inserire il nome dello studente (obbligatorio)' },
    B1: { t: 'Inserire il cognome dello studente (obbligatorio)' },
    C1: { t: 'Inserire M per maschio o F per femmina' },
    D1: { t: 'Formato: GG/MM/AAAA' },
    E1: { t: 'Inserire un numero da 1 a 5' },
    F1: { t: 'Inserire una lettera maiuscola (A-Z)' }
  };

  // Aggiungiamo il foglio al workbook
  XLSX.utils.book_append_sheet(wb, ws, "Studenti");

  // Generiamo il file
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Creiamo il Blob e scarichiamo il file
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return blob;
}

// Funzione helper per scaricare il template
export function downloadTemplate() {
  const blob = createStudentTemplate();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_studenti.xlsx';
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}