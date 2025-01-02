// services/studentService.js

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
}

module.exports = StudentService;