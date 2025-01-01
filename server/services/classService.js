const Class = require('../models/Class');
const { startSession } = require('mongoose');

class ClassService {
    // Trova o crea una classe
    static async findOrCreateClass(classData, session) {
        const { number, section, schoolYear, schoolId } = classData;  // Cambiati i nomi dei campi

        try {
            // Cerca una classe esistente
            let existingClass = await Class.findOne({
                number,
                section,
                schoolYear,
                schoolId
            }).session(session);

            // Se non esiste, creala
            if (!existingClass) {
                existingClass = new Class({
                    number,
                    section,
                    schoolYear,
                    schoolId,
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

    // Calcola l'anno scolastico corrente (questo metodo è già corretto)
    static getCurrentSchoolYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        
        if (currentMonth >= 9) {
            return `${currentYear}/${currentYear + 1}`;
        } else {
            return `${currentYear - 1}/${currentYear}`;
        }
    }

    // Valida la classe rispetto al tipo di scuola
    static validateClassNumber(number, schoolType) {  // Cambiato da numero a number
        const num = parseInt(number);
        if (isNaN(num)) return false;

        switch (schoolType) {
            case 'middle_school':  // Cambiato da primo_grado a middle_school
                return num >= 1 && num <= 3;
            case 'high_school':    // Cambiato da secondo_grado a high_school
                return num >= 1 && num <= 5;
            default:
                return false;
        }
    }

    // Aggiorna gli studenti di una classe
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

    // Verifica duplicati in una classe
    static async checkDuplicateStudent(firstName, lastName, classId, schoolId) {  // Cambiati i nomi dei parametri
        try {
            const existingStudent = await Class.findOne({
                _id: classId,
                schoolId,
                students: {
                    $elemMatch: {
                        firstName: new RegExp(`^${firstName}$`, 'i'),  // Cambiato da nome a firstName
                        lastName: new RegExp(`^${lastName}$`, 'i')     // Cambiato da cognome a lastName
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