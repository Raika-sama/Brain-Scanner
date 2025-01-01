const Class = require('../models/Class');
const School = require('../models/Schools');
const ClassService = require('../services/classService');

const classController = {
    // GET - Ottieni tutte le classi
    getClasses: async (req, res) => {
        try {
            const query = { schoolId: req.user.schoolId };  // Cambiato da scuola a schoolId
            
            const classes = await Class.find(query)
                .populate('schoolId', 'name type')  // Aggiornati i campi del populate
                .populate('students', 'firstName lastName')  // Aggiornati i campi del populate
                .sort({ number: 1, section: 1 });  // Cambiato da name a number
    
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
    },

    // GET - Ottieni una classe specifica
    getClass: async (req, res) => {
        try {
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId  // Cambiato da school a schoolId
            })
                .populate('schoolId', 'name type')  // Aggiornati i campi del populate
                .populate('students', 'firstName lastName')  // Aggiornati i campi del populate
                .populate('teachers', 'firstName lastName');  // Aggiornati i campi del populate

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
            const { number, section, schoolId } = req.body;  // Aggiungiamo schoolId dal body
            const schoolYear = ClassService.getCurrentSchoolYear();
    
            // Validazione della presenza di schoolId
            if (!schoolId) {
                return res.status(400).json({
                    success: false,
                    message: 'schoolId è obbligatorio'
                });
            }
    
            // Verifica se la classe esiste già
            const existingClass = await Class.findOne({
                number,
                section,
                schoolYear,
                schoolId
            });
    
            if (existingClass) {
                return res.status(400).json({
                    success: false,
                    message: 'Questa classe esiste già per questa scuola e anno scolastico'
                });
            }
    
            // Verifica che la scuola esista
            const schoolExists = await School.findById(schoolId);
            if (!schoolExists) {
                return res.status(400).json({
                    success: false,
                    message: 'La scuola specificata non esiste'
                });
            }
    
            const newClass = await Class.create({
                number,
                section,
                schoolYear,
                schoolId
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
                    schoolId: req.user.schoolId  // Cambiato da school a schoolId
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
                schoolId: req.user.schoolId  // Cambiato da school a schoolId
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