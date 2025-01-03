// src/pages/Students.js
import React, { useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import StudentsTab from '../components/tabs/StudentsTab';
import { useApp } from '../context/AppContext';

const Students = () => {
    const { state, fetchStudents } = useApp();

    // Carica gli studenti al mount del componente
    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Paper elevation={0} sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1">
                        Lista Studenti
                    </Typography>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <StudentsTab 
                        students={state.students}
                        loading={state.loading}
                    />
                </Paper>
            </Box>
        </Container>
    );
};

export default Students;