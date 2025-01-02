// services/classService.js

class ClassService {
    static getCurrentSchoolYear() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const month = now.getMonth() + 1; // JavaScript months are 0-based
        
        // Se siamo dopo Settembre, l'anno scolastico è currentYear/currentYear+1
        // altrimenti è currentYear-1/currentYear
        if (month >= 9) { // Da Settembre
            return `${currentYear}/${currentYear + 1}`;
        } else {
            return `${currentYear - 1}/${currentYear}`;
        }
    }

    // Nuovo metodo per verificare se una classe può essere modificata
    static async canModifyClass(classId, userId) {
        const classe = await Class.findById(classId);
        if (!classe) return false;
        
        return classe.mainTeacher.equals(userId) || 
               classe.teachers.some(teacher => teacher.equals(userId));
    }

    // Nuovo metodo per gestire l'avanzamento di classe
    static async promoteClass(classId) {
        const classe = await Class.findById(classId);
        if (!classe) throw new Error('Classe non trovata');

        // Incrementa l'anno solo se non è l'ultimo anno
        if (classe.year < 5) {
            classe.year += 1;
            await classe.save();

            // Aggiorna anche gli studenti
            await Student.updateMany(
                { classId: classId },
                { year: classe.year }
            );
        }

        return classe;
    }

    // Nuovo metodo per la gestione degli studenti nella classe
    static async updateClassStudents(classId, studentIds) {
        const classe = await Class.findById(classId);
        if (!classe) throw new Error('Classe non trovata');

        // Aggiorna gli studenti della classe
        classe.students = studentIds;
        await classe.save();

        // Aggiorna i riferimenti negli studenti
        await Student.updateMany(
            { _id: { $in: studentIds } },
            { 
                classId: classId,
                year: classe.year,
                section: classe.section,
                academicYear: classe.academicYear
            }
        );

        return classe;
    }
}

module.exports = ClassService;