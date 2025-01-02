const Class = require('../models/Class');
const { startSession } = require('mongoose');

class ClassService {
    // Trova o crea una classe, aggiornata con teacherId
    static async findOrCreateClass(classData, session) {
        const { number, section, schoolYear, schoolId, teacherId } = classData;

        try {
            // Cerca una classe esistente
            let existingClass = await Class.findOne({
                number,
                section,
                schoolYear,
                schoolId,
                $or: [
                    { teacherId },
                    { teachers: teacherId }
                ]
            }).session(session);

            // Se non esiste, creala
            if (!existingClass) {
                existingClass = new Class({
                    number,
                    section,
                    schoolYear,
                    schoolId,
                    teacherId,         // Aggiungiamo il teacherId
                    teachers: [teacherId],  // Inizializziamo l'array teachers
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

    // Calcola l'anno scolastico corrente (invariato)
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

    // Valida la classe rispetto al tipo di scuola (invariato)
    static validateClassNumber(number, schoolType) {
        const num = parseInt(number);
        if (isNaN(num)) return false;

        switch (schoolType) {
            case 'middle_school':
                return num >= 1 && num <= 3;
            case 'high_school':
                return num >= 1 && num <= 5;
            default:
                return false;
        }
    }

    // Aggiorna gli studenti di una classe, aggiunto controllo teacher
    static async updateClassStudents(classId, studentId, teacherId, action = 'add', session) {
        try {
            // Verifica che l'utente abbia i permessi per modificare la classe
            const classExists = await Class.findOne({
                _id: classId,
                $or: [
                    { teacherId },
                    { teachers: teacherId }
                ]
            });

            if (!classExists) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

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

    // Verifica duplicati in una classe, aggiunto controllo teacher
    static async checkDuplicateStudent(firstName, lastName, classId, schoolId, teacherId) {
        try {
            const existingStudent = await Class.findOne({
                _id: classId,
                schoolId,
                $or: [
                    { teacherId },
                    { teachers: teacherId }
                ],
                students: {
                    $elemMatch: {
                        firstName: new RegExp(`^${firstName}$`, 'i'),
                        lastName: new RegExp(`^${lastName}$`, 'i')
                    }
                }
            });

            return !!existingStudent;
        } catch (error) {
            console.error('Errore in checkDuplicateStudent:', error);
            throw new Error(`Errore nella verifica dei duplicati: ${error.message}`);
        }
    }

    // Nuovo metodo per gestire i teacher
    static async updateClassTeachers(classId, teacherToModify, currentTeacherId, action = 'add') {
        const session = await startSession();
        session.startTransaction();

        try {
            const classDoc = await Class.findOne({
                _id: classId,
                $or: [
                    { teacherId: currentTeacherId },
                    { teachers: currentTeacherId }
                ]
            }).session(session);

            if (!classDoc) {
                throw new Error('Classe non trovata o permessi insufficienti');
            }

            if (action === 'add') {
                if (!classDoc.teachers.includes(teacherToModify)) {
                    classDoc.teachers.push(teacherToModify);
                }
            } else if (action === 'remove') {
                // Non permettere la rimozione del teacherId principale
                if (teacherToModify.equals(classDoc.teacherId)) {
                    throw new Error('Non puoi rimuovere il teacher principale');
                }
                classDoc.teachers = classDoc.teachers.filter(t => !t.equals(teacherToModify));
            }

            await classDoc.save({ session });
            await session.commitTransaction();
            return classDoc;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }
}

module.exports = ClassService;