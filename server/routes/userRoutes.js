// server/routes/userRoutes.js

const express = require('express');
const router = express.Router();
// Correggiamo l'import del modello User
const User = require('../models/Users'); // era '../models/Users' invece di '../models/User'
const { authMiddleware } = require('../middleware/authMiddleware');

// server/routes/userRoutes.js

router.get('/debug-user', authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId)
          .populate('school')
          .lean();
      
      console.log('Debug User Data:', user);
      
      res.json({
          success: true,
          user: user,
          tokenInfo: req.user
      });
  } catch (error) {
      console.error('Debug Error:', error);
      res.status(500).json({ 
          success: false, 
          error: error.message 
      });
  }
});


router.get('/me', authMiddleware, async (req, res) => {
  try {
      const user = await User.findById(req.user.userId)
          .populate('school');  // Popola i dati della scuola

      if (!user) {
          return res.status(404).json({
              success: false,
              message: 'Utente non trovato'
          });
      }

      // Log per debug
      console.log('User details:', {
          id: user._id,
          email: user.email,
          school: user.school,
          ruolo: user.ruolo
      });

      res.json({
          success: true,
          user: {
              _id: user._id,
              email: user.email,
              nome: user.nome,
              cognome: user.cognome,
              ruolo: user.ruolo,
              school: user.school  // Includi i dati della scuola
          }
      });
  } catch (error) {
      console.error('Error in /me:', error);
      res.status(500).json({
          success: false,
          message: 'Errore nel recupero dei dati utente'
      });
  }
});

module.exports = router;

// Definiamo una route /me che gestisce le richieste GET per ottenere i dati dell'utente autenticato.
// Utilizziamo authMiddleware (che creeremo tra poco) per verificare che l'utente sia autenticato.
// Se l'utente è autenticato, req.user conterrà i dati dell'utente estratti dal token JWT.
// Recuperiamo l'utente dal database usando User.findById.
// Restituiamo i dati dell'utente nella risposta, escludendo la password.