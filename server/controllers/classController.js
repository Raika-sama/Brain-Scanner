const Class = require('../models/Class');
const School = require('../models/Schools');
const ClassService = require('../services/classService');

const classController = {
    // GET - Ottieni tutte le classi
    getClasses: async (req, res) => {
        try {
            const query = { 
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            };
            
            const classes = await Class.find(query)
                .populate('schoolId', 'name type')
                .populate('students', 'nome cognome')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .sort({ number: 1, section: 1 });
    
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
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            })
                .populate('schoolId', 'name type')
                .populate('students', 'nome cognome')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

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
            const { number, section } = req.body;
            const schoolYear = ClassService.getCurrentSchoolYear();
    
            // Verifica se la classe esiste già
            const existingClass = await Class.findOne({
                number,
                section,
                schoolYear,
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            });
    
            if (existingClass) {
                return res.status(400).json({
                    success: false,
                    message: 'Questa classe esiste già per questa scuola e anno scolastico'
                });
            }
    
            const newClass = await Class.create({
                number,
                section,
                schoolYear,
                schoolId: req.user.schoolId,
                teacherId: req.user._id,     // Impostiamo l'utente corrente come teacher principale
                teachers: [req.user._id]     // Lo aggiungiamo anche all'array dei teachers
            });
            
            // Popola i dati per la risposta
            const populatedClass = await Class.findById(newClass._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');
            
            res.status(201).json({
                success: true,
                data: populatedClass
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
            // Rimuoviamo teacherId dal body se presente per evitare modifiche non autorizzate
            const updateData = { ...req.body };
            delete updateData.teacherId;
            
            const updatedClass = await Class.findOneAndUpdate(
                {
                    _id: req.params.id,
                    schoolId: req.user.schoolId,
                    $or: [
                        { teacherId: req.user._id },
                        { teachers: req.user._id }
                    ]
                },
                updateData,
                { new: true, runValidators: true }
            )
            .populate('schoolId', 'name type')
            .populate('students', 'nome cognome')
            .populate('teacherId', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

            if (!updatedClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata o non hai i permessi per modificarla'
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
                schoolId: req.user.schoolId,
                teacherId: req.user._id  // Solo il teacher principale può eliminare la classe
            });

            if (!deletedClass) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata o non hai i permessi per eliminarla'
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
    },

    // Aggiungi un teacher alla classe
    addTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { teacherId } = req.body;
            
            // Verifica che l'utente corrente sia il teacher principale o un teacher esistente
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            // Verifica che il teacher da aggiungere non sia già presente
            if (classe.teachers.includes(teacherId)) {
                throw new Error('Il teacher è già assegnato a questa classe');
            }

            // Aggiungi il nuovo teacher
            classe.teachers.push(teacherId);
            await classe.save({ session });

            // Popola i dati per la risposta
            const updatedClass = await Class.findById(classe._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .session(session);

            await session.commitTransaction();

            res.json({
                success: true,
                data: updatedClass,
                message: 'Teacher aggiunto con successo'
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in addTeacher:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiunta del teacher'
            });
        } finally {
            session.endSession();
        }
    },

    // Rimuovi un teacher dalla classe
    removeTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const teacherIdToRemove = req.params.teacherId;

            // Verifica che l'utente corrente sia il teacher principale
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                teacherId: req.user._id  // Solo il teacher principale può rimuovere altri teacher
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            // Non permettere la rimozione del teacher principale
            if (teacherIdToRemove === classe.teacherId.toString()) {
                throw new Error('Non puoi rimuovere il teacher principale');
            }

            // Verifica che il teacher da rimuovere sia effettivamente assegnato
            if (!classe.teachers.includes(teacherIdToRemove)) {
                throw new Error('Il teacher non è assegnato a questa classe');
            }

            // Rimuovi il teacher
            classe.teachers = classe.teachers.filter(
                id => id.toString() !== teacherIdToRemove
            );
            await classe.save({ session });

            // Popola i dati per la risposta
            const updatedClass = await Class.findById(classe._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .session(session);

            await session.commitTransaction();

            res.json({
                success: true,
                data: updatedClass,
                message: 'Teacher rimosso con successo'
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in removeTeacher:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella rimozione del teacher'
            });
        } finally {
            session.endSession();
        }
    }
};

module.exports = classController;