// client/src/pages/Students.js
import React, { useState, useMemo, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Button, 
    Container,
    Alert,
    CircularProgress
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import StudentsTab from '../components/tabs/StudentsTab';
import StudentModal from '../components/StudentModal';
import { useApp } from '../context/AppContext';

const Students = () => {
    const { state, fetchStudents, addStudent } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memo per i dati dell'utente
    const userData = useMemo(() => {
        if (!state.user) return null;
        const user = state.user?.user || state.user;
        return user;
    }, [state.user]);

    // Memo per la configurazione della scuola
    const schoolConfig = useMemo(() => {
        if (!userData?.school?._id) return null;
        return {
            _id: userData.school._id,
            tipo_istituto: userData.school.tipo_istituto,
            sezioni_disponibili: userData.school.sezioni_disponibili || ['A', 'B', 'C']
        };
    }, [userData?.school]);

    // Effect per caricare gli studenti
    useEffect(() => {
        const loadStudents = async () => {
            if (!userData?.school?._id) {
                setIsLoading(false);
                return;
            }

            try {
                setError(null);
                setIsLoading(true);
                await fetchStudents();
            } catch (err) {
                setError(err.message || 'Errore nel caricamento degli studenti');
                toast.error('Errore nel caricamento degli studenti');
            } finally {
                setIsLoading(false);
            }
        };

        loadStudents();
    }, [userData?.school?._id]); // Rimuovo fetchStudents dalle dipendenze per evitare loop

    // Gestione apertura modale
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

    // Gestione chiusura modale
    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedStudent(null);
    };

    // Gestione submit del form studente
    const handleSubmit = async (studentData) => {
        try {
            if (!schoolConfig?._id || !userData?._id) {
                throw new Error('Configurazione non valida');
            }

            const studentPayload = {
                ...studentData,
                schoolId: schoolConfig._id,
                mainTeacher: userData._id,
                isActive: true
            };

            const result = await addStudent(studentPayload);
            
            if (result.success) {
                toast.success('Studente aggiunto con successo');
                handleCloseModal();
                return result;
            }

            throw new Error(result.message || 'Errore durante l\'aggiunta dello studente');
        } catch (error) {
            const errorMessage = error.message || 'Errore durante l\'aggiunta dello studente';
            toast.error(errorMessage);
            console.error('Errore durante l\'aggiunta dello studente:', error);
            return { 
                success: false, 
                message: errorMessage 
            };
        }
    };

    // Filtro studenti attivi
    const filteredStudents = useMemo(() => {
        return (state.students || []).filter(student => student?.isActive);
    }, [state.students]);

    // Gestione modifica studente
    const handleEditStudent = (student) => {
        setSelectedStudent(student);
        setShowModal(true);
    };

    if (error) {
        return (
            <Container maxWidth="xl">
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

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
                        disabled={!schoolConfig || isLoading}
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
                        onClose={handleCloseModal}
                        onSubmit={handleSubmit}
                        student={selectedStudent}
                        schoolConfig={schoolConfig}
                        userId={userData?._id}
                    />
                )}

                <Paper sx={{ p: 3 }}>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <StudentsTab 
                            students={filteredStudents}
                            loading={isLoading}
                            onEditStudent={handleEditStudent}
                            showActions={true}
                        />
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Students;