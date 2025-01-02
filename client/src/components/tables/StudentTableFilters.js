// components/tables/StudentTableFilters.js
import React from 'react';
import { FILTER_OPTIONS } from '../../constants/filterOptions';

const StudentTableFilters = ({ 
  filters,
  onFilterChange,
  context = 'classes', // o 'students'
}) => {
  const showAllFilters = context === 'students';

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {/* Filtri base (sempre visibili) */}
      <Select
        label="Anno"
        options={FILTER_OPTIONS.years}
        value={filters.year}
        onChange={(value) => onFilterChange('year', value)}
      />
      <Select
        label="Sezione"
        options={FILTER_OPTIONS.sections}
        value={filters.section}
        onChange={(value) => onFilterChange('section', value)}
      />

      {/* Filtri aggiuntivi (solo in students) */}
      {showAllFilters && (
        <>
          <Select
            label="Indirizzo"
            options={FILTER_OPTIONS.institutionTypes}
            value={filters.institutionType}
            onChange={(value) => onFilterChange('institutionType', value)}
          />
          {/* Altri filtri specifici per students */}
        </>
      )}
    </div>
  );
};