const Student = require('../models/Student');
const School = require('../models/Schools');
const Class = require('../models/Class');
const mongoose = require('mongoose');

const studentController = {
    // GET - Recupera tutti gli studenti con filtri
    getStudents: async (req, res) => {
        try {
            const { search, year, section } = req.query;
            const query = { 
                schoolId: req.user.schoolId,
                isActive: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            };

            // Applica i filtri se presenti
            if (search) {
                query.$and = [
                    {
                        $or: [
                            { firstName: new RegExp(search, 'i') },
                            { lastName: new RegExp(search, 'i') }
                        ]
                    }
                ];
            }

            if (year) query.year = parseInt(year);
            if (section) query.section = section;
            
            const students = await Student.find(query)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('classId', 'year section academicYear')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email')
                .sort({ lastName: 1, firstName: 1 });

            res.json({ 
                success: true, 
                data: students 
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
                isActive: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            })
            .populate('schoolId', 'nome tipo_istituto')
            .populate('classId', 'year section academicYear')
            .populate('mainTeacher', 'firstName lastName email')
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
                firstName, 
                lastName, 
                gender,
                classId,
                notes 
            } = req.body;

            // Recupera informazioni della classe
            const classe = await Class.findById(classId);
            if (!classe) {
                throw new Error('Classe non trovata');
            }

            // Verifica duplicati
            const existingStudent = await Student.findOne({
                firstName,
                lastName,
                schoolId: req.user.schoolId,
                classId
            });

            if (existingStudent) {
                throw new Error('Esiste già uno studente con questo nome e cognome in questa classe');
            }

            // Crea lo studente
            const student = new Student({
                firstName,
                lastName,
                gender: gender.toUpperCase(),
                schoolId: req.user.schoolId,
                classId,
                year: classe.year,
                section: classe.section,
                academicYear: classe.academicYear,
                mainTeacher: classe.mainTeacher,
                teachers: classe.teachers,
                notes: notes || '',
                isActive: true
            });

            await student.save({ session });

            // Aggiorna la classe correlata
            await Class.findByIdAndUpdate(
                classId,
                { $addToSet: { students: student._id } },
                { session }
            );

            await session.commitTransaction();

            // Popola i dati per la risposta
            const populatedStudent = await Student.findById(student._id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('classId', 'year section academicYear')
                .populate('mainTeacher', 'firstName lastName email')
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
            // Rimuovi campi che non devono essere modificati direttamente
            const updateData = { ...req.body };
            delete updateData.mainTeacher;
            delete updateData.teachers;
            delete updateData.schoolId;
            delete updateData.academicYear;

            const student = await Student.findOne({ 
                _id: req.params.id,
                schoolId: req.user.schoolId,
                isActive: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            });

            if (!student) {
                throw new Error('Studente non trovato o non hai i permessi per modificarlo');
            }

            // Se viene aggiornata la classe, aggiorna anche le relative informazioni
            if (updateData.classId && updateData.classId !== student.classId.toString()) {
                const newClass = await Class.findById(updateData.classId);
                if (!newClass) {
                    throw new Error('Nuova classe non trovata');
                }

                // Rimuovi lo studente dalla vecchia classe
                await Class.findByIdAndUpdate(
                    student.classId,
                    { $pull: { students: student._id } },
                    { session }
                );

                // Aggiungi lo studente alla nuova classe
                await Class.findByIdAndUpdate(
                    updateData.classId,
                    { $addToSet: { students: student._id } },
                    { session }
                );

                // Aggiorna le informazioni relative alla classe
                updateData.year = newClass.year;
                updateData.section = newClass.section;
                updateData.academicYear = newClass.academicYear;
                updateData.mainTeacher = newClass.mainTeacher;
                updateData.teachers = newClass.teachers;
            }

            // Aggiorna lo studente
            const updatedStudent = await Student.findByIdAndUpdate(
                student._id,
                updateData,
                { 
                    new: true, 
                    runValidators: true, 
                    session 
                }
            )
            .populate('schoolId', 'nome tipo_istituto')
            .populate('classId', 'year section academicYear')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

            await session.commitTransaction();
            res.json({ 
                success: true, 
                data: updatedStudent,
                message: 'Studente aggiornato con successo'
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

    // DELETE - Disattiva uno studente (soft delete)
    deleteStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const student = await Student.findOne({
                _id: req.params.id,
                schoolId: req.user.schoolId,
                isActive: true,
                mainTeacher: req.user._id  // Solo il mainTeacher può disattivare lo studente
            });

            if (!student) {
                throw new Error('Studente non trovato o non hai i permessi per disattivarlo');
            }

            // Soft delete - imposta isActive a false invece di eliminare il record
            student.isActive = false;
            await student.save({ session });

            // Rimuovi lo studente dalla classe
            await Class.findByIdAndUpdate(
                student.classId,
                { $pull: { students: student._id } },
                { session }
            );
            
            await session.commitTransaction();
            res.json({ 
                success: true, 
                message: 'Studente disattivato con successo' 
            });

        } catch (error) {
            await session.abortTransaction();
            console.error('Errore in deleteStudent:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Errore nella disattivazione dello studente'
            });
        } finally {
            session.endSession();
        }
    }
};

module.exports = studentController;