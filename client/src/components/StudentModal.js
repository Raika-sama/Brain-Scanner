import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

const StudentModal = ({ isOpen, onClose, student, schoolConfig, userId }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    studentId: '',
    email: '',
    dateOfBirth: '',
    class: '',
    section: ''
  });

  const [error, setError] = useState(null);

  // Popola il form se stiamo modificando uno studente esistente
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        studentId: student.studentId || '',
        email: student.email || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        class: student.class || '',
        section: student.section || ''
      });
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!schoolConfig?._id) {
      toast.error('Configurazione scuola non valida');
      return;
    }

    try {
      const studentData = {
        ...formData,
        school: schoolConfig._id,
        createdBy: userId
      };

      const response = await axios.post('/api/students', studentData);
      
      if (response.data.success) {
        toast.success(student ? 'Studente modificato con successo' : 'Studente aggiunto con successo');
        onClose();
        setFormData({
          firstName: '',
          lastName: '',
          studentId: '',
          email: '',
          dateOfBirth: '',
          class: '',
          section: ''
        });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      console.error('Errore salvataggio studente:', err);
      setError(err.response?.data?.message || 'Errore durante il salvataggio');
      toast.error('Errore durante il salvataggio dello studente');
    }
  };

  const generateClassOptions = () => {
    if (schoolConfig?.tipo_istituto === 'middle_school') {
      return [1, 2, 3];
    }
    return [1, 2, 3, 4, 5];
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {student ? 'Modifica Studente' : 'Aggiungi Nuovo Studente'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nome"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Cognome"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Matricola"
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="date"
                label="Data di Nascita"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel>Classe</InputLabel>
                <Select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  label="Classe"
                >
                  {generateClassOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel>Sezione</InputLabel>
                <Select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  label="Sezione"
                >
                  {schoolConfig?.sezioni_disponibili?.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>
            Annulla
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
          >
            {student ? 'Salva Modifiche' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StudentModal;