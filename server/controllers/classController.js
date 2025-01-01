const Class = require('../models/Class');
const School = require('../models/Schools');

const classController = {
    // GET - Ottieni tutte le classi
    getClasses: async (req, res) => {
        try {
            const { scuola, annoScolastico } = req.query;
            const query = {};
            
            if (scuola) query.scuola = scuola;
            if (annoScolastico) query.annoScolastico = annoScolastico;

            const classes = await Class.find(query)
                .populate('scuola', 'nome tipo_istituto')
                .populate('studenti', 'nome cognome')
                .sort({ nome: 1, sezione: 1 });

            res.json({
                success: true,
                data: classes
            });
        } catch (error) {
            console.error('Errore in getClasses:', error);
            res.status(500).json({
                success: false,
                message: 'Errore nel recupero delle classi'
            });
        }
    },

    // GET - Ottieni una classe specifica
    getClass: async (req, res) => {
        try {
            const classe = await Class.findById(req.params.id)
                .populate('scuola', 'nome tipo_istituto')
                .populate('studenti', 'nome cognome')
                .populate('docenti', 'nome cognome');

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
                message: 'Errore nel recupero della classe'
            });
        }
    },

    // POST - Crea una nuova classe
    createClass: async (req, res) => {
        try {
            const { nome, sezione, annoScolastico, scuola } = req.body;

            // Verifica se la classe esiste già
            const existingClass = await Class.findOne({
                nome,
                sezione,
                annoScolastico,
                scuola
            });

            if (existingClass) {
                return res.status(400).json({
                    success: false,
                    message: 'Questa classe esiste già per questa scuola e anno scolastico'
                });
            }

            const newClass = await Class.create(req.body);
            
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
            const updatedClass = await Class.findByIdAndUpdate(
                req.params.id,
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
            const deletedClass = await Class.findByIdAndDelete(req.params.id);

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
                message: 'Errore nell\'eliminazione della classe'
            });
        }
    },

    // POST - Trova o crea una classe e aggiungi studenti
    findOrCreateClassWithStudents: async (req, res) => {
        try {
            const { nome, sezione, annoScolastico, scuola, studenti } = req.body;

            let classe = await Class.findOne({
                nome,
                sezione,
                annoScolastico,
                scuola
            });

            if (!classe) {
                classe = await Class.create({
                    nome,
                    sezione,
                    annoScolastico,
                    scuola
                });
            }

            // Aggiungi studenti evitando duplicati
            studenti.forEach(studentId => {
                if (!classe.hasStudent(studentId)) {
                    classe.addStudent(studentId);
                }
            });

            await classe.save();

            res.json({
                success: true,
                data: classe,
                message: 'Studenti aggiunti alla classe con successo'
            });
        } catch (error) {
            console.error('Errore in findOrCreateClassWithStudents:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiunta degli studenti alla classe'
            });
        }
    }
};

module.exports = classController;