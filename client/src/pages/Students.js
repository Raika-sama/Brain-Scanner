// client/src/pages/Students.js
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Button, 
    Container,
    Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StudentsTab from '../components/tabs/StudentsTab';
import StudentModal from '../components/StudentModal';
import { useApp } from '../context/AppContext';
import { studentService } from '../services/studentService';

const Students = () => {
    const { state } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);

    const userData = useMemo(() => {
        if (!state.user) return null;
        const user = state.user?.user || state.user;
        return user;
    }, [state.user]);

    const schoolConfig = useMemo(() => {
        if (!userData?.school?._id) return null;
        return {
            _id: userData.school._id,
            tipo_istituto: userData.school.tipo_istituto,
            sezioni_disponibili: userData.school.sezioni_disponibili || ['A', 'B', 'C']
        };
    }, [userData?.school]);

    useEffect(() => {
        const loadStudents = async () => {
            if (!userData?.school?._id) {
                setLoading(false);
                return;
            }
            
            const result = await studentService.fetchStudents();
            if (result.success) {
                setStudents(result.data);
            }
            setLoading(false);
        };

        loadStudents();
    }, [userData?.school?._id]);

    const handleOpenModal = () => {
        if (!userData?._id) {
            toast.error('Devi essere autenticato per aggiungere uno studente');
            return;
        }
        if (!schoolConfig) {
            toast.error('Nessuna scuola associata al tuo profilo');
            return;
        }
        setShowModal(true);
    };

    const handleSubmit = async (studentData) => {
        const result = await studentService.createStudent(studentData);
        if (result.success) {
            setStudents(prev => [...prev, result.data]);
            setShowModal(false);
        }
        return result;
    };

    const filteredStudents = useMemo(() => {
        return students.filter(student => student.isActive);
    }, [students]);

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper elevation={0} sx={{ 
                    p: 3, 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: 'background.default' 
                }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Gestione Studenti
                        </Typography>
                    </Box>
                    
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                        disabled={!schoolConfig}
                    >
                        Aggiungi Studente
                    </Button>
                </Paper>

                {!schoolConfig && (
                    <Alert severity="warning">
                        Nessuna scuola associata al tuo profilo. Impossibile gestire gli studenti.
                    </Alert>
                )}

                {showModal && (
                    <StudentModal
                        isOpen={showModal}
                        onClose={() => {
                            setShowModal(false);
                            setSelectedStudent(null);
                        }}
                        onSubmit={handleSubmit}
                        student={selectedStudent}
                        schoolConfig={schoolConfig}
                        userId={userData?._id}
                    />
                )}

                <Paper sx={{ p: 3 }}>
                    <StudentsTab 
                        students={filteredStudents}
                        loading={loading}
                        onEditStudent={(student) => {
                            setSelectedStudent(student);
                            setShowModal(true);
                        }}
                        showActions={true}
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default Students;