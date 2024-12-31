// routes/students.js

const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const studentController = require('../controllers/studentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Route base esistenti
router.get('/', authMiddleware, studentController.getStudents);
router.get('/:id', authMiddleware, studentController.getStudent);
router.get('/:id/analysis', authMiddleware, studentController.getStudentAnalysis);
router.post('/', authMiddleware, studentController.createStudent);
router.put('/:id', authMiddleware, studentController.updateStudent);
router.delete('/:id', authMiddleware, studentController.deleteStudent);

// Nuova route per l'importazione batch
router.post('/batch', authMiddleware, async (req, res) => {
    try {
        const { students } = req.body;

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dati non validi: è richiesto un array di studenti'
            });
        }

        // Validazione dei dati ricevuti
        for (const student of students) {
            if (!student.nome || !student.cognome || !student.dataNascita || 
                !student.sesso || !student.classe || !student.sezione) {
                return res.status(400).json({
                    success: false,
                    message: 'Dati studente incompleti'
                });
            }
        }

        // Creazione degli studenti nel database
        const createdStudents = await Student.insertMany(students);

        res.status(201).json({
            success: true,
            message: `${createdStudents.length} studenti importati con successo`,
            data: createdStudents
        });

    } catch (error) {
        // Gestione errori specifici
        if (error.code === 11000) {
            // Errore di duplicazione (se hai un indice unique)
            return res.status(409).json({
                success: false,
                message: 'Alcuni studenti risultano già presenti nel database'
            });
        }

        console.error('Errore durante l\'importazione degli studenti:', error);
        res.status(500).json({
            success: false,
            message: 'Errore durante l\'importazione degli studenti'
        });
    }
});

router.post('/batch', authMiddleware, async (req, res) => {
    try {
      const { students } = req.body;
  
      if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Nessuno studente da importare'
        });
      }
  
      // Importa gli studenti in batch
      const result = await Student.insertMany(students, { 
        ordered: false // Continua anche se ci sono errori
      });
  
      res.status(201).json({
        success: true,
        message: `${result.length} studenti importati con successo`,
        data: result
      });
  
    } catch (error) {
      console.error('Errore nell\'importazione batch:', error);
      res.status(500).json({
        success: false,
        message: 'Errore nell\'importazione degli studenti',
        error: error.message
      });
    }
  });

module.exports = router;