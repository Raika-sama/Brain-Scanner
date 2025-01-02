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
      console.log('Dati studente ricevuti:', studentData);
      console.log('School Config:', schoolConfig); // Verifichiamo i dati della scuola
      
      // Generiamo l'anno accademico corrente
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const academicYear = `${currentYear}/${currentYear + 1}`;
  
      // Prima controlliamo se la classe esiste
      const classQueryParams = {
        year: studentData.number,
        section: studentData.section,
        schoolId: schoolConfig._id,
        academicYear: academicYear
      };
      console.log('Ricerca classe con parametri:', classQueryParams);
  
      const classResponse = await axios.get('/api/classes', {
        params: classQueryParams
      });
  
      let classId;
  
      // Se la classe non esiste, la creiamo
      if (!classResponse.data.data || classResponse.data.data.length === 0) {
        const className = `${studentData.number}${studentData.section} ${academicYear}`;
        
        const newClassData = {
          // Campi base
          name: className,
          year: parseInt(studentData.number),
          section: studentData.section.toUpperCase(),
          academicYear: academicYear,
          
          // Referencias
          schoolId: schoolConfig._id,
          mainTeacher: userData._id,
          teachers: [userData._id],
          
          // Altri campi
          isActive: true
        };
  
        console.log('Payload creazione classe:', newClassData);
  
        const createClassResponse = await axios.post('/api/classes', newClassData);
  
        if (createClassResponse.data.success) {
          classId = createClassResponse.data.data._id;
          console.log('Classe creata con ID:', classId);
        } else {
          throw new Error(createClassResponse.data.message || 'Errore nella creazione della classe');
        }
      } else {
        classId = classResponse.data.data[0]._id;
        console.log('Classe esistente trovata con ID:', classId);
      }
  
      // Resto del codice per la creazione dello studente...
  
    } catch (error) {
      console.error('Payload inviato:', error.config?.data);
      console.error('Errore completo:', error);
      const errorMessage = error.response?.data?.message || 'Errore durante il salvataggio';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
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