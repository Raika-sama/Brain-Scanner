// src/pages/placeholder.js
import React from 'react';

const PlaceholderPage = ({ pageName }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-semibold">{pageName}</h1>
    </div>
  );
};

export default PlaceholderPage;