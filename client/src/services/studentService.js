// client/src/services/studentService.js
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

class StudentService {
    async fetchStudents() {
        try {
            const response = await axios.get('/api/students/school/assigned');
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Errore nel caricamento degli studenti');
            return {
                success: false,
                error: error.message || 'Errore nel caricamento degli studenti'
            };
        }
    }

    async createStudent(studentData) {
        try {
            const payload = {
                firstName: studentData.firstName.trim(),
                lastName: studentData.lastName.trim(),
                gender: studentData.gender.toUpperCase(),
                notes: studentData.notes?.trim() || ''
            };

            const response = await axios.post('/api/students', payload);
            if (response.data.success) {
                toast.success('Studente creato con successo');
                return {
                    success: true,
                    data: response.data.data
                };
            }
            throw new Error(response.data.message);
        } catch (error) {
            console.error('Error creating student:', error);
            const errorMessage = error.response?.data?.message || 'Errore durante il salvataggio';
            toast.error(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        }
    }
}

export const studentService = new StudentService();