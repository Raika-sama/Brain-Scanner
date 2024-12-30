// src/pages/ResultPage.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResultPage() {
  const { resultId } = useParams(); // Ottieni l'ID del risultato dai parametri dell'URL
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/results/${resultId}`, { // API per ottenere i dettagli del risultato
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setResult(data);
        } else {
          // Gestisci l'errore
          console.error('Errore nel recupero del risultato');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Errore di rete:', error);
        // Gestisci l'errore di rete
      }
    };

    fetchResult();
  }, [resultId, navigate]);

  if (!result) {
    return <div>Caricamento...</div>;
  }

    // Estrai i dati necessari dal risultato
  const { punteggio, risposte, test, data } = result;
  const { nome: nomeTest, domande } = test;



    return (
        <div>
          <h2>Risultati del test: {nomeTest}</h2>
          <p>Data: {data}</p>
    
          {/* Visualizza il profilo dell'utente */}
          <h3>Profilo:</h3>
          <ul>
            {profilo.map((item, index) => (
              <li key={index}>
                {item.nome}: {item.valore} (punteggio: {item.punteggio})
              </li>
            ))}
          </ul>
    
          {/* Visualizza i consigli personalizzati */}
          <h3>Consigli:</h3>
          <ul>
            {profilo.map((item, index) => (
              <li key={index}>
                {item.consigli.map((consiglio, consiglioIndex) => (
                  <p key={consiglioIndex}>{consiglio}</p>
                ))}
              </li>
            ))}
          </ul>
    
          {/* Visualizza il punteggio totale (se disponibile) */}
          {punteggio && <p>Punteggio totale: {punteggio}</p>}
    
          {/* Visualizza le risposte (opzionale) */}
          {/* <h3>Risposte:</h3>
          <ul>
            {risposte.map((risposta, index) => (
              <li key={index}>
                Domanda {risposta.domanda}: {risposta.risposta}
              </li>
            ))}
          </ul> */}
        </div>
      );
}

function calcolaProfilo(risposte, domande) {
    // ... Logica per calcolare il profilo in base alle risposte e alle domande del test
    // Restituisce un array di oggetti con nome, valore, punteggio e consigli
    return [
      { 
        nome: 'Creatività', 
        valore: 'Intuitivo', 
        punteggio: 8, 
        consigli: [
          'Sfrutta la tua immaginazione e la tua capacità di pensare fuori dagli schemi.',
          'Cerca di trovare soluzioni creative ai problemi.'
        ]
      },
      // ... altri elementi del profilo
    ];
  }

export default ResultPage;

// Utilizza useParams per ottenere l'ID del risultato dall'URL.
// Utilizza useState per memorizzare i dati del risultato e eventuali errori.
// Utilizza useEffect per recuperare i dati del risultato dal backend tramite un'API protetta.
// Mostra le informazioni del risultato, come il nome del test, la data e il punteggio (se disponibile).
// Include un esempio di visualizzazione delle risposte dell'utente.
// Estrae i dati necessari dal risultato del test.
// Calcola il profilo dell'utente usando la funzione calcolaProfilo (che dovrai implementare in base alla logica del test cognitivo).
// Visualizza il profilo dell'utente, i consigli personalizzati e il punteggio totale (se disponibile).
// Ho commentato la sezione per la visualizzazione delle singole risposte, ma puoi riattivarla se necessario.