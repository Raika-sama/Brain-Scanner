const Class = require('../models/Class');
const School = require('../models/Schools');
const ClassService = require('../services/classService');

const classController = {
    // GET - Ottieni tutte le classi
    getClasses: async (req, res) => {
        try {
            const query = { schoolId: req.user.scuola };
            
            const classes = await Class.find(query)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('students', 'nome cognome')
                .sort({ name: 1, section: 1 });
    
            res.json({
                success: true,
                data: classes
            });
        } catch (error) {
            console.error('Errore in getClasses:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nel recupero delle classi'
            });
            }
        }
    },

    // GET - Ottieni una classe specifica
    getClass: async (req, res) => {
        try {
            const classe = await Class.findOne({
                _id: req.params.id,
                school: req.user.scuola  // Aggiunto controllo della scuola
            })
                .populate('school', 'nome tipo_istituto')
                .populate('students', 'nome cognome')
                .populate('teachers', 'nome cognome');  // Cambiato da docenti a teachers

            if (!classe) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata'
                });
            }

            res.json({
                success: true,
                data: classe
            });
        } catch (error) {
            console.error('Errore in getClass:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nel recupero della classe'
            });
        }
    },

    // POST - Crea una nuova classe
    createClass: async (req, res) => {
        try {
            const { numero, sezione } = req.body;  // Cambiato da nome a numero
            const school = req.user.scuola;
            const annoScolastico = ClassService.getCurrentSchoolYear();

            // Verifica se la classe esiste già
            const existingClass = await Class.findOne({
                numero,          // Cambiato da nome a numero
                sezione,
                annoScolastico,
                school          // Cambiato da scuola a school
            });

            if (existingClass) {
                return res.status(400).json({
                    success: false,
                    message: 'Questa classe esiste già per questa scuola e anno scolastico'
                });
            }

            const newClass = await Class.create({
                ...req.body,
                school,          // Assicurati che venga usata la scuola dell'utente
                annoScolastico   // Usa l'anno scolastico calcolato
            });
            
            res.status(201).json({
                success: true,
                data: newClass
            });
        } catch (error) {
            console.error('Errore in createClass:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella creazione della classe'
            });
        }
    },

    // PUT - Aggiorna una classe esistente
    updateClass: async (req, res) => {
        try {
            const updatedClass = await Class.findOneAndUpdate(
                {
                    _id: req.params.id,
                    school: req.user.scuola  // Aggiungi controllo della scuola
                },
                req.body,
                { new: true, runValidators: true }
            );

            if (!updatedClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata'
                });
            }

            res.json({
                success: true,
                data: updatedClass
            });
        } catch (error) {
            console.error('Errore in updateClass:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiornamento della classe'
            });
        }
    },

    // DELETE - Elimina una classe
    deleteClass: async (req, res) => {
        try {
            const deletedClass = await Class.findOneAndDelete({
                _id: req.params.id,
                school: req.user.scuola  // Aggiungi controllo della scuola
            });

            if (!deletedClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata'
                });
            }

            res.json({
                success: true,
                message: 'Classe eliminata con successo'
            });
        } catch (error) {
            console.error('Errore in deleteClass:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nell\'eliminazione della classe'
            });
        }
    }
};

module.exports = classController;