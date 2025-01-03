// src/components/tabs/StudentsTab.js
import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from '@mui/material';

const StudentsTab = ({ students = [], loading = false }) => {
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Nome</TableCell>
                        <TableCell>Cognome</TableCell>
                        <TableCell>Genere</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Sezione</TableCell>
                        <TableCell>Note</TableCell>
                        <TableCell>Classe Assegnata</TableCell>
                        <TableCell>Stato</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {students.map((student) => (
                        <TableRow key={student._id}>
                            <TableCell>{student.firstName}</TableCell>
                            <TableCell>{student.lastName}</TableCell>
                            <TableCell>{student.gender}</TableCell>
                            <TableCell>{student.email || 'N/A'}</TableCell>
                            <TableCell>{student.section || 'N/A'}</TableCell>
                            <TableCell>{student.notes || 'N/A'}</TableCell>
                            <TableCell>
                                {student.needsClassAssignment ? 'No' : 'Sì'}
                            </TableCell>
                            <TableCell>
                                {student.isActive ? 'Attivo' : 'Inattivo'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {students.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={8} align="center">
                                Nessuno studente trovato
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default StudentsTab;