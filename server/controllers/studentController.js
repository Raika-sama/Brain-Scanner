const Student = require('../models/Student');
const School = require('../models/Schools');
const Class = require('../models/Class');
const ClassService = require('../services/classService');
const mongoose = require('mongoose');

const studentController = {
    // GET - Recupera tutti gli studenti con filtri
    getStudents: async (req, res) => {
        try {
            const { search, number, section } = req.query;
            const query = { 
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            };

            // Applica i filtri se presenti
            if (search) {
                query.$and = [
                    {
                        $or: [
                            { nome: new RegExp(search, 'i') },
                            { cognome: new RegExp(search, 'i') }
                        ]
                    }
                ];
            }

            if (number) query.number = number;
            if (section) query.section = section;
            
            const students = await Student.find(query)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .sort({ cognome: 1, nome: 1 });

            const formattedStudents = students.map(student => ({
                _id: student._id,
                nome: student.nome,
                cognome: student.cognome,
                number: student.number,
                section: student.section,
                gender: student.gender,
                teacherId: student.teacherId,
                teachers: student.teachers,
                note: student.note
            }));

            res.json({ 
                success: true, 
                data: formattedStudents 
            });
        } catch (error) {
            console.error('Errore in getStudents:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Errore nel recupero degli studenti' 
            });
        }
    },

    // GET - Recupera un singolo studente
    getStudent: async (req, res) => {
        try {
            const student = await Student.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            })
            .populate('schoolId', 'name type')
            .populate('teacherId', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');
            
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato o non hai i permessi per visualizzarlo' 
                });
            }

            res.json({ success: true, data: student });
        } catch (error) {
            console.error('Errore in getStudent:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Errore nel recupero dello studente' 
            });
        }
    },

    // POST - Crea un nuovo studente
    createStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { 
                nome, 
                cognome, 
                gender,
                number,
                section,
                note 
            } = req.body;

            const schoolYear = ClassService.getCurrentSchoolYear();
            const schoolId = req.user.schoolId;

            // Verifica duplicati
            const existingStudent = await Student.findOne({
                nome,
                cognome,
                schoolId,
                number,
                section,
                schoolYear
            });

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Esiste già uno studente con questo nome e cognome in questa classe'
                });
            }

            // Crea lo studente
            const student = new Student({
                nome,
                cognome,
                gender: gender.toUpperCase(),
                number,
                section,
                schoolYear,
                schoolId,
                teacherId: req.user._id,      // Imposta l'utente corrente come teacher principale
                teachers: [req.user._id],      // Aggiungilo anche all'array dei teachers
                note: note || ''
            });

            await student.save({ session });

            // Aggiorna la classe correlata
            await Class.findOneAndUpdate(
                {
                    number,
                    section,
                    schoolYear,
                    schoolId,
                    $or: [
                        { teacherId: req.user._id },
                        { teachers: req.user._id }
                    ]
                },
                { $addToSet: { students: student._id } },
                { session }
            );

            await session.commitTransaction();

            // Popola i dati per la risposta
            const populatedStudent = await Student.findById(student._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.status(201).json({
                success: true,
                data: populatedStudent,
                message: 'Studente creato con successo'
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in createStudent:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella creazione dello studente'
            });
        } finally {
            session.endSession();
        }
    },

    // PUT - Aggiorna uno studente
    updateStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Rimuovi teacherId dal body se presente
            const updateData = { ...req.body };
            delete updateData.teacherId;

            const updatedStudent = await Student.findOneAndUpdate(
                { 
                    _id: req.params.id,
                    schoolId: req.user.schoolId,
                    $or: [
                        { teacherId: req.user._id },
                        { teachers: req.user._id }
                    ]
                },
                updateData,
                { 
                    new: true, 
                    runValidators: true, 
                    session 
                }
            )
            .populate('schoolId', 'name type')
            .populate('teacherId', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

            if (!updatedStudent) {
                throw new Error('Studente non trovato o non hai i permessi per modificarlo');
            }

            await session.commitTransaction();
            res.json({ 
                success: true, 
                data: updatedStudent 
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in updateStudent:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nell\'aggiornamento dello studente'
            });
        } finally {
            session.endSession();
        }
    },

    // DELETE - Elimina uno studente
    deleteStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const student = await Student.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                teacherId: req.user._id  // Solo il teacher principale può eliminare lo studente
            });

            if (!student) {
                throw new Error('Studente non trovato o non hai i permessi per eliminarlo');
            }

            // Rimuovi lo studente dalla classe
            await Class.updateMany(
                { students: student._id },
                { $pull: { students: student._id } },
                { session }
            );

            // Elimina lo studente
            await student.remove({ session });
            
            await session.commitTransaction();
            res.json({ 
                success: true, 
                message: 'Studente eliminato con successo' 
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in deleteStudent:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nell\'eliminazione dello studente'
            });
        } finally {
            session.endSession();
        }
    },

    // Aggiungi un teacher allo studente
    addTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { teacherId } = req.body;
            
            // Verifica che l'utente corrente sia il teacher principale o un teacher esistente
            const student = await Student.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                $or: [
                    { teacherId: req.user._id },
                    { teachers: req.user._id }
                ]
            }).session(session);

            if (!student) {
                throw new Error('Studente non trovato o permessi insufficienti');
            }

            // Verifica che il teacher da aggiungere non sia già presente
            if (student.teachers.includes(teacherId)) {
                throw new Error('Il teacher è già assegnato a questo studente');
            }

            // Aggiungi il nuovo teacher
            student.teachers.push(teacherId);
            await student.save({ session });

            // Popola i dati per la risposta
            const updatedStudent = await Student.findById(student._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .session(session);

            await session.commitTransaction();

            res.json({
                success: true,
                data: updatedStudent,
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

    // Rimuovi un teacher dallo studente
    removeTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const teacherIdToRemove = req.params.teacherId;

            // Verifica che l'utente corrente sia il teacher principale
            const student = await Student.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                teacherId: req.user._id  // Solo il teacher principale può rimuovere altri teacher
            }).session(session);

            if (!student) {
                throw new Error('Studente non trovato o permessi insufficienti');
            }

            // Non permettere la rimozione del teacher principale
            if (teacherIdToRemove === student.teacherId.toString()) {
                throw new Error('Non puoi rimuovere il teacher principale');
            }

            // Verifica che il teacher da rimuovere sia effettivamente assegnato
            if (!student.teachers.includes(teacherIdToRemove)) {
                throw new Error('Il teacher non è assegnato a questo studente');
            }

            // Rimuovi il teacher
            student.teachers = student.teachers.filter(
                id => id.toString() !== teacherIdToRemove
            );
            await student.save({ session });

            // Popola i dati per la risposta
            const updatedStudent = await Student.findById(student._id)
                .populate('schoolId', 'name type')
                .populate('teacherId', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .session(session);

            await session.commitTransaction();
            res.json({
                success: true,
                message: 'Teacher rimosso con successo'
            });

        } catch (error) {
            await session.abortTransaction();
            res.status(400).json({
                success: false,
                message: error.message || 'Errore nella rimozione del teacher'
            });
        } finally {
            session.endSession();
        }
    }
};

module.exports = studentController;