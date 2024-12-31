import ExcelJS from 'exceljs';

export const createStudentTemplate = async (schoolConfig) => {
  // Crea un nuovo workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Brain Scanner';
  workbook.created = new Date();

  // Aggiungi un foglio di lavoro
  const worksheet = workbook.addWorksheet('Studenti');

  // Definisci le colonne
  worksheet.columns = [
    { header: 'Nome*', key: 'nome', width: 15 },
    { header: 'Cognome*', key: 'cognome', width: 15 },
    { header: 'Sesso*', key: 'sesso', width: 10 },
    { header: 'Data Nascita*', key: 'dataNascita', width: 15 },
    { header: 'Classe*', key: 'classe', width: 10 },
    { header: 'Sezione*', key: 'sezione', width: 10 },
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

  // Applica bordi alle intestazioni
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Aggiungi riga di esempio
  const exampleRow = worksheet.addRow({
    nome: 'Mario',
    cognome: 'Rossi',
    sesso: 'M',
    dataNascita: '01/01/2010',
    classe: '1',
    sezione: schoolConfig.sezioni_disponibili[0],
    indirizzo: 'Via Roma 1'
  });

  // Stile riga di esempio
  exampleRow.font = {
    italic: true,
    color: { argb: 'FF666666' }
  };

  // Validazioni
  // Sesso (M/F)
  worksheet.dataValidations.add('C2:C1000', {
    type: 'list',
    allowBlank: false,
    formulae: ['"M,F"']
  });

  // Data di nascita (formato GG/MM/AAAA)
  worksheet.dataValidations.add('D2:D1000', {
    type: 'date',
    allowBlank: false,
    formulae: [
      new Date(new Date().getFullYear() - 20, 0, 1).toISOString(), // Data minima
      new Date().toISOString() // Data massima
    ]
  });

  // Classe (1-3 o 1-5 in base al tipo_istituto)
  const maxClass = schoolConfig.tipo_istituto === 'primo_grado' ? 3 : 5;
  worksheet.dataValidations.add('E2:E1000', {
    type: 'whole',
    allowBlank: false,
    operator: 'between',
    formulae: ['1', maxClass.toString()]
  });

  // Sezione (dalle sezioni disponibili della scuola)
  const sezioniList = schoolConfig.sezioni_disponibili.join(',');
  worksheet.dataValidations.add('F2:F1000', {
    type: 'list',
    allowBlank: false,
    formulae: [`"${sezioniList}"`]
  });

  // Formatta la colonna data
  worksheet.getColumn('D').numFmt = 'dd/mm/yyyy';

  // Proteggi il foglio ma permetti la modifica delle celle dati
  await worksheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: true,
    formatColumns: true,
    formatRows: true,
    insertColumns: false,
    insertRows: true,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: true,
    sort: true,
    autoFilter: true,
    pivotTables: false
  });

  // Sblocca le celle per l'inserimento dati (dalla riga 3 in poi)
  worksheet.getRows(3, 998).forEach(row => {
    row.eachCell({ includeEmpty: true }, cell => {
      cell.protection = {
        locked: false
      };
    });
  });

  return workbook;
};

export const downloadTemplate = async (schoolConfig) => {
  const workbook = await createStudentTemplate(schoolConfig);
  const buffer = await workbook.xlsx.writeBuffer();
  
  // Crea un blob e scarica il file
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