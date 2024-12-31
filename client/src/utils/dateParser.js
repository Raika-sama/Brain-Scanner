import { parse, isValid, differenceInYears, format } from 'date-fns';

export const parseDateFromExcel = (dateStr) => {
  if (!dateStr) {
    throw new Error('Data non fornita');
  }

  // Array di possibili formati da testare
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
      const parsedDate = parse(dateStr, dateFormat, new Date());
      if (isValid(parsedDate)) {
        // Verifica che l'età sia appropriata (14-19 anni)
        const age = differenceInYears(new Date(), parsedDate);
        if (age >= 14 && age <= 19) {
          // Ritorna la data in formato ISO
          return format(parsedDate, 'yyyy-MM-dd');
        } else {
          throw new Error(`L'età dello studente (${age} anni) non è valida. Deve essere tra 14 e 19 anni.`);
        }
      }
    } catch (e) {
      continue;
    }
  }

  // Se nessun formato funziona
  throw new Error(
    'Formato data non valido. Utilizzare uno dei seguenti formati: ' +
    'YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY'
  );
};