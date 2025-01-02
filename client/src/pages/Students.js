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
  console.log('User data:', state.user);
  console.log('School object:', state.user?.school);

  // Estraiamo i dati dell'utente dalla struttura corretta
  const userData = useMemo(() => {
    return state.user?.user || state.user || null;
  }, [state.user]);

  // Debug dopo l'estrazione
  console.log('Extracted userData:', userData);

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

  const schoolConfig = useMemo(() => {
    // Prendiamo l'oggetto scuola completo
    const schoolData = state.user?.school;
    console.log('Creating schoolConfig with:', schoolData);

    return {
      _id: schoolData?._id,
      tipo_istituto: schoolData?.tipo_istituto,
      sezioni_disponibili: schoolData?.sezioni_disponibili || ['A', 'B', 'C']
    };
  }, [state.user?.school]);

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