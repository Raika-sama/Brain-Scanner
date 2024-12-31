// server/routes/filterRoutes.js
const express = require('express');
const router = express.Router();

router.get('/options', async (req, res) => {
  try {
    const filterOptions = {
      classi: [
        { id: '1', name: '1° Anno' },
        { id: '2', name: '2° Anno' },
        { id: '3', name: '3° Anno' },
        { id: '4', name: '4° Anno' },
        { id: '5', name: '5° Anno' }
      ],
      sezioni: [
        { id: 'A', name: 'Sezione A' },
        { id: 'B', name: 'Sezione B' },
        { id: 'C', name: 'Sezione C' },
        { id: 'D', name: 'Sezione D' }
      ],
      indirizzi: [
        { id: 'scientifico', name: 'Scientifico' },
        { id: 'classico', name: 'Classico' },
        { id: 'linguistico', name: 'Linguistico' }
      ]
    };
    
    res.json(filterOptions);
  } catch (error) {
    console.error('Errore nel recupero delle opzioni di filtro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore nel recupero delle opzioni di filtro'
    });
  }
});

module.exports = router;