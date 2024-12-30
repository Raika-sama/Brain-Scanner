// src/components/AvailableTests.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AvailableTests() {
  const [tests, setTests] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inizializza useNavigate

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/tests', { // Sostituisci con l'endpoint corretto per ottenere la lista dei test
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTests(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Errore nel recupero dei test.');
        }
      } catch (error) {
        console.error('Errore di rete:', error);
        setError('Errore di rete. Riprova più tardi.');
      }
    };

    fetchTests();
  }, []);
    

    const handleTestClick = (testId) => {
        // Reindirizza l'utente alla pagina del test
        navigate(`/test/${testId}`); 
    };



return (
    <div>
        <h2>Test disponibili</h2>
        {error && <div className="error">{error}</div>}
          <ul>
            {tests.map(test => (
              <li key={test._id}>
                <button onClick={() => handleTestClick(test._id)}> {/* Aggiungi un gestore di click */}
                  {test.nome}
                </button>
              </li>
            ))}
          </ul>
        </div>
        );
    }
    
    export default AvailableTests;

// Utilizza useState per memorizzare la lista dei test e eventuali errori.
// Utilizza useEffect per recuperare la lista dei test dal backend tramite un'API protetta.
// Mostra un messaggio di errore se si verifica un errore durante il recupero dei test.
// Renderizza una lista di test con link per avviare ogni test.
// Abbiamo importato useNavigate da react-router-dom.
// Abbiamo creato una funzione handleTestClick che accetta l'ID del test come parametro e reindirizza l'utente alla pagina /test/${testId}.
// Abbiamo aggiunto un gestore di click (onClick) al pulsante che chiama handleTestClick con l'ID del test.