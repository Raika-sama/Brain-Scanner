import { parse, isValid, differenceInYears, format } from 'date-fns';

export const parseDateFromExcel = (dateStr) => {
  if (!dateStr) {
    throw new Error('Data non fornita');
  }

  // Se la data è un numero (Excel serial date)
  if (typeof dateStr === 'number') {
    // Convert Excel serial date to JS Date
    // Excel serial date starts from 1899-12-30 (or 1904-01-01 depending on system)
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    const parsedDate = new Date(excelEpoch.getTime() + (dateStr * msPerDay));
    
    if (isValid(parsedDate)) {
      const age = differenceInYears(new Date(), parsedDate);
      if (age >= 14 && age <= 19) {
        return format(parsedDate, 'yyyy-MM-dd');
      } else {
        throw new Error(`L'età dello studente (${age} anni) non è valida. Deve essere tra 14 e 19 anni.`);
      }
    }
  }

  // Array di possibili formati da testare per stringhe
  const formats = [
    'yyyy-MM-dd',    // ISO
    'dd/MM/yyyy',    // IT
    'MM/dd/yyyy',    // US
    'dd-MM-yyyy',    // IT con trattini
    'yyyy/MM/dd'     // ISO con slash
  ];

  // Prova ogni formato
  for (const dateFormat of formats) {
    try {
      const parsedDate = parse(dateStr.toString(), dateFormat, new Date());
      if (isValid(parsedDate)) {
        const age = differenceInYears(new Date(), parsedDate);
        if (age >= 14 && age <= 19) {
          return format(parsedDate, 'yyyy-MM-dd');
        } else {
          throw new Error(`L'età dello studente (${age} anni) non è valida. Deve essere tra 14 e 19 anni.`);
        }
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(
    'Formato data non valido. Utilizzare uno dei seguenti formati: ' +
    'YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY'
  );
};