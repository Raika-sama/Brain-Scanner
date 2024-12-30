// src/pages/TestPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function TestPage() {
  const { testId } = useParams(); // Ottieni l'ID del test dai parametri dell'URL
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [error, setError] = useState(null);
  const [risposte, setRisposte] = useState({}); // Stato per memorizzare le risposte dell'utente

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tests/${testId}`, { // API per ottenere i dettagli del test
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTest(data);
        } else {
          // Gestisci l'errore
          console.error('Errore nel recupero del test');
          navigate('/dashboard'); 
        }
      } catch (error) {
        console.error('Errore di rete:', error);
        // Gestisci l'errore di rete
      }
    };

    fetchTest();
  }, [testId, navigate]);

  const handleRispostaChange = (domandaId, risposta) => {
    setRisposte(prevRisposte => ({
      ...prevRisposte,
      [domandaId]: risposta
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/results`, { // API per inviare i risultati del test
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testId, risposte }) // Invia l'ID del test e le risposte
      });

      if (response.ok) {
        // Risultati inviati con successo
        console.log('Risultati inviati con successo!');
        // TODO: Reindirizza alla pagina dei risultati
      } else {
        // Gestisci l'errore
        console.error('Errore nell\'invio dei risultati');
      }
    } catch (error) {
      console.error('Errore di rete:', error);
      // Gestisci l'errore di rete
    }
  };

  if (!test) {
    return <div>Caricamento...</div>;
  }

  return (
    <div>
      <h2>{test.nome}</h2>
      <form onSubmit={handleSubmit}>
        {test.domande.map((domanda, index) => (
          <div key={index}>
            <p>{domanda.testo}</p>
            {domanda.opzioni.map((opzione, opzioneIndex) => (
              <div key={opzioneIndex}>
                <input 
                  type="radio" 
                  id={`domanda-${index}-opzione-${opzioneIndex}`} 
                  name={`domanda-${index}`} 
                  value={opzione}
                  onChange={(e) => handleRispostaChange(index, e.target.value)} 
                />
                <label htmlFor={`domanda-${index}-opzione-${opzioneIndex}`}>{opzione}</label>
              </div>
            ))}
          </div>
        ))}
        <button type="submit">Invia</button>
      </form>
    </div>
  );
}

export default TestPage;

// Utilizza useParams per ottenere l'ID del test dall'URL.
// Utilizza useState per memorizzare i dati del test, le risposte dell'utente e eventuali errori.
// Utilizza useEffect per recuperare i dati del test dal backend tramite un'API protetta.
// Renderizza il test con le domande e le opzioni di risposta.
// Gestisce l'invio del form e l'invio dei risultati del test al backend.