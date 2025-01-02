import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Fade,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const StudentsTab = ({ students = [], loading = false, onEditStudent, showActions = true }) => {
  const navigate = useNavigate();
  const { 
    state,
    selectors: { getFilteredStudents },
    deleteStudent  // Aggiungiamo questo dal context
  } = useApp();

  // Aggiorniamo i filtri per allinearli con il context
  const [filters, setFilters] = useState({
    year: '',
    section: '',
    searchTerm: ''  // Aggiunto per il supporto della ricerca
  });

  // Usiamo il selector del context invece del filtro locale
  const filteredStudents = getFilteredStudents(state, filters);

  // Handler per il click sullo studente
  const handleStudentClick = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId);
      // Il context si occuperà di aggiornare lo state
    } catch (error) {
      console.error('Errore durante l\'eliminazione dello studente:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3 
      }}>
        <Typography variant="h6" color="text.secondary">
          Lista Studenti ({filteredStudents.length})
        </Typography>
      </Box>

      <Fade in timeout={500}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.lighter' }}>
                <TableCell>Nome</TableCell>
                <TableCell>Cognome</TableCell>
                <TableCell>Classe</TableCell>
                <TableCell>Sezione</TableCell>
                {showActions && <TableCell align="right">Azioni</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow 
                  key={student._id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'action.hover',
                      cursor: 'pointer',
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell 
                    onClick={() => handleStudentClick(student._id)}
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 500,
                    }}
                  >
                    {student.firstName}
                  </TableCell>
                  <TableCell onClick={() => handleStudentClick(student._id)}>
                    {student.lastName}
                  </TableCell>
                  <TableCell>
                    {student.classId?.year || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {student.section || 'N/A'}
                  </TableCell>
                  {showActions && (
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(student);
                        }}
                        sx={{ color: 'info.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(student._id);
                        }}
                        sx={{ color: 'error.light', ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showActions ? 5 : 4} align="center">
                    Nessuno studente trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
    </Box>
  );
};

export default StudentsTab;