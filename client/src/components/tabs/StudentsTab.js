import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const StudentsTab = ({ students = [], loading = false, onEditStudent, showActions = true }) => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({  // Aggiunto formData che mancava nella definizione
    firstName: '',
    lastName: '',
  });
  const [filters, setFilters] = useState({
    year: '',
    section: '',
    institutionType: ''
  });

  // Filtra gli studenti in base ai filtri attivi
  const filteredStudents = students.filter(student => {
    if (filters.year && student.year !== filters.year) return false;
    if (filters.section && student.section !== filters.section) return false;
    return true;
  });

  // Handler per il click sullo studente
  const handleStudentClick = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  // Handlers per il dialog di aggiunta/modifica
  const handleOpenDialog = (student = null) => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
      });
      setSelectedStudent(student);
    } else {
      setFormData({ firstName: '', lastName: '' });
      setSelectedStudent(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStudent(null);
    setFormData({ firstName: '', lastName: '' });
  };

  const handleSubmit = () => {
    console.log('Saving student:', formData);
    handleCloseDialog();
  };

  const handleDelete = (studentId) => {
    console.log('Deleting student:', studentId);
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
      {/* Header con pulsante aggiungi */}
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

      {/* Tabella Studenti */}
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
                  <TableCell colSpan={showActions ? 3 : 2} align="center">
                    Nessuno studente trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>

      {/* Dialog per aggiunta/modifica studente */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400
          }
        }}
      >
        <DialogTitle>
          {selectedStudent ? 'Modifica Studente' : 'Nuovo Studente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nome"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Cognome"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: 'text.secondary' }}
          >
            Annulla
          </Button>
          <Button 
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: 'primary.light',
              '&:hover': {
                backgroundColor: 'primary.main',
              }
            }}
          >
            {selectedStudent ? 'Salva' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentsTab;