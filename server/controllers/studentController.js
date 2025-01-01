const Student = require('../models/Student');
const School = require('../models/Schools');
const Class = require('../models/Class');
const mongoose = require('mongoose');

const studentController = {
    
    
    
    // GET - Recupera tutti gli studenti
    getStudents: async (req, res) => {
        try {
            const students = await Student.find({ scuola: req.user.scuola })
                .populate('classe', 'nome sezione annoScolastico') // Popola i dati della classe
                .sort({ cognome: 1, nome: 1 });
    
            // Mappiamo i dati per assicurarci che classe e sezione siano stringhe
            const formattedStudents = students.map(student => ({
                _id: student._id,
                nome: student.nome,
                cognome: student.cognome,
                classe: student.classe?.nome || '', // Usa il nome della classe popolata
                sezione: student.classe?.sezione || '',
                sesso: student.sesso,
                dataNascita: student.dataNascita,
                note: student.note
            }));
    
            res.json({ 
                success: true, 
                data: formattedStudents 
            });
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

    
};

module.exports = studentController;