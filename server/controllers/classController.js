const Class = require('../models/Class');
const School = require('../models/Schools');
const Student = require('../models/Student');
const mongoose = require('mongoose');

const classController = {
    // GET - Ottieni tutte le classi
    getClasses: async (req, res) => {
        try {
            const query = { 
                schoolId: req.user.schoolId,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            };
            
            const classes = await Class.find(query)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('students', 'firstName lastName')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .sort({ year: 1, section: 1 });
    
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
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            })
                .populate('schoolId', 'nome tipo_istituto')
                .populate('students', 'firstName lastName')
                .populate('mainTeacher', 'firstName lastName email')
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
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { year, section, academicYear } = req.body;
    
            // Verifica se la classe esiste già
            const existingClass = await Class.findOne({
                year,
                section,
                academicYear,
                schoolId: req.user.schoolId
            }).session(session);
    
            if (existingClass) {
                throw new Error('Questa classe esiste già per questa scuola e anno accademico');
            }
    
            const newClass = await Class.create([{
                year,
                section,
                academicYear,
                schoolId: req.user.schoolId,
                mainTeacher: req.user._id,
                teachers: [req.user._id],
                isActive: true,
                students: []
            }], { session });
            
            // Popola i dati per la risposta
            const populatedClass = await Class.findById(newClass[0]._id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .session(session);
            
            await session.commitTransaction();

            res.status(201).json({
                success: true,
                data: populatedClass
            });
        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in createClass:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella creazione della classe'
            });
        } finally {
            session.endSession();
        }
    },

    // PUT - Aggiorna una classe esistente
    updateClass: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const updateData = { ...req.body };
            delete updateData.mainTeacher; // Protezione dal cambio del mainTeacher
            
            const updatedClass = await Class.findOneAndUpdate(
                {
                    _id: req.params.id,
                    schoolId: req.user.schoolId,
                    $or: [
                        { mainTeacher: req.user._id },
                        { teachers: req.user._id }
                    ]
                },
                updateData,
                { new: true, runValidators: true, session }
            )
            .populate('schoolId', 'nome tipo_istituto')
            .populate('students', 'firstName lastName')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

            if (!updatedClass) {
                throw new Error('Classe non trovata o non hai i permessi per modificarla');
            }

            await session.commitTransaction();
            res.json({
                success: true,
                data: updatedClass
            });
        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in updateClass:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiornamento della classe'
            });
        } finally {
            session.endSession();
        }
    },

    // DELETE - Elimina una classe
    deleteClass: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                mainTeacher: req.user._id
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o non hai i permessi per eliminarla');
            }

            // Rimuovi il riferimento alla classe da tutti gli studenti
            await Student.updateMany(
                { classId: classe._id },
                { $unset: { classId: "" } },
                { session }
            );

            // Elimina la classe
            await classe.remove({ session });
            
            await session.commitTransaction();
            res.json({
                success: true,
                message: 'Classe eliminata con successo'
            });
        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in deleteClass:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nell\'eliminazione della classe'
            });
        } finally {
            session.endSession();
        }
    },

    // POST - Aggiorna l'anno accademico
    updateAcademicYear: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { academicYear } = req.body;
            
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            classe.academicYear = academicYear;
            await classe.save({ session });

            // Aggiorna anche l'anno accademico degli studenti associati
            await Student.updateMany(
                { classId: classe._id },
                { academicYear: academicYear },
                { session }
            );

            await session.commitTransaction();

            const updatedClass = await Class.findById(classe._id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('students', 'firstName lastName')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.json({
                success: true,
                data: updatedClass,
                message: 'Anno accademico aggiornato con successo'
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiornamento dell\'anno accademico'
            });
        } finally {
            session.endSession();
        }
    },

    // POST - Aggiungi studenti alla classe
    addStudents: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { studentIds } = req.body;
            
            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            // Aggiungi gli studenti alla classe
            classe.students.addToSet(...studentIds);
            await classe.save({ session });

            // Aggiorna gli studenti con il riferimento alla classe
            await Student.updateMany(
                { _id: { $in: studentIds } },
                { 
                    classId: classe._id,
                    section: classe.section,
                    academicYear: classe.academicYear
                },
                { session }
            );

            await session.commitTransaction();

            const updatedClass = await Class.findById(classe._id)
                .populate('students', 'firstName lastName')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.json({
                success: true,
                data: updatedClass,
                message: 'Studenti aggiunti con successo'
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiunta degli studenti'
            });
        } finally {
            session.endSession();
        }
    },

    // DELETE - Rimuovi uno studente dalla classe
    removeStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { studentId } = req.params;

            const classe = await Class.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            }).session(session);

            if (!classe) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            // Rimuovi lo studente dalla classe
            classe.students.pull(studentId);
            await classe.save({ session });

            // Rimuovi il riferimento alla classe dallo studente
            await Student.updateOne(
                { _id: studentId },
                { $unset: { classId: "" } },
                { session }
            );

            await session.commitTransaction();

            const updatedClass = await Class.findById(classe._id)
                .populate('students', 'firstName lastName')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.json({
                success: true,
                data: updatedClass,
                message: 'Studente rimosso con successo'
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella rimozione dello studente'
            });
        } finally {
            session.endSession();
        }
    },

   // POST - Aggiungi un insegnante alla classe
   addTeacher: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { teacherId } = req.body;
        
        // Verifica che l'utente corrente sia il mainTeacher o un teacher esistente
        const classe = await Class.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId,
            $or: [
                { mainTeacher: req.user._id },
                { teachers: req.user._id }
            ]
        }).session(session);

        if (!classe) {
            throw new Error('Classe non trovata o permessi insufficienti');
        }

        // Verifica che il teacher da aggiungere non sia già presente
        if (classe.teachers.includes(teacherId)) {
            throw new Error('L\'insegnante è già assegnato a questa classe');
        }

        // Aggiungi il nuovo teacher
        classe.teachers.push(teacherId);
        await classe.save({ session });

        // Popola i dati per la risposta
        const updatedClass = await Class.findById(classe._id)
            .populate('schoolId', 'nome tipo_istituto')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email')
            .session(session);

        await session.commitTransaction();

        res.json({
            success: true,
            data: updatedClass,
            message: 'Insegnante aggiunto con successo'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Errore in addTeacher:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Errore nell\'aggiunta dell\'insegnante'
        });
    } finally {
        session.endSession();
    }
},

// DELETE - Rimuovi un insegnante dalla classe
removeTeacher: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const teacherIdToRemove = req.params.teacherId;

        // Verifica che l'utente corrente sia il mainTeacher
        const classe = await Class.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId,
            mainTeacher: req.user._id  // Solo il mainTeacher può rimuovere altri insegnanti
        }).session(session);

        if (!classe) {
            throw new Error('Classe non trovata o permessi insufficienti');
        }

        // Non permettere la rimozione del mainTeacher
        if (teacherIdToRemove === classe.mainTeacher.toString()) {
            throw new Error('Non puoi rimuovere l\'insegnante principale');
        }

        // Verifica che l'insegnante da rimuovere sia effettivamente assegnato
        if (!classe.teachers.includes(teacherIdToRemove)) {
            throw new Error('L\'insegnante non è assegnato a questa classe');
        }

        // Rimuovi l'insegnante
        classe.teachers = classe.teachers.filter(
            id => id.toString() !== teacherIdToRemove
        );
        await classe.save({ session });

        // Popola i dati per la risposta
        const updatedClass = await Class.findById(classe._id)
            .populate('schoolId', 'nome tipo_istituto')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email')
            .session(session);

        await session.commitTransaction();

        res.json({
            success: true,
            data: updatedClass,
            message: 'Insegnante rimosso con successo'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Errore in removeTeacher:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Errore nella rimozione dell\'insegnante'
        });
    } finally {
        session.endSession();
    }
},

// POST - Aggiungi studenti alla classe
addStudents: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { studentIds } = req.body;
        
        const classe = await Class.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId,
            $or: [
                { mainTeacher: req.user._id },
                { teachers: req.user._id }
            ]
        }).session(session);

        if (!classe) {
            throw new Error('Classe non trovata o permessi insufficienti');
        }

        // Aggiungi gli studenti alla classe
        classe.students.push(...studentIds);
        await classe.save({ session });

        // Aggiorna anche gli studenti con il riferimento alla classe
        await Student.updateMany(
            { _id: { $in: studentIds } },
            { 
                classId: classe._id,
                year: classe.year,
                section: classe.section,
                academicYear: classe.academicYear
            },
            { session }
        );

        await session.commitTransaction();

        const updatedClass = await Class.findById(classe._id)
            .populate('students', 'firstName lastName')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

        res.json({
            success: true,
            data: updatedClass,
            message: 'Studenti aggiunti con successo'
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({
            success: false,
            message: error.message || 'Errore nell\'aggiunta degli studenti'
        });
    } finally {
        session.endSession();
    }
},

// PUT - Aggiorna l'anno accademico della classe
updateAcademicYear: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { academicYear } = req.body;
        
        const classe = await Class.findOne({
            _id: req.params.id,
            schoolId: req.user.schoolId,
            $or: [
                { mainTeacher: req.user._id },
                { teachers: req.user._id }
            ]
        }).session(session);

        if (!classe) {
            throw new Error('Classe non trovata o permessi insufficienti');
        }

        // Aggiorna l'anno accademico
        classe.academicYear = academicYear;
        await classe.save({ session });

        // Aggiorna anche l'anno accademico degli studenti associati
        await Student.updateMany(
            { classId: classe._id },
            { academicYear: academicYear },
            { session }
        );

        await session.commitTransaction();

        const updatedClass = await Class.findById(classe._id)
            .populate('students', 'firstName lastName')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

        res.json({
            success: true,
            data: updatedClass,
            message: 'Anno accademico aggiornato con successo'
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({
            success: false,
            message: error.message || 'Errore nell\'aggiornamento dell\'anno accademico'
        });
    } finally {
        session.endSession();
    }
}
};

module.exports = classController; 