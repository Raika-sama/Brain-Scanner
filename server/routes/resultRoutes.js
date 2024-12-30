// server/routes/resultRoutes.js

const express = require('express');
const router = express.Router();
const Result = require('../models/Results');
const { authMiddleware } = require('../middleware/authMiddleware');
const { spawn } = require('child_process'); // Importa la funzione spawn


// API per ottenere i risultati dell'utente autenticato
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Trova i risultati dell'utente autenticato
    const results = await Result.find({ utente: req.user.userId })
      .populate('test', 'nome') // Popola il campo 'test' con il nome del test
      .sort({ data: -1 }); // Ordina i risultati per data (dal più recente al più vecchio)

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero dei risultati.' });
  }
});

// API per ottenere i dettagli di un risultato specifico
router.get('/:resultId', authMiddleware, async (req, res) => {
    try {
      const result = await Result.findById(req.params.resultId)
        .populate('test', 'nome') // Popola solo il nome del test
        .populate('utente', 'nome cognome');
  
      if (!result) {
        return res.status(404).json({ message: 'Risultato non trovato.' });
      }
  
      // Esegui lo script Python per il calcolo del profilo
      const pythonProcess = spawn('python', [
        `engines/${result.test.nome}/main.py`, // Percorso dello script Python (usa il nome del test)
        JSON.stringify({ risposte: result.risposte }) // Passa le risposte come argomento
      ]);
  
      // Gestisci l'output dello script Python
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data;
      });
  
      pythonProcess.stderr.on('data', (data) => {
        console.error(`Errore nello script Python: ${data}`);
        // TODO: Gestisci l'errore (es. invia una risposta di errore al frontend)
      });
  
      pythonProcess.on('close', (code) => {
        console.log(`Script Python terminato con codice ${code}`);
        if (code === 0) {
          const { profilo, punteggio } = JSON.parse(output);
  
          // Aggiungi il profilo e il punteggio al risultato
          result.profilo = profilo; 
          result.punteggio = punteggio;
  
          res.json(result); // Invia il risultato con profilo e punteggio
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Errore nel recupero del risultato.' });
    }
  });
  
  module.exports = router;


// Definiamo una route /me che gestisce le richieste GET per ottenere i risultati dell'utente autenticato.
// Utilizziamo authMiddleware per verificare che l'utente sia autenticato.
// Recuperiamo i risultati dell'utente dal database usando Result.find({ utente: req.user.userId }).
// Usiamo populate('test', 'nome') per includere il nome del test in ogni risultato.
// Ordiniamo i risultati per data usando sort({ data: -1 }).
// Restituiamo i risultati nella risposta.

// Definiamo una route /results/:resultId che gestisce le richieste GET per ottenere i dettagli di un risultato specifico.
// Utilizziamo authMiddleware per verificare che l'utente sia autenticato.
// Recuperiamo il risultato dal database usando Result.findById(req.params.resultId).
// Usiamo populate per includere i dettagli del test e dell'utente nel risultato.
// Restituiamo il risultato nella risposta.

// Ho rimosso .populate('test', 'nome domande') perché le domande non sono più necessarie in questa API, dato che il calcolo del profilo viene eseguito dal microservizio Python.
// Ho aggiunto la logica per eseguire lo script Python corrispondente al test (engines/${result.test.nome}/main.py) e passare le risposte come argomento.
// Ho aggiunto la gestione dell'output dello script Python e l'aggiunta del profilo e del punteggio al risultato prima di inviarlo al frontend.