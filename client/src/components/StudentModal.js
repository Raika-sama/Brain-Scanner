import React from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useApp } from '../context/AppContext';

const StudentModal = ({ isOpen, onClose, student, schoolConfig }) => {
  const { addStudent, updateStudent } = useApp();
  
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      firstName: student?.firstName || '',
      lastName: student?.lastName || '',
      gender: student?.gender || '',
      number: student?.classId?.year?.toString() || '',
      section: student?.section || '',
      note: student?.note || ''
    }
  });

  React.useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        gender: student.gender,
        number: student.classId?.year?.toString(),
        section: student.section,
        note: student.note
      });
    }
  }, [student, reset]);

  const onSubmit = async (data) => {
    try {
      const studentData = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender.toUpperCase(),
        classId: {
          year: parseInt(data.number),
          section: data.section
        },
        note: data.note?.trim() || '',
        schoolId: schoolConfig._id,
        isActive: true
      };

      if (student) {
        await updateStudent(student._id, studentData);
      } else {
        await addStudent(studentData);
      }
      
      onClose();
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  };

  const generateClassOptions = () => {
    if (schoolConfig?.tipo_istituto === 'primo_grado') {
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

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Si prega di compilare tutti i campi obbligatori
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'Il nome è obbligatorio' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nome"
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Il cognome è obbligatorio' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Cognome"
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    disabled={isSubmitting}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Il genere è obbligatorio' }}
                render={({ field }) => (
                  <FormControl component="fieldset" error={!!errors.gender}>
                    <Typography variant="subtitle2" gutterBottom>
                      Genere
                    </Typography>
                    <RadioGroup {...field} row>
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
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="number"
                control={control}
                rules={{ required: 'La classe è obbligatoria' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.number}>
                    <InputLabel>Classe</InputLabel>
                    <Select
                      {...field}
                      label="Classe"
                      disabled={isSubmitting}
                    >
                      {generateClassOptions().map((year) => (
                        <MenuItem key={year} value={year.toString()}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="section"
                control={control}
                rules={{ required: 'La sezione è obbligatoria' }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.section}>
                    <InputLabel>Sezione</InputLabel>
                    <Select
                      {...field}
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
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="note"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Note (opzionale)"
                    disabled={isSubmitting}
                  />
                )}
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