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
    // POST - Crea un nuovo studente
    createStudent: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();
    
        try {
            const { 
                firstName, 
                lastName, 
                gender,
                notes 
            } = req.body;
    
            // Verifica duplicati con la query modificata
            const duplicateQuery = {
                firstName,
                lastName,
                schoolId: req.user.schoolId,  // usa schoolId dell'utente
            };
    
            const existingStudent = await Student.findOne(duplicateQuery);
            if (existingStudent) {
                throw new Error('Esiste già uno studente con questo nome e cognome');
            }
    
            // Prepara i dati dello studente
            const studentData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                gender: gender.toUpperCase(),
                // Usa direttamente i dati dell'utente autenticato
                schoolId: req.user.schoolId,    // dalla sessione utente
                mainTeacher: req.user._id,      // dalla sessione utente
                notes: notes?.trim() || '',
                isActive: true,
                needsClassAssignment: true      // nuovo studente senza classe
            };
    
            console.log('Creating student with data:', studentData);
    
            // Crea lo studente
            const student = new Student(studentData);
            await student.save({ session });
    
            await session.commitTransaction();
    
            // Popola i dati per la risposta
            const populatedStudent = await Student.findById(student._id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('mainTeacher', 'firstName lastName email');
    
            res.status(201).json({
                success: true,
                data: populatedStudent,
                message: 'Studente creato con successo. Necessita assegnazione classe'
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
    },

// Alla fine dell'oggetto studentController, prima di module.exports, aggiungi:

// POST - Assegna una classe a uno studente
assignClass: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { classId } = req.body;

        // Trova lo studente
        const student = await Student.findOne({
            _id: id,
            schoolId: req.user.schoolId,
            isActive: true,
            $or: [
                { mainTeacher: req.user._id },
                { teachers: req.user._id }
            ]
        });

        if (!student) {
            throw new Error('Studente non trovato o non hai i permessi');
        }

        // Trova la classe
        const classe = await Class.findById(classId);
        if (!classe) {
            throw new Error('Classe non trovata');
        }

        // Verifica che la classe appartenga alla stessa scuola
        if (!classe.schoolId.equals(student.schoolId)) {
            throw new Error('La classe deve appartenere alla stessa scuola dello studente');
        }

        // Aggiorna lo studente
        student.classId = classId;
        student.section = classe.section;
        student.needsClassAssignment = false;
        await student.save({ session });

        // Aggiorna la classe
        await Class.findByIdAndUpdate(
            classId,
            { $addToSet: { students: student._id } },
            { session }
        );

        await session.commitTransaction();

        // Popola i dati per la risposta
        const updatedStudent = await Student.findById(id)
            .populate('schoolId', 'nome tipo_istituto')
            .populate('classId', 'year section academicYear')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email');

        res.json({
            success: true,
            data: updatedStudent,
            message: 'Classe assegnata con successo'
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Errore in assignClass:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Errore nell\'assegnazione della classe'
        });
    } finally {
        session.endSession();
    }
},

    // GET - Recupera studenti senza classe
    getStudentsWithoutClass: async (req, res) => {
        try {
            const students = await Student.find({
                schoolId: req.user.schoolId,
                isActive: true,
                needsClassAssignment: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            })
            .populate('schoolId', 'nome tipo_istituto')
            .populate('mainTeacher', 'firstName lastName email')
            .populate('teachers', 'firstName lastName email')
            .sort({ lastName: 1, firstName: 1 });

            res.json({
                success: true,
                data: students
            });
        } catch (error) {
            console.error('Errore in getStudentsWithoutClass:', error);
            res.status(500).json({
                success: false,
                message: 'Errore nel recupero degli studenti senza classe'
            });
        }
    },

    // POST - Aggiunge un insegnante allo studente
    addTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id } = req.params;
            const { teacherId } = req.body;

            const student = await Student.findOne({
                _id: id,
                schoolId: req.user.schoolId,
                isActive: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            });

            if (!student) {
                throw new Error('Studente non trovato o non hai i permessi');
            }

            // Verifica se l'insegnante è già associato
            if (student.teachers.includes(teacherId)) {
                throw new Error('Insegnante già associato allo studente');
            }

            // Aggiungi l'insegnante
            student.teachers.push(teacherId);
            await student.save({ session });

            // Aggiorna anche la classe correlata
            await Class.findByIdAndUpdate(
                student.classId,
                { $addToSet: { teachers: teacherId } },
                { session }
            );

            await session.commitTransaction();

            const updatedStudent = await Student.findById(id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('classId', 'year section academicYear')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.json({
                success: true,
                data: updatedStudent,
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

    // DELETE - Rimuove un insegnante dallo studente
    removeTeacher: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { id, teacherId } = req.params;

            const student = await Student.findOne({
                _id: id,
                schoolId: req.user.schoolId,
                isActive: true,
                $or: [
                    { mainTeacher: req.user._id },
                    { teachers: req.user._id }
                ]
            });

            if (!student) {
                throw new Error('Studente non trovato o non hai i permessi');
            }

            // Verifica che non sia il mainTeacher
            if (student.mainTeacher.toString() === teacherId) {
                throw new Error('Non puoi rimuovere l\'insegnante principale');
            }

            // Rimuovi l'insegnante
            student.teachers = student.teachers.filter(
                t => t.toString() !== teacherId
            );
            await student.save({ session });

            // Aggiorna la classe solo se l'insegnante non è associato ad altri studenti
            const otherStudentsWithTeacher = await Student.exists({
                _id: { $ne: id },
                classId: student.classId,
                teachers: teacherId
            });

            if (!otherStudentsWithTeacher) {
                await Class.findByIdAndUpdate(
                    student.classId,
                    { $pull: { teachers: teacherId } },
                    { session }
                );
            }

            await session.commitTransaction();

            const updatedStudent = await Student.findById(id)
                .populate('schoolId', 'nome tipo_istituto')
                .populate('classId', 'year section academicYear')
                .populate('mainTeacher', 'firstName lastName email')
                .populate('teachers', 'firstName lastName email');

            res.json({
                success: true,
                data: updatedStudent,
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

    getSchoolStudents: async (req, res) => {
        try {
            // Usa schoolId direttamente da req.user invece di req.user.school._id
            const schoolId = req.user.schoolId;
            
            if (!schoolId) {
                return res.status(400).json({
                    success: false,
                    message: 'SchoolId non trovato per l\'utente corrente'
                });
            }
    
            console.log('Fetching students for school:', schoolId);
            
            const students = await Student.find({ 
                schoolId: schoolId,
                isActive: true 
            })
            .select('firstName lastName gender section classId notes needsClassAssignment')
            .populate('classId', 'year section academicYear')
            .sort({ lastName: 1, firstName: 1 });
    
            res.json({
                success: true,
                data: students
            });
        } catch (error) {
            console.error('Error fetching school students:', error);
            res.status(500).json({
                success: false,
                message: 'Errore nel recupero degli studenti della scuola'
            });
        }
    }




};















module.exports = studentController;