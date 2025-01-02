import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  School as SchoolIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AlertMessage from '../components/ui/AlertMessage';

// Componente StatCard con animazione e stile pastello
const StatCard = ({ icon: Icon, title, value, color, delay }) => (
  <Fade in timeout={500} style={{ transitionDelay: `${delay}ms` }}>
    <Card 
      sx={{ 
        height: '100%',
        backgroundColor: `${color}10`, // Colore pastello molto leggero
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ color, fontSize: 32, mr: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ color }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  </Fade>
);

const Classes = () => {
  const navigate = useNavigate();
  const { state } = useApp();
  const { classes, loading, error } = state;

  // Handler per navigare ai dettagli della classe
  const handleClassClick = (classId) => {
    navigate(`/classes/${classId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <AlertMessage severity="error" message={error} />;
  }

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header con info scuola */}
      <Fade in timeout={400}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            backgroundColor: 'primary.light',
            color: 'white'
          }}
        >
          <Typography variant="h4" sx={{ mb: 1 }}>
            {state.schoolConfig?.name || 'Dashboard Classi'}
          </Typography>
          <Typography variant="subtitle1">
            Anno Scolastico {new Date().getFullYear()}/{new Date().getFullYear() + 1}
          </Typography>
        </Paper>
      </Fade>

      {/* Statistiche */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={SchoolIcon}
            title="Totale Classi"
            value={classes.length}
            color="#4CAF50"
            delay={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={PeopleIcon}
            title="Totale Studenti"
            value={classes.reduce((acc, cls) => acc + (cls.students?.length || 0), 0)}
            color="#2196F3"
            delay={200}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={AssignmentIcon}
            title="Test Completati"
            value={state.schoolConfig?.completedTests || 0}
            color="#FF9800"
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Lista Classi */}
      <Fade in timeout={600}>
        <Card 
          sx={{ 
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
              Le tue classi
            </Typography>
            <List>
              {classes.map((cls, index) => (
                <ListItem
                  key={cls._id}
                  button
                  onClick={() => handleClassClick(cls._id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6" color="primary">
                        {`${cls.year}ª ${cls.section}`}
                      </Typography>
                    }
                    secondary={`${cls.students?.length || 0} studenti`}
                  />
                  <ChevronRightIcon color="action" />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Classes;