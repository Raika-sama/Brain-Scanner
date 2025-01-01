const Student = require('../models/Student');
const School = require('../models/Schools');
const Class = require('../models/Class');
const ClassService = require('../services/classService');
const mongoose = require('mongoose');

const studentController = {
    // GET - Recupera tutti gli studenti con filtri
    getStudents: async (req, res) => {
        try {
            const { search, classe, sezione } = req.query;
            const query = { school: req.user.scuola };

            // Applica i filtri se presenti
            if (search) {
                query.$or = [
                    { nome: new RegExp(search, 'i') },
                    { cognome: new RegExp(search, 'i') }
                ];
            }
            
            const students = await Student.find(query)
                .populate('classe', 'numero sezione annoScolastico')
                .sort({ cognome: 1, nome: 1 });

            const formattedStudents = students.map(student => ({
                _id: student._id,
                nome: student.nome,
                cognome: student.cognome,
                classe: student.classe?.numero || '',
                sezione: student.classe?.sezione || '',
                sesso: student.sesso,
                note: student.note
            }));

            res.json({ success: true, data: formattedStudents });
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
                school: req.user.scuola
            }).populate('classe', 'numero sezione annoScolastico');
            
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
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
                sesso, 
                classe: classeId,  // Ora riceviamo direttamente l'ID della classe
                sezione,
                annoScolastico,
                note 
            } = req.body;
            const school = req.user.schoolId;  // Uso schoolId invece di scuola per consistenza

            // Verifica duplicati
            const existingStudent = await Student.findOne({
                nome,
                cognome,
                school,
                classe: classeId,
                sezione,
                annoScolastico
            });

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: 'Esiste già uno studente con questo nome e cognome in questa classe'
                });
            }

            // Verifica che la classe esista
            const classeExists = await Class.findById(classeId);
            if (!classeExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Classe non trovata'
                });
            }

            // Crea lo studente
            const student = new Student({
                nome,
                cognome,
                sesso: sesso.toUpperCase(),
                classe: classeId,
                sezione,
                annoScolastico,
                school,
                teachers: [req.user._id],  // Aggiungi l'utente corrente come insegnante
                note: note || ''
            });

            await student.save({ session });

            // Aggiorna la classe con il nuovo studente
            await Class.findByIdAndUpdate(
                classeId,
                { $addToSet: { students: student._id } },
                { session }
            );

            await session.commitTransaction();

            // Popola i dati per la risposta
            const populatedStudent = await Student.findById(student._id)
                .populate('classe', 'number section schoolYear')  // Aggiornati i nomi dei campi
                .populate('teachers', 'firstName lastName email');  // Aggiungiamo i dati degli insegnanti

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
            const { nome, cognome, sesso, classe: numeroClasse, sezione, note } = req.body;
            
            // Se viene cambiata la classe, aggiorna le relazioni
            if (numeroClasse && sezione) {
                const classe = await ClassService.findOrCreateClass({
                    numero: numeroClasse,
                    sezione,
                    annoScolastico: ClassService.getCurrentSchoolYear(),
                    school: req.user.scuola
                }, session);

                // Rimuovi lo studente dalla vecchia classe e aggiungilo alla nuova
                await Class.updateMany(
                    { students: req.params.id },
                    { $pull: { students: req.params.id } },
                    { session }
                );

                await Class.findByIdAndUpdate(
                    classe._id,
                    { $addToSet: { students: req.params.id } },
                    { session }
                );

                req.body.classe = classe._id;
            }

            const updatedStudent = await Student.findOneAndUpdate(
                { _id: req.params.id, school: req.user.scuola },
                { ...req.body, sesso: sesso?.toUpperCase() },
                { new: true, runValidators: true, session }
            ).populate('classe', 'numero sezione annoScolastico');

            if (!updatedStudent) {
                throw new Error('Studente non trovato');
            }

            await session.commitTransaction();
            res.json({ success: true, data: updatedStudent });

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
                school: req.user.scuola
            });

            if (!student) {
                throw new Error('Studente non trovato');
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
            res.json({ success: true, message: 'Studente eliminato con successo' });

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
    }
};

module.exports = studentController;