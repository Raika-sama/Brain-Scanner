import ExcelJS from 'exceljs';

export const createStudentTemplate = async (schoolConfig) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brain Scanner';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Studenti');
  
  // Definizione colonne
  worksheet.columns = [
    { header: 'Nome *', key: 'nome', width: 15 },
    { header: 'Cognome *', key: 'cognome', width: 15 },
    { header: 'Sesso *', key: 'sesso', width: 10 },
    { header: 'Classe *', key: 'classe', width: 10 },
    { header: 'Sezione *', key: 'sezione', width: 10 },
    { header: 'Note', key: 'note', width: 30 }
  ];

  // Stile intestazioni
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Validazioni fino a 1000 righe
  const LAST_ROW = 1000;

  // Sesso (M/F)
  worksheet.dataValidations.add(`C2:C${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: ['"M,F"'],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Sesso non valido',
    error: 'Inserire M o F'
  });

  // Classe (1-3 o 1-5 in base al tipo_istituto)
  const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
  const classiDisponibili = Array.from({length: maxClass}, (_, i) => (i + 1).toString());
  
  worksheet.dataValidations.add(`D2:D${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: [`"${classiDisponibili.join(',')}"`],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Classe non valida',
    error: `Inserire un numero da 1 a ${maxClass}`
  });

  // Sezione (in base alle sezioni disponibili della scuola)
  worksheet.dataValidations.add(`E2:E${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: [`"${schoolConfig.sezioni_disponibili.join(',')}"`],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Sezione non valida',
    error: `Inserire una delle sezioni disponibili: ${schoolConfig.sezioni_disponibili.join(', ')}`
  });

  // Riga di esempio
  const annoCorrente = new Date().getFullYear();
  const exampleRow = worksheet.addRow({
    nome: 'Mario',
    cognome: 'Rossi',
    sesso: 'M',
    classe: '1',
    sezione: schoolConfig.sezioni_disponibili[0],
    note: 'Esempio nota'
  });

  // Stile riga di esempio
  exampleRow.font = {
    italic: true,
    color: { argb: 'FF666666' }
  };

  // Aggiungi foglio informativo
  const infoSheet = workbook.addWorksheet('Istruzioni');
  infoSheet.addRow(['Istruzioni per l\'importazione:']);
  infoSheet.addRow(['1. Tutti i campi con * sono obbligatori']);
  infoSheet.addRow([`2. Le classi devono essere numeri da 1 a ${maxClass}`]);
  infoSheet.addRow([`3. Le sezioni disponibili sono: ${schoolConfig.sezioni_disponibili.join(', ')}`]);
  infoSheet.addRow(['4. Il sesso deve essere M o F']);
  infoSheet.addRow(['5. Non modificare la struttura del file']);

  return workbook;
};

export const downloadTemplate = async (schoolConfig) => {
  const workbook = await createStudentTemplate(schoolConfig);
  const buffer = await workbook.xlsx.writeBuffer();
  
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'template_studenti.xlsx';
  a.click();
  window.URL.revokeObjectURL(url);
};