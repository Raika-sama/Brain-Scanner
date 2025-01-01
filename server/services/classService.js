const Class = require('../models/Class');
const { startSession } = require('mongoose');

class ClassService {
    // Trova o crea una classe
    static async findOrCreateClass(classData, session) {
        const { nome, sezione, annoScolastico, scuola } = classData;

        // Cerca una classe esistente
        let existingClass = await Class.findOne({
            nome,
            sezione,
            annoScolastico,
            scuola
        }).session(session);

        // Se non esiste, creala
        if (!existingClass) {
            existingClass = new Class({
                nome,
                sezione,
                annoScolastico,
                scuola,
                studenti: []
            });
            await existingClass.save({ session });
        }

        return existingClass;
    }

    // Calcola l'anno scolastico corrente
    static getCurrentSchoolYear() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth() returns 0-11

        // Se siamo dopo agosto, l'anno scolastico è year/year+1
        // altrimenti è year-1/year
        if (month >= 9) {
            return `${year}/${year + 1}`;
        }
        return `${year - 1}/${year}`;
    }

    // Valida la classe rispetto al tipo di scuola
    static validateClassNumber(classNumber, schoolType) {
        const num = parseInt(classNumber);
        if (isNaN(num)) return false;

        if (schoolType === 'primo_grado') {
            return num >= 1 && num <= 3;
        } else if (schoolType === 'secondo_grado') {
            return num >= 1 && num <= 5;
        }
        return false;
    }
}

module.exports = ClassService;