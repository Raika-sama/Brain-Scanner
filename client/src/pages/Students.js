import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Container,
  Alert
} from '@mui/material';
import { Add as AddIcon, School as SchoolIcon } from '@mui/icons-material';
import StudentsTab from '../components/tabs/StudentsTab';
import StudentModal from '../components/StudentModal';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';


const Students = () => {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Debug all'avvio del componente
  console.log('Complete state:', state);

  // Estraiamo i dati dell'utente dalla struttura corretta
  const userData = useMemo(() => {
    const user = state.user?.user || state.user;
    console.log('Extracted user data:', user);
    return user;
  }, [state.user]);

 
  const schoolConfig = useMemo(() => {
    // Estrai i dati della scuola correttamente
    const schoolData = userData?.school;
    console.log('School data for config:', schoolData);

    if (!schoolData || !schoolData._id) {
      console.warn('Missing or invalid school data:', schoolData);
      return null;
    }

    return {
      _id: userData.school._id,
      tipo_istituto: userData.school.tipo_istituto,
      sezioni_disponibili: userData.school.sezioni_disponibili || ['A', 'B', 'C']
    };
  }, [userData?.school]);


  // Debug dello schoolConfig
  console.log('Final schoolConfig:', schoolConfig);

  const handleOpenModal = () => {
    console.log('handleOpenModal clicked');
    console.log('Complete user object:', state.user);
    console.log('Complete school object:', state.user?.school);

    if (!userData?._id) {
      console.log('No user ID found');
      toast.error('Devi essere autenticato per aggiungere uno studente');
      return;
    }
  
    if (!userData?.school?._id) {
      console.log('No school associated');
      toast.error('Nessuna scuola associata al tuo profilo');
      return;
    }

    console.log('Setting showModal to true');
    setShowModal(true);
  };

  const handleSubmit = async (studentData) => {
    try {
      const response = await axios.post('/api/students', studentData);
      if (response.data.success) {
        toast.success('Studente aggiunto con successo');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Errore salvataggio studente:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Errore durante il salvataggio' 
      };
    }
  };

  // Debug dei valori prima del render
  console.log('Before render:', {
    userData,
    schoolConfig,
    userID: userData?._id
  });

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
            <Typography variant="caption" color="textSecondary">
              Debug Info:
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              User ID: {state.user?._id || 'Not set'}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              School Name: {state.user?.school?.nome || 'Not set'}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              School ID: {state.user?.school?._id || 'Not set'}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Aggiungi Studente
          </Button>
        </Paper>

        {showModal && (
          <StudentModal
            isOpen={showModal}
            onClose={() => {
              console.log('Closing modal');
              setShowModal(false);
            }}
            student={selectedStudent}
            schoolConfig={schoolConfig}
            userId={state.user?._id}
          />
        )}

        <Paper sx={{ p: 3 }}>
          <StudentsTab 
            onEditStudent={(student) => {
              setSelectedStudent(student);
              setShowModal(true);
            }}
            showActions={true}
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default Students;