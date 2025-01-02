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
  Select,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from '../utils/axios';
import { toast } from 'react-hot-toast';

const StudentModal = ({ isOpen, onClose, student, schoolConfig, userId, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    number: '',  // per la classe
    section: '',
    note: ''     // campo opzionale per le note
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Popola il form se stiamo modificando uno studente esistente
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        gender: student.gender || '',
        number: student.number?.toString() || '',
        section: student.section || '',
        note: student.note || ''
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Pulisce gli errori quando l'utente modifica un campo
  };

  const validateForm = () => {
    const errors = [];
    if (!formData.firstName.trim()) errors.push('Il nome è obbligatorio');
    if (!formData.lastName.trim()) errors.push('Il cognome è obbligatorio');
    if (!formData.gender) errors.push('Il genere è obbligatorio');
    if (!formData.number) errors.push('La classe è obbligatoria');
    if (!formData.section) errors.push('La sezione è obbligatoria');
    
    return errors;
  };

  const handleSubmit = async (studentData) => {
    try {
      console.log('Dati studente ricevuti:', studentData);
      
      // Prepariamo il payload dello studente senza classId
      const studentPayload = {
        // Campi obbligatori
        firstName: studentData.firstName.trim(),
        lastName: studentData.lastName.trim(),
        gender: studentData.gender.toUpperCase(), // 'M' o 'F'
        schoolId: schoolConfig._id,
        mainTeacher: userData._id,
        
        // Campi opzionali
        notes: studentData.note?.trim() || '',
        isActive: true
      };
  
      console.log('Payload studente da inviare:', studentPayload);
  
      const response = await axios.post('/api/students', studentPayload);
      
      if (response.data.success) {
        toast.success('Studente aggiunto con successo');
        // Mostriamo l'alert per indicare che lo studente deve essere associato a una classe
        toast.warning('Importante: Lo studente deve essere associato a una classe', {
          autoClose: false, // L'alert non si chiude automaticamente
          closeButton: true,
          closeOnClick: false,
          draggable: false,
          position: "top-center"
        });
        
        handleCloseModal(); // Chiudiamo il modal dopo il successo
        return { 
          success: true, 
          studentId: response.data.data._id,
          needsClass: true 
        };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Errore salvataggio studente:', error);
      console.error('Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Errore durante il salvataggio dello studente';
      toast.error(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage 
      };
    }
  };

  const generateClassOptions = () => {
    if (schoolConfig?.tipo_istituto === 'primo_grado') {
      return [1, 2, 3];
    }
    return [1, 2, 3, 4, 5];
  };

  const assignStudentToClass = async (studentId, classData) => {
    try {
      const updatePayload = {
        classId: classData.classId,
        section: classData.section
      };
  
      const response = await axios.patch(`/api/students/${studentId}/assign-class`, updatePayload);
  
      if (response.data.success) {
        toast.success('Studente assegnato alla classe con successo');
        toast.dismiss(); // Rimuoviamo l'alert precedente
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Errore assegnazione classe:', error);
      toast.error('Errore durante l\'assegnazione della classe');
      return { success: false, message: error.response?.data?.message };
    }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" required>
                <Typography variant="subtitle2" gutterBottom>
                  Genere
                </Typography>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel 
                    value="M" 
                    control={<Radio />} 
                    label="Maschio"
                    disabled={isSubmitting}
                  />
                  <FormControlLabel 
                    value="F" 
                    control={<Radio />} 
                    label="Femmina"
                    disabled={isSubmitting}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Classe</InputLabel>
                <Select
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  label="Classe"
                  disabled={isSubmitting}
                >
                  {generateClassOptions().map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Sezione</InputLabel>
                <Select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  label="Sezione"
                  disabled={isSubmitting}
                >
                  {schoolConfig?.sezioni_disponibili?.map((section) => (
                    <MenuItem key={section} value={section}>
                      {section}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Note (opzionale)"
                name="note"
                value={formData.note}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvataggio...' : student ? 'Salva Modifiche' : 'Aggiungi'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StudentModal;