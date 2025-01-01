const Class = require('../models/Class');
const { startSession } = require('mongoose');

class ClassService {
    // Trova o crea una classe
    static async findOrCreateClass(classData, session) {
        const { numero, sezione, annoScolastico, school } = classData;

        try {
            // Cerca una classe esistente
            let existingClass = await Class.findOne({
                numero,
                sezione,
                annoScolastico,
                school
            }).session(session);

            // Se non esiste, creala
            if (!existingClass) {
                existingClass = new Class({
                    numero,
                    sezione,
                    annoScolastico,
                    school,
                    students: []
                });
                await existingClass.save({ session });
            }

            return existingClass;
        } catch (error) {
            console.error('Errore in findOrCreateClass:', error);
            throw new Error(`Errore nella gestione della classe: ${error.message}`);
        }
    }

    // Calcola l'anno scolastico corrente
    static getCurrentSchoolYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const schoolYear = month >= 9 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
        console.log('Anno scolastico calcolato:', schoolYear); // Aggiungi questo log
        return schoolYear;
    }

    // Valida la classe rispetto al tipo di scuola
    static validateClassNumber(numero, schoolType) {
        const num = parseInt(numero);
        if (isNaN(num)) return false;

        switch (schoolType) {
            case 'primo_grado':
                return num >= 1 && num <= 3;
            case 'secondo_grado':
                return num >= 1 && num <= 5;
            default:
                return false;
        }
    }

    // Nuovo metodo per aggiornare gli studenti di una classe
    static async updateClassStudents(classId, studentId, action = 'add', session) {
        try {
            const updateOperation = action === 'add' 
                ? { $addToSet: { students: studentId } }
                : { $pull: { students: studentId } };

            const updatedClass = await Class.findByIdAndUpdate(
                classId,
                updateOperation,
                { new: true, session }
            );

            if (!updatedClass) {
                throw new Error('Classe non trovata');
            }

            return updatedClass;
        } catch (error) {
            console.error('Errore in updateClassStudents:', error);
            throw new Error(`Errore nell'aggiornamento degli studenti della classe: ${error.message}`);
        }
    }

    // Nuovo metodo per verificare duplicati in una classe
    static async checkDuplicateStudent(nome, cognome, classId, school) {
        try {
            const existingStudent = await Class.findOne({
                _id: classId,
                school,
                students: {
                    $elemMatch: {
                        nome: new RegExp(`^${nome}$`, 'i'),
                        cognome: new RegExp(`^${cognome}$`, 'i')
                    }
                }
            });

            return !!existingStudent;
        } catch (error) {
            console.error('Errore in checkDuplicateStudent:', error);
            throw new Error(`Errore nella verifica dei duplicati: ${error.message}`);
        }
    }
}

module.exports = ClassService;