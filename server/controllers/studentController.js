const Student = require('../models/Student');
const School = require('../models/Schools');
const Class = require('../models/Class');
const mongoose = require('mongoose');

const studentController = {
    // GET - Recupera tutti gli studenti
    getStudents: async (req, res) => {
        try {
            const students = await Student.find({ scuola: req.user.scuola })
                .populate('classe', 'nome sezione annoScolastico')
                .sort({ cognome: 1, nome: 1 });
            res.json({ success: true, data: students });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nel recupero degli studenti' 
            });
        }
    },

    // GET - Recupera uno studente specifico
    getStudent: async (req, res) => {
        try {
            const student = await Student.findOne({
                _id: req.params.id,
                scuola: req.user.scuola
            }).populate('classe', 'nome sezione annoScolastico');
            
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
                });
            }
            res.json({ success: true, data: student });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nel recupero dello studente' 
            });
        }
    },

    // GET - Recupera l'analisi di uno studente
    getStudentAnalysis: async (req, res) => {
        try {
            const student = await Student.findOne({
                _id: req.params.id,
                scuola: req.user.scuola
            }).populate('classe');
            
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
                });
            }
            res.json({ success: true, data: { student, analysis: {} } });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nel recupero dell\'analisi' 
            });
        }
    },

    // POST - Crea un nuovo studente
    createStudent: async (req, res) => {
        try {
            const studentData = {
                ...req.body,
                scuola: req.user.scuola,
                sesso: req.body.sesso.toUpperCase()
            };

            // Aggiungi il codiceFiscale solo se presente
            if (req.body.codiceFiscale) {
                studentData.codiceFiscale = req.body.codiceFiscale.toUpperCase();
            }

            const student = new Student(studentData);
            const savedStudent = await student.save();
            
            res.status(201).json({ 
                success: true, 
                data: savedStudent 
            });
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                message: error.message || 'Errore nella creazione dello studente' 
            });
        }
    },

    // PUT - Aggiorna uno studente esistente
    updateStudent: async (req, res) => {
        try {
            const updateData = { ...req.body };
            if (updateData.codiceFiscale) {
                updateData.codiceFiscale = updateData.codiceFiscale.toUpperCase();
            }
            if (updateData.sesso) {
                updateData.sesso = updateData.sesso.toUpperCase();
            }

            const updatedStudent = await Student.findOneAndUpdate(
                { _id: req.params.id, scuola: req.user.scuola },
                updateData,
                { new: true, runValidators: true }
            ).populate('classe', 'nome sezione annoScolastico');

            if (!updatedStudent) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
                });
            }
            res.json({ success: true, data: updatedStudent });
        } catch (error) {
            res.status(400).json({ 
                success: false, 
                message: error.message || 'Errore nell\'aggiornamento dello studente' 
            });
        }
    },

    // DELETE - Elimina uno studente
    deleteStudent: async (req, res) => {
        try {
            const deletedStudent = await Student.findOneAndDelete({
                _id: req.params.id,
                scuola: req.user.scuola
            });

            if (!deletedStudent) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
                });
            }
            res.json({ 
                success: true, 
                message: 'Studente eliminato con successo' 
            });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nell\'eliminazione dello studente' 
            });
        }
    },

    // POST - Importazione batch di studenti
    createBatchStudents: async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { students } = req.body;
            const results = {
                imported: 0,
                updated: 0,
                errors: [],
                classesCreated: new Set(),
                classesUpdated: new Set()
            };

            if (!Array.isArray(students) || students.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nessuno studente da importare'
                });
            }

            // Raggruppa studenti per classe
            const studentsByClass = students.reduce((acc, student) => {
                const classKey = `${student.classe}${student.sezione}`;
                if (!acc[classKey]) acc[classKey] = [];
                acc[classKey].push(student);
                return acc;
            }, {});

            // Processo ogni classe
            for (const [classKey, classStudents] of Object.entries(studentsByClass)) {
                const [anno, sezione] = [classKey.slice(0, -1), classKey.slice(-1)];
                
                try {
                    // Trova o crea la classe
                    let classe = await Class.findOne({
                        nome: anno,
                        sezione: sezione,
                        annoScolastico: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
                        scuola: req.user.scuola
                    }).session(session);

                    if (!classe) {
                        classe = await Class.create([{
                            nome: anno,
                            sezione: sezione,
                            annoScolastico: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
                            scuola: req.user.scuola
                        }], { session });
                        classe = classe[0];
                        results.classesCreated.add(classKey);
                    } else {
                        results.classesUpdated.add(classKey);
                    }

                    // Processo gli studenti della classe
                    for (const studentData of classStudents) {
                        try {
                            // Cerca studente esistente per codice fiscale
                            const existingStudent = await Student.findOne({
                                codiceFiscale: studentData.codiceFiscale.toUpperCase(),
                                scuola: req.user.scuola
                            }).session(session);

                            if (existingStudent) {
                                // Aggiorna studente esistente
                                await Student.updateOne(
                                    { _id: existingStudent._id },
                                    {
                                        $set: {
                                            nome: studentData.nome,
                                            cognome: studentData.cognome,
                                            dataNascita: new Date(studentData.dataNascita),
                                            sesso: studentData.sesso.toUpperCase(),
                                            classe: classe._id
                                        }
                                    }
                                ).session(session);
                                results.updated++;
                            } else {
                                // Crea nuovo studente
                                await Student.create([{
                                    ...studentData,
                                    codiceFiscale: studentData.codiceFiscale.toUpperCase(),
                                    sesso: studentData.sesso.toUpperCase(),
                                    dataNascita: new Date(studentData.dataNascita),
                                    classe: classe._id,
                                    scuola: req.user.scuola
                                }], { session });
                                results.imported++;
                            }
                        } catch (error) {
                            results.errors.push({
                                student: `${studentData.cognome} ${studentData.nome}`,
                                error: error.message
                            });
                        }
                    }
                } catch (error) {
                    results.errors.push({
                        class: classKey,
                        error: error.message
                    });
                }
            }

            // Gestione dei risultati
            if (results.errors.length > 0 && (results.imported > 0 || results.updated > 0)) {
                // Ci sono errori ma anche successi
                await session.commitTransaction();
                res.status(207).json({
                    success: true,
                    data: {
                        ...results,
                        classesCreated: Array.from(results.classesCreated),
                        classesUpdated: Array.from(results.classesUpdated)
                    },
                    message: 'Importazione completata con alcuni errori'
                });
            } else if (results.errors.length > 0) {
                // Solo errori
                await session.abortTransaction();
                res.status(400).json({
                    success: false,
                    errors: results.errors,
                    message: 'Importazione fallita'
                });
            } else {
                // Successo completo
                await session.commitTransaction();
                res.status(200).json({
                    success: true,
                    data: {
                        ...results,
                        classesCreated: Array.from(results.classesCreated),
                        classesUpdated: Array.from(results.classesUpdated)
                    },
                    message: 'Importazione completata con successo'
                });
            }
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({
                success: false,
                message: 'Errore durante l\'importazione',
                error: error.message
            });
        } finally {
            session.endSession();
        }
    }
};

module.exports = studentController;