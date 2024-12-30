// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

// Componente StatCard per le statistiche
const StatCard = ({ icon: Icon, title, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon sx={{ color, mr: 1 }} />
        <Typography variant="h6" color="textSecondary">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Statistiche hardcoded per ora
  const stats = {
    totalTests: 25,
    completedTests: 15,
    pendingTests: 10
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/classes');
        setClasses(response.data.data);
      } catch (err) {
        setError('Errore nel caricamento delle classi. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

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
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Classi
      </Typography>

      {/* Statistiche */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={SchoolIcon}
            title="Totale Classi"
            value={classes.length}
            color="#1976D2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={PeopleIcon}
            title="Totale Studenti"
            value={classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0)}
            color="#4CAF50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssignmentIcon}
            title="Test Completati"
            value={stats.completedTests}
            color="#FF9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AssignmentIcon}
            title="Test in Attesa"
            value={stats.pendingTests}
            color="#F44336"
          />
        </Grid>
      </Grid>

      {/* Lista Classi */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Elenco Classi
          </Typography>
          <List>
            {classes.map((cls) => (
              <React.Fragment key={cls._id}>
                <ListItem>
                  <ListItemText
                    primary={`${cls.name} ${cls.section}`}
                    secondary={`${cls.specialization} - ${cls.students?.length || 0} studenti`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Ultimi Aggiornamenti (Hardcoded per ora) */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <UpdateIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">
              Ultimi Aggiornamenti
            </Typography>
          </Box>
          <List>
            <ListItem>
              <ListItemText
                primary="Nuovo test assegnato"
                secondary="Il test 'Matematica Base' è stato assegnato alla classe 1A"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Completamento Test"
                secondary="La classe 2B ha completato il test 'Fisica Avanzata'"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemText
                primary="Nuovi Studenti"
                secondary="3 nuovi studenti sono stati aggiunti alla classe 1C"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Classes;