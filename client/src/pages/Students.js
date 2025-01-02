import React, { useState, useMemo, useEffect } from 'react';
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
import axios from '../utils/axios';

const Students = () => {
  const { state } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memo per userData
  const userData = useMemo(() => {
    const user = state.user?.user || state.user;
    console.log('Extracted user data:', user);
    return user;
  }, [state.user]);

  // Memo per schoolConfig
  const schoolConfig = useMemo(() => {
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

  // Memo per students
  const [students, setStudents] = useState([]);
  
  useEffect(() => {
    const fetchStudents = async () => {
      if (!userData?.school?._id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching students for school:', userData.school._id);
        const response = await axios.get('/api/students/school/assigned');
        if (response.data.success) {
          console.log('Students fetched:', response.data.data);
          setStudents(response.data.data);
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

  // Memo per studenti filtrati
  const filteredStudents = useMemo(() => {
    return students.filter(student => student.isActive);
  }, [students]);

  const handleOpenModal = () => {
    console.log('handleOpenModal clicked');
    
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

    setShowModal(true);
  };

  const handleSubmit = async (studentData) => {
    try {
      const response = await axios.post('/api/students', studentData);
      if (response.data.success) {
        // Aggiorna la lista degli studenti dopo l'aggiunta
        setStudents(prev => [...prev, response.data.data]);
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
            <Typography variant="caption" color="textSecondary">
              Debug Info:
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              User ID: {userData?._id || 'Not set'}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              School Name: {userData?.school?.nome || 'Not set'}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              School ID: {userData?.school?._id || 'Not set'}
            </Typography>
            <Typography variant="caption" display="block" color="textSecondary">
              Students Count: {filteredStudents.length}
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