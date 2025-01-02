import React from 'react';

// Componente AlertDescription come subcomponente
const AlertDescription = ({ children, className = '' }) => {
    return (
        <div className={`mt-2 text-sm ${className}`}>
            {children}
        </div>
    );
};

// Componente Alert principale
const Alert = ({ children, variant = 'info', className = '' }) => {
    const variants = {
        info: 'bg-blue-100 border-blue-500 text-blue-700',
        success: 'bg-green-100 border-green-500 text-green-700',
        warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
        error: 'bg-red-100 border-red-500 text-red-700'
    };

    return (
        <div className={`border-l-4 p-4 ${variants[variant]} ${className}`} role="alert">
            {children}
        </div>
    );
};

// Esporta entrambi i componenti
Alert.Description = AlertDescription;

export { Alert, AlertDescription };
export default Alert;