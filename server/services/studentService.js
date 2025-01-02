// services/studentService.js
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Class = require('../models/Class');

class StudentService {
    // Verifica se uno studente può essere modificato
    static async canModifyStudent(studentId, userId) {
        const student = await Student.findById(studentId);
        if (!student) return false;
        
        return student.mainTeacher.equals(userId) || 
               student.teachers.some(teacher => teacher.equals(userId));
    }

    // Gestisce il trasferimento di uno studente
    static async transferStudent(studentId, newClassId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const student = await Student.findById(studentId);
            const newClass = await Class.findById(newClassId);

            if (!student || !newClass) {
                throw new Error('Studente o classe non trovati');
            }

            // Rimuovi lo studente dalla vecchia classe
            await Class.findByIdAndUpdate(
                student.classId,
                { $pull: { students: studentId } },
                { session }
            );

            // Aggiungi lo studente alla nuova classe
            await Class.findByIdAndUpdate(
                newClassId,
                { $addToSet: { students: studentId } },
                { session }
            );

            // Aggiorna i dati dello studente
            student.classId = newClassId;
            student.year = newClass.year;
            student.section = newClass.section;
            student.academicYear = newClass.academicYear;
            await student.save({ session });

            await session.commitTransaction();
            return student;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    static async canAssignClass(studentId, classId, userId) {
        const [student, targetClass] = await Promise.all([
            Student.findById(studentId),
            Class.findById(classId)
        ]);

        if (!student || !targetClass) return false;

        // Verifica che:
        // 1. Lo studente necessiti di assegnazione classe
        // 2. L'utente abbia i permessi
        // 3. La classe appartenga alla stessa scuola
        return student.needsClassAssignment &&
               (student.mainTeacher.equals(userId) || student.teachers.some(t => t.equals(userId))) &&
               student.schoolId.equals(targetClass.schoolId);
    }

    // Nuovo metodo per assegnare una classe a uno studente
    static async assignClass(studentId, classId) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const [student, targetClass] = await Promise.all([
                Student.findById(studentId),
                Class.findById(classId)
            ]);

            if (!student || !targetClass) {
                throw new Error('Studente o classe non trovati');
            }

            if (!student.needsClassAssignment) {
                throw new Error('Lo studente ha già una classe assegnata');
            }

            // Aggiorna lo studente
            student.classId = classId;
            student.section = targetClass.section;
            student.needsClassAssignment = false;

            // Aggiorna la classe
            await Class.findByIdAndUpdate(
                classId,
                { $addToSet: { students: studentId } },
                { session }
            );

            await student.save({ session });
            await session.commitTransaction();

            return student;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    // Nuovo metodo per ottenere studenti senza classe
    static async getStudentsWithoutClass(schoolId, userId) {
        return Student.find({
            schoolId,
            needsClassAssignment: true,
            isActive: true,
            $or: [
                { mainTeacher: userId },
                { teachers: userId }
            ]
        })
        .populate('schoolId', 'nome tipo_istituto')
        .populate('mainTeacher', 'firstName lastName email')
        .populate('teachers', 'firstName lastName email')
        .sort({ lastName: 1, firstName: 1 });
    }



}

module.exports = StudentService;