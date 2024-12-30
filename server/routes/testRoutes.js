// server/routes/testRoutes.js

const express = require('express');
const router = express.Router();
const Test = require('../models/Tests'); // Importa il modello Test
const { authMiddleware } = require('../middleware/authMiddleware'); // Importa il middleware di autenticazione

// API per ottenere la lista dei test disponibili
router.get('/', authMiddleware, async (req, res) => { 
  try {
    const tests = await Test.find({}); // Ottieni tutti i test dal database

    res.json(tests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Errore nel recupero dei test.' });
  }
});

module.exports = router;


// Definiamo una route / (che corrisponde a /api/tests) che gestisce le richieste GET per ottenere la lista dei test.
// Utilizziamo authMiddleware per verificare che l'utente sia autenticato.
// Recuperiamo tutti i test dal database usando Test.find({}).
// Restituiamo la lista dei test nella risposta.