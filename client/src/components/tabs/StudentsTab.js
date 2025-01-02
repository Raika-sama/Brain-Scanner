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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

const StudentsTab = ({ classData }) => {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
    // Qui implementeremo la logica per salvare/modificare lo studente
    console.log('Saving student:', formData);
    handleCloseDialog();
  };

  const handleDelete = (studentId) => {
    // Qui implementeremo la logica per eliminare lo studente
    console.log('Deleting student:', studentId);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header con pulsante aggiungi */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Lista Studenti
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            backgroundColor: 'primary.light',
            '&:hover': {
              backgroundColor: 'primary.main',
            },
            borderRadius: 2,
            px: 3
          }}
        >
          Nuovo Studente
        </Button>
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
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classData.students?.map((student) => (
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
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDialog(student);
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
                </TableRow>
              ))}
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