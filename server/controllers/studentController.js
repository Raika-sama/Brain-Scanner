const Student = require('../models/Student'); // Dovrai creare anche questo model



const studentController = {
    // GET tutti gli studenti
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

    // GET singolo studente
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

    // GET analisi studente
    getStudentAnalysis: async (req, res) => {
        try {
            const student = await Student.findById(req.params.id);
            if (!student) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Studente non trovato' 
                });
            }
            // Implementa la logica per l'analisi
            res.json({ success: true, data: { student, analysis: {} } });
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Errore nel recupero dell\'analisi' 
            });
        }
    },

    // POST nuovo studente
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

    // PUT aggiorna studente
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

    // DELETE elimina studente
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
    }
};

module.exports = studentController;