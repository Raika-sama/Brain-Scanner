// src/pages/ClassCard.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    {...other}
  >
    {value === index && (
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const ClassCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/classes/${id}`);
        setClassData(response.data.data);
      } catch (err) {
        setError('Errore nel caricamento della classe. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con pulsante indietro */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/classes')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          Classe {classData?.name} {classData?.section}
        </Typography>
      </Box>

      {/* Info Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ mr: 1 }} /> Informazioni Classe
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Anno Scolastico</Typography>
                  <Typography variant="body1">{classData?.schoolYear}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Specializzazione</Typography>
                  <Typography variant="body1">{classData?.specialization}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color="textSecondary">Numero Studenti</Typography>
                  <Typography variant="body1">{classData?.students?.length || 0}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon sx={{ mr: 1 }} /> Statistiche Test
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="h4" color="primary">15</Typography>
                  <Typography color="textSecondary">Test Totali</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="success.main">12</Typography>
                  <Typography color="textSecondary">Completati</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h4" color="warning.main">3</Typography>
                  <Typography color="textSecondary">In Attesa</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>



{/* Tabs */}
<Paper sx={{ mb: 3 }}>
  <Tabs 
    value={tabValue} 
    onChange={(e, newValue) => setTabValue(newValue)}
    indicatorColor="primary"
    textColor="primary"
    variant="fullWidth"
  >
    <Tab label="Studenti" icon={<PersonIcon />} iconPosition="start" />
    <Tab label="Test" icon={<AssignmentIcon />} iconPosition="start" />
    <Tab label="Attività Recenti" icon={<CalendarIcon />} iconPosition="start" />
  </Tabs>
</Paper>

{/* Contenuto Tabs */}
<TabPanel value={tabValue} index={0}>
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista Studenti
      </Typography>
      {classData?.students && classData.students.length > 0 ? (
        <List>
          {classData.students.map((student) => (
            <ListItem key={student._id}>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${student.firstName} ${student.lastName}`}
                secondary={`Matricola: ${student.studentId || 'N/A'}`}
              />
              <Chip 
                label={`Test completati: ${student.completedTests || 0}`}
                color="primary"
                size="small"
              />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="textSecondary" align="center">
          Nessuno studente presente in questa classe
        </Typography>
      )}
    </CardContent>
  </Card>
</TabPanel>

<TabPanel value={tabValue} index={1}>
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Test Assegnati
      </Typography>
      <List>
        {/* Questi sono dati di esempio - dovranno essere sostituiti con dati reali */}
        {[
          { 
            id: 1, 
            title: 'Test Matematica Base', 
            status: 'completed',
            dueDate: '2024-01-15',
            completionRate: '85%'
          },
          { 
            id: 2, 
            title: 'Verifica Fisica', 
            status: 'pending',
            dueDate: '2024-02-01',
            completionRate: '0%'
          }
        ].map((test) => (
          <ListItem key={test.id}>
            <ListItemText
              primary={test.title}
              secondary={`Scadenza: ${test.dueDate}`}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Completamento: {test.completionRate}
              </Typography>
              <Chip 
                label={test.status === 'completed' ? 'Completato' : 'In Attesa'}
                color={test.status === 'completed' ? 'success' : 'warning'}
                size="small"
              />
            </Box>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
</TabPanel>

<TabPanel value={tabValue} index={2}>
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Attività Recenti
      </Typography>
      <List>
        {/* Questi sono dati di esempio - dovranno essere sostituiti con dati reali */}
        {[
          {
            id: 1,
            action: 'Test completato',
            description: 'La classe ha completato il test di Matematica Base',
            date: '2024-01-10'
          },
          {
            id: 2,
            action: 'Nuovo studente',
            description: 'Mario Rossi è stato aggiunto alla classe',
            date: '2024-01-08'
          },
          {
            id: 3,
            action: 'Nuovo test assegnato',
            description: 'È stato assegnato un nuovo test di Fisica',
            date: '2024-01-05'
          }
        ].map((activity) => (
          <ListItem key={activity.id}>
            <ListItemText
              primary={activity.action}
              secondary={activity.description}
            />
            <Typography variant="caption" color="textSecondary">
              {activity.date}
            </Typography>
          </ListItem>
        ))}
      </List>
    </CardContent>
  </Card>
</TabPanel>
</Box>
);
};

export default ClassCard;
