// src/pages/students/StudentAnalysis.js
import React from 'react';
import { useParams } from 'react-router-dom';

const StudentAnalysis = () => {
  const { id } = useParams();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Analisi Studente (ID: {id})
        </h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Questa sezione è in fase di sviluppo. L'integrazione con il sistema di analisi dei test è in lavorazione.
              </p>
            </div>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Prossimamente qui verranno visualizzati:
        </p>
        <ul className="list-disc list-inside text-gray-600 ml-4">
          <li>Risultati dei test</li>
          <li>Analisi del microservizio Python</li>
          <li>Grafici e visualizzazioni</li>
          <li>Report dettagliati</li>
        </ul>
      </div>
    </div>
  );
};

export default StudentAnalysis;