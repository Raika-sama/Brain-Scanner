// server/routes/api/filterOptions.js
const express = require('express');
const router = express.Router();

router.get('/filter-options', async (req, res) => {
  try {
    const filterOptions = {
      classi: [
        { id: '1', name: '1' },
        { id: '2', name: '2' },
        { id: '3', name: '3' },
        { id: '4', name: '4' },
        { id: '5', name: '5' }
      ],
      sezioni: [
        { id: 'A', name: 'A' },
        { id: 'B', name: 'B' },
        { id: 'C', name: 'C' },
        { id: 'D', name: 'D' }
      ],
      indirizzi: [
        { id: 'scientifico', name: 'Scientifico' },
        { id: 'classico', name: 'Classico' },
        { id: 'linguistico', name: 'Linguistico' }
      ]
    };
    
    res.json(filterOptions);
  } catch (error) {
    res.status(500).json({ message: 'Errore nel recupero delle opzioni di filtro' });
  }
});

router.get('/api/filters/options', (req, res) => {
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
});


module.exports = router;