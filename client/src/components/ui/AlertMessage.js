// src/components/ui/AlertMessage.js
import React from 'react';

const AlertMessage = ({ type = 'info', message }) => {
  const styles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    success: 'bg-green-100 border-green-500 text-green-700',
  };

  return (
    <div className={`border-l-4 p-4 ${styles[type]}`} role="alert">
      <p>{message}</p>
    </div>
  );
};

export default AlertMessage;