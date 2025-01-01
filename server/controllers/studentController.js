const Student = require('../models/Student');
const School = require('../models/Schools');

const studentController = {
    // Metodi esistenti
    getStudents: async (req, res) => {
        try {
            const students = await Student.find();
            res.json({ success: true, data: students });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nel recupero degli studenti' 
            });
        }
    },

    getStudent: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id);
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

    getStudentAnalysis: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id);
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

    createStudent: async (req, res) => {
        try {
            const student = new Student(req.body);
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

    updateStudent: async (req, res) => {
        try {
            const updatedStudent = await Student.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );
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

    deleteStudent: async (req, res) => {
        try {
            const deletedStudent = await Student.findByIdAndDelete(req.params.id);
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

    // Nuovo metodo per l'importazione batch
    createBatchStudents: async (req, res) => {
        try {
            const { students } = req.body;
            
            if (!Array.isArray(students) || students.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Nessuno studente da importare'
                });
            }

            // Recupera la configurazione della scuola
            const school = await School.findById(students[0].school);
            if (!school) {
                return res.status(404).json({
                    success: false,
                    message: 'Scuola non trovata'
                });
            }

            // Valida tutti gli studenti
            const { validStudents, errors } = await Student.validateBatch(students, school);

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errori di validazione',
                    errors
                });
            }

            // Importa gli studenti validi
            const createdStudents = await Student.insertMany(validStudents, {
                ordered: false // Continua anche se ci sono errori
            });

            res.status(201).json({
                success: true,
                message: `${createdStudents.length} studenti importati con successo`,
                data: createdStudents
            });

        } catch (error) {
            console.error("Errore nell'importazione batch:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Errore durante l'importazione degli studenti"
            });
        }
    }
};

module.exports = studentController;