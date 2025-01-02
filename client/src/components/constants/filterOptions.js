// client/src/constants/filterOptions.js
export const FILTER_OPTIONS = {
  years: [
    { id: '1', name: '1° Anno', value: 1 },
    { id: '2', name: '2° Anno', value: 2 },
    { id: '3', name: '3° Anno', value: 3 },
    { id: '4', name: '4° Anno', value: 4 },
    { id: '5', name: '5° Anno', value: 5 }
  ],
  sections: [
    { id: 'A', name: 'Sezione A', value: 'A' },
    { id: 'B', name: 'Sezione B', value: 'B' },
    { id: 'C', name: 'Sezione C', value: 'C' },
    { id: 'D', name: 'Sezione D', value: 'D' }
  ],
  institutionTypes: [
    { id: 'scientific', name: 'Scientifico', value: 'scientific' },
    { id: 'classical', name: 'Classico', value: 'classical' },
    { id: 'linguistic', name: 'Linguistico', value: 'linguistic' }
  ],
  // Aggiungiamo anche i sort options
  sortOptions: [
    { id: 'firstName', name: 'Nome', value: 'firstName' },
    { id: 'lastName', name: 'Cognome', value: 'lastName' },
    { id: 'section', name: 'Sezione', value: 'section' },
    { id: 'year', name: 'Anno', value: 'year' }
  ]
};

// Aggiungiamo anche delle funzioni helper
export const getFilterLabel = (type, value) => {
  const option = FILTER_OPTIONS[type]?.find(opt => opt.value === value);
  return option?.name || value;
};

export const isValidFilter = (type, value) => {
  return FILTER_OPTIONS[type]?.some(opt => opt.value === value) || false;
};