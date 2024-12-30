const express = require('express');
const router = express.Router();
const School = require('../models/Schools');  // Nota: usando il tuo nome file
const { authMiddleware } = require('../middleware/authMiddleware');


// GET /api/schools/assigned - Ottieni la scuola assegnata all'utente
// TODO: In futuro questa logica sarà basata su una relazione User-School
router.get('/assigned', authMiddleware, async (req, res) => {
    try {
        console.log('Searching for school with userId:', req.user.userId); // Debug log

        const school = await School.findOne({
            users: req.user.userId
        });
        
        if (!school) {
            return res.status(200).json({ // Changed to 200 since this is a valid case
                success: true,
                data: null,
                message: 'Nessuna scuola assegnata a questo utente'
            });
        }

        res.json({
            success: true,
            data: school
        });
    } catch (error) {
        console.error('Errore nel recupero della scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero della scuola'
        });
    }
});


// GET /api/schools - Ottieni tutte le scuole (protetto)
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Per ora prendiamo tutte le scuole, in futuro filtreremo per permessi utente
        const schools = await School.find({});
        res.json({
            success: true,
            data: schools
        });
    } catch (error) {
        console.error('Errore nel recupero delle scuole:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore nel recupero delle scuole' 
        });
    }
});



// GET /api/schools/:id - Ottieni una scuola specifica
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'Scuola non trovata'
            });
        }
        res.json({
            success: true,
            data: school
        });
    } catch (error) {
        console.error('Errore nel recupero della scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nel recupero della scuola'
        });
    }
});

// POST /api/schools - Crea una nuova scuola
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newSchool = new School(req.body);
        await newSchool.save();
        res.status(201).json({
            success: true,
            data: newSchool,
            message: 'Scuola creata con successo'
        });
    } catch (error) {
        console.error('Errore nella creazione della scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nella creazione della scuola'
        });
    }
});

// PUT /api/schools/:id - Aggiorna una scuola
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        // Verifica codice meccanografico duplicato se viene aggiornato
        if (req.body.codice_meccanografico) {
            const existingSchool = await School.findOne({
                codice_meccanografico: req.body.codice_meccanografico,
                _id: { $ne: req.params.id }
            });
            
            if (existingSchool) {
                return res.status(400).json({
                    success: false,
                    message: 'Codice meccanografico già esistente'
                });
            }
        }

        const updatedSchool = await School.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedSchool) {
            return res.status(404).json({
                success: false,
                message: 'Scuola non trovata'
            });
        }

        res.json({
            success: true,
            data: updatedSchool,
            message: 'Scuola aggiornata con successo'
        });
    } catch (error) {
        console.error('Errore nell\'aggiornamento della scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'aggiornamento della scuola',
            error: error.message
        });
    }
});

// DELETE /api/schools/:id - Elimina una scuola
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const deletedSchool = await School.findByIdAndDelete(req.params.id);
        
        if (!deletedSchool) {
            return res.status(404).json({
                success: false,
                message: 'Scuola non trovata'
            });
        }

        res.json({
            success: true,
            message: 'Scuola eliminata con successo'
        });
    } catch (error) {
        console.error('Errore nell\'eliminazione della scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'eliminazione della scuola'
        });
    }
});



// Route per associare un utente a una scuola
router.post('/:schoolId/users/:userId', authMiddleware, async (req, res) => {
    try {
        const school = await School.findByIdAndUpdate(
            req.params.schoolId,
            { $addToSet: { users: req.params.userId } },
            { new: true }
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: 'Scuola non trovata'
            });
        }

        res.json({
            success: true,
            message: 'Utente associato alla scuola con successo',
            data: school
        });
    } catch (error) {
        console.error('Errore nell\'associazione utente-scuola:', error);
        res.status(500).json({
            success: false,
            message: 'Errore nell\'associazione utente-scuola'
        });
    }
});

module.exports = router;