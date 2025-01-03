// client/src/pages/StudentDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Fade,
  Grow,
  Grid,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Analytics as AnalyticsIcon,
  Description as DocumentsIcon,
  School as SchoolIcon,
  Group as TeachersIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AlertMessage from '../components/ui/AlertMessage';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, fetchStudentById } = useApp();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [classData, setClassData] = useState(null);
  const [schoolData, setSchoolData] = useState(null);
  const [teachersData, setTeachersData] = useState([]);

  // Separiamo il caricamento dei dati correlati in una funzione separata
  const loadRelatedData = (student) => {
    if (!student) return;

    // Carica i dati della classe
    if (student.classId) {
      const classInfo = state.classes?.find(c => c._id === student.classId);
      setClassData(classInfo || { year: 'N/A', section: 'N/A' });
    }

    // Carica i dati della scuola
    if (student.schoolId) {
      const school = state.schools?.find(s => s._id === student.schoolId);
      setSchoolData(school || { name: 'N/A' });
    }

    // Carica i dati degli insegnanti
    if (student.teachers?.length) {
      const teachers = state.teachers?.filter(t => student.teachers.includes(t._id));
      setTeachersData(teachers || []);
    }
  };

  // Primo useEffect per caricare lo studente
  useEffect(() => {
    let isMounted = true;

    const loadStudent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Prima cerca nello state
        let student = state.students.find(s => s._id === id);

        if (!student) {
          // Se non lo trova nello state, carica dal server
          try {
            const result = await fetchStudentById(id);
            if (result.success && isMounted) {
              student = result.data;
            }
          } catch (err) {
            if (isMounted) {
              console.error('Error fetching student:', err);
              setError('Studente non trovato');
            }
            return;
          }
        }

        if (isMounted && student) {
          setStudentData(student);
          loadRelatedData(student);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadStudent();

    return () => {
      isMounted = false;
    };
  }, [id, fetchStudentById]); // Rimuovi state.students dalle dipendenze




  
  // useEffect separato per aggiornare i dati correlati quando cambiano gli state correlati
  useEffect(() => {
    if (studentData) {
      loadRelatedData(studentData);
    }
  }, [state.classes, state.schools, state.teachers]);

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header dello studente */}
      <Grow in timeout={500}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            backgroundColor: 'primary.light',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {`${studentData.firstName} ${studentData.lastName}`}
            </Typography>
            <Typography variant="subtitle1">
              {`${classData?.year}ª ${classData?.section} - ${schoolData?.name}`}
            </Typography>
          </Box>
          <PersonIcon sx={{ fontSize: 48, opacity: 0.8 }} />
        </Paper>
      </Grow>

      {/* Tabs Container */}
      <Card sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <CardContent>
          {/* Tabs Navigation */}
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'action.hover',
                }
              }
            }}
          >
            <Tab icon={<PersonIcon />} label="Info Personali" iconPosition="start" />
            <Tab icon={<AnalyticsIcon />} label="Analisi" iconPosition="start" />
            <Tab icon={<DocumentsIcon />} label="Documenti" iconPosition="start" />
          </Tabs>

          {/* Tab Contents */}
          <TabPanel value={currentTab} index={0}>
            <Grid container spacing={3}>
              {/* Dati Anagrafici */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Dati Anagrafici
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Nome:</strong> {studentData.firstName}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Cognome:</strong> {studentData.lastName}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Genere:</strong> {studentData.gender === 'M' ? 'Maschio' : 'Femmina'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography sx={{ mb: 1 }}>
                      <strong>Creato il:</strong> {format(new Date(studentData.createdAt), 'dd MMMM yyyy', { locale: it })}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Ultimo aggiornamento:</strong> {format(new Date(studentData.updatedAt), 'dd MMMM yyyy', { locale: it })}
                    </Typography>
                  </Box>
                </Card>
              </Grid>

              {/* Info Scolastiche */}
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    Info Scolastiche
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography>
                        <strong>Scuola:</strong> {schoolData?.name}
                      </Typography>
                    </Box>
                    <Typography sx={{ mb: 1 }}>
                      <strong>Classe:</strong> {`${classData?.year}ª ${classData?.section}`}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Insegnante Principale:
                    </Typography>
                    <Chip
                      avatar={<Avatar>{mainTeacherData?.firstName[0]}</Avatar>}
                      label={`${mainTeacherData?.firstName} ${mainTeacherData?.lastName}`}
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Altri Insegnanti:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {teachersData.map((teacher) => (
                        teacher._id !== mainTeacherData?._id && (
                          <Chip
                            key={teacher._id}
                            size="small"
                            avatar={<Avatar>{teacher.firstName[0]}</Avatar>}
                            label={`${teacher.firstName} ${teacher.lastName}`}
                          />
                        )
                      ))}
                    </Box>
                  </Box>
                </Card>
              </Grid>

              {/* Note */}
              {studentData.notes && (
                <Grid item xs={12}>
                  <Card sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      Note
                    </Typography>
                    <Typography variant="body1" sx={{ pl: 2 }}>
                      {studentData.notes}
                    </Typography>
                  </Card>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <AnalysisTab studentData={studentData} teachersData={teachersData} />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <MaterialsTab studentData={studentData} teachersData={teachersData} />
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentDetails;