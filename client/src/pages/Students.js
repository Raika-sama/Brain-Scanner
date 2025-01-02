import React, { useState, useMemo, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Container,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import StudentsTab from '../components/tabs/StudentsTab';
import StudentModal from '../components/StudentModal';
import { useApp } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import axios from '../utils/axios';

const Students = () => {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  // Memo per userData con validation
  const userData = useMemo(() => {
    if (!state.user) {
      console.warn('No user data in state');
      return null;
    }
    const user = state.user?.user || state.user;
    console.log('Extracted user data:', user);
    return user;
  }, [state.user]);

  // Memo per schoolConfig con validation
  const schoolConfig = useMemo(() => {
    if (!userData?.school?._id) {
      console.warn('No school data available');
      return null;
    }

    return {
      _id: userData.school._id,
      tipo_istituto: userData.school.tipo_istituto,
      sezioni_disponibili: userData.school.sezioni_disponibili || ['A', 'B', 'C']
    };
  }, [userData?.school]);

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!userData?.school?._id) {
        console.warn('No school ID available for fetching students');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('/api/students/school/assigned');
        if (response.data.success) {
          setStudents(response.data.data);
        } else {
          throw new Error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Errore nel caricamento degli studenti');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [userData?.school?._id]);

  const handleOpenModal = () => {
    if (!userData?._id) {
      toast.error('Devi essere autenticato per aggiungere uno studente');
      return;
    }
  
    if (!schoolConfig) {
      toast.error('Nessuna scuola associata al tuo profilo');
      return;
    }

    setShowModal(true);
  };

  const handleSubmit = async (studentData) => {
    try {
      console.log('Submitting student data:', studentData);

      // Crea lo studente senza classe
      const createStudentPayload = {
        firstName: studentData.firstName.trim(),
        lastName: studentData.lastName.trim(),
        gender: studentData.gender.toUpperCase(),
        notes: studentData.notes?.trim() || ''
      };

      console.log('Creating student with payload:', createStudentPayload);

      const response = await axios.post('/api/students', createStudentPayload);

      if (response.data.success) {
        toast.success('Studente creato con successo');
        
        // Aggiorna la lista degli studenti
        setStudents(prevStudents => [...prevStudents, response.data.data]);
        
        // Chiudi il modal
        setShowModal(false);
        return { success: true };
      } else {
        throw new Error(response.data.message);
      }

    } catch (error) {
      console.error('Error creating student:', error);
      const errorMessage = error.response?.data?.message || 'Errore durante il salvataggio';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Filtered students memo
  const filteredStudents = useMemo(() => {
    return students.filter(student => student.isActive);
  }, [students]);

  // Debug info
  console.log('Component state:', {
    userData,
    schoolConfig,
    studentsCount: filteredStudents.length,
    loading
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
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Debug Info:
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  User ID: {userData?._id || 'Not set'}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  School ID: {schoolConfig?._id || 'Not set'}
                </Typography>
                <Typography variant="caption" display="block" color="textSecondary">
                  Students: {filteredStudents.length}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            disabled={!schoolConfig}
          >
            Aggiungi Studente
          </Button>
        </Paper>

        {!schoolConfig && (
          <Alert severity="warning">
            Nessuna scuola associata al tuo profilo. Impossibile gestire gli studenti.
          </Alert>
        )}

        {showModal && (
          <StudentModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedStudent(null);
            }}
            onSubmit={handleSubmit}
            student={selectedStudent}
            schoolConfig={schoolConfig}
            userId={userData?._id}
          />
        )}

        <Paper sx={{ p: 3 }}>
          <StudentsTab 
            students={filteredStudents}
            loading={loading}
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