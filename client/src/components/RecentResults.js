// src/components/RecentResults.js

import React, { useState, useEffect } from 'react';

function RecentResults() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/results/me', { // Sostituisci con l'endpoint corretto per ottenere i risultati dell'utente
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Errore nel recupero dei risultati.');
        }
      } catch (error) {
        console.error('Errore di rete:', error);
        setError('Errore di rete. Riprova più tardi.');
      }
    };

    fetchResults();
  }, []);

  return (
    <div>
      <h2>Risultati recenti</h2>
      {error && <div className="error">{error}</div>}
      <ul>
        {results.map(result => (
          <li key={result._id}>
            {/* TODO: Aggiungi link per visualizzare i dettagli del risultato */}
            <a href={`/results/${result._id}`}>
              {result.test.nome} - {result.data} {/* Mostra il nome del test e la data */}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RecentResults;

// Utilizza useState per memorizzare la lista dei risultati e eventuali errori.
// Utilizza useEffect per recuperare i risultati dell'utente dal backend tramite un'API protetta.
// Mostra un messaggio di errore se si verifica un errore durante il recupero dei risultati.
// Renderizza una lista di risultati con link per visualizzare i dettagli di ogni risultato.
