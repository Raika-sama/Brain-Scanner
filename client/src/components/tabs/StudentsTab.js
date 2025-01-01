import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useApp } from '../../context/AppContext';

const StudentsTab = ({ classData }) => {
  const { state } = useApp();
  
  // Filtriamo gli studenti per ottenere solo quelli della classe corrente
  const classStudents = state.students.filter(
    student => student.classe?._id === classData?._id
  );

  return (
    <Box>
      <Typography variant="h6" mb={3}>
        Lista Studenti
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Cognome</TableCell>
              <TableCell>Sezione</TableCell>
              <TableCell>Data di Nascita</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classStudents.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.nome}</TableCell>
                <TableCell>{student.cognome}</TableCell>
                <TableCell>{student.sezione}</TableCell>
                <TableCell>
                  {new Date(student.dataNascita).toLocaleDateString('it-IT')}
                </TableCell>
              </TableRow>
            ))}
            {classStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nessuno studente in questa classe
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StudentsTab;