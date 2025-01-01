import ExcelJS from 'exceljs';

export const createStudentTemplate = async (schoolConfig) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brain Scanner';
  workbook.created = new Date();
  workbook.properties.protection = false;
  
  const worksheet = workbook.addWorksheet('Studenti', {
    protection: false // Disabilita esplicitamente la protezione del foglio
  });
  // Calcolo date per validazione età
  const currentYear = new Date().getFullYear();
  const minAge = 10;
  const maxAge = 19;
  const maxDate = new Date(currentYear - minAge, 11, 31); // 31 Dicembre dell'anno per 10 anni
  const minDate = new Date(currentYear - maxAge, 0, 1);   // 1 Gennaio dell'anno per 19 anni

  // Definizione colonne con * per campi obbligatori
  worksheet.columns = [
    { header: 'Nome', key: 'nome', width: 15 },       // Rimosso asterisco
    { header: 'Cognome', key: 'cognome', width: 15 }, // Rimosso asterisco
    { header: 'Sesso', key: 'sesso', width: 10 },
    { header: 'DataNascita', key: 'dataNascita', width: 15 }, // Rimosso spazio
    { header: 'Classe', key: 'classe', width: 10 },
    { header: 'Sezione', key: 'sezione', width: 10 },
    { header: 'Codice Fiscale', key: 'codiceFiscale', width: 20 },
    { header: 'Note', key: 'note', width: 30 },
    { header: 'Indirizzo', key: 'indirizzo', width: 30 }
];

  // Stile intestazioni
  const headerRow = worksheet.getRow(1);
  headerRow.font = {
    bold: true,
    color: { argb: 'FF000000' }
  };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Bordi e colori per campi obbligatori
  headerRow.eachCell((cell, colNumber) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    // Evidenzia campi obbligatori
    if (cell.value.toString().includes('*')) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD700' }  // Colore oro per campi obbligatori
      };
    }
  });

  // Riga di esempio
  const exampleRow = worksheet.addRow({
    nome: 'Mario',
    cognome: 'Rossi',
    sesso: 'M',
    dataNascita: '01/01/2010',
    classe: '1',
    sezione: schoolConfig.sezioni_disponibili[0],
    codiceFiscale: 'RSSMRA10A01H501X',
    note: 'Esempio nota',
    indirizzo: 'Via Roma 1'
  });

  // Stile riga di esempio
  exampleRow.font = {
    italic: true,
    color: { argb: 'FF666666' }
  };

  // Validazioni fino a 10000 righe
  const LAST_ROW = 10000;

  // Nome e Cognome come testo
  worksheet.getColumn('A').eachCell({ includeEmpty: true }, cell => {
    cell.numFmt = '@';  // Formato testo
  });
  worksheet.getColumn('B').eachCell({ includeEmpty: true }, cell => {
    cell.numFmt = '@';  // Formato testo
  });

  // Sesso (M/F)
  worksheet.dataValidations.add(`C2:C${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: ['"M,F"']
  });

  // Data di nascita (con range dinamico)
  worksheet.dataValidations.add(`D2:D${LAST_ROW}`, {
    type: 'date',
    allowBlank: false,
    formulae: [
      minDate.toISOString(),
      maxDate.toISOString()
    ],
    showErrorMessage: true,
    errorStyle: 'error',
    errorTitle: 'Data non valida',
    error: `La data deve essere compresa tra il ${minDate.toLocaleDateString()} e il ${maxDate.toLocaleDateString()}`
  });

  // Classe (1-3 o 1-5 in base al tipo_istituto)
  const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
  const classiDisponibili = Array.from({length: maxClass}, (_, i) => (i + 1).toString());
  
  worksheet.dataValidations.add(`E2:E${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: [`"${classiDisponibili.join(',')}"`]
  });

  // Sezione
  const sezioniList = schoolConfig.sezioni_disponibili.join(',');
  worksheet.dataValidations.add(`F2:F${LAST_ROW}`, {
    type: 'list',
    allowBlank: false,
    formulae: [`"${sezioniList}"`]
  });

  // Formattazione colonne
  worksheet.getColumn('D').numFmt = 'dd/mm/yyyy';  // Formato data
  worksheet.getColumn('G').numFmt = '@';           // Codice Fiscale come testo
  
  

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Salta la riga di intestazione
      row.eachCell({ includeEmpty: true }, cell => {
        cell.protection = { locked: false };
      });
    }
  });

  // Proteggi solo la riga di intestazione
  worksheet.getRow(1).eachCell(cell => {
    cell.protection = { locked: true };
  });

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