import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  LibraryBooks as MaterialsIcon,
} from '@mui/icons-material';
import { useApp } from '../context/AppContext';
import StudentsTab from '../components/tabs/StudentsTab';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import AlertMessage from '../components/ui/AlertMessage';

// Componente TabPanel per gestire il contenuto delle tabs
const TabPanel = ({ children, value, index, ...props }) => (
  <Fade in={value === index} timeout={500}>
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`class-tabpanel-${index}`}
      {...props}
      sx={{ pt: 3 }}
    >
      {value === index && children}
    </Box>
  </Fade>
);

const ClassDetails = () => {
  const { id } = useParams();
  const { state } = useApp();
  const [currentTab, setCurrentTab] = useState(0);
  const [classData, setClassData] = useState(null);

  useEffect(() => {
    // Trova la classe corrispondente nel state
    const currentClass = state.classes.find(c => c._id === id);
    setClassData(currentClass);
  }, [id, state.classes]);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (!classData) {
    return <AlertMessage severity="error" message="Classe non trovata" />;
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, margin: '0 auto' }}>
      {/* Header della classe */}
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
              {`${classData.year}ª ${classData.section}`}
            </Typography>
            <Typography variant="subtitle1">
              {`${classData.students?.length || 0} studenti`}
            </Typography>
          </Box>
          <PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
        </Paper>
      </Grow>

      {/* Tabs Container */}
      <Card 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
        }}
      >
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
            <Tab 
              icon={<PeopleIcon />} 
              label="Studenti" 
              iconPosition="start"
            />
            <Tab 
              icon={<AnalyticsIcon />} 
              label="Analisi" 
              iconPosition="start"
            />
            <Tab 
              icon={<MaterialsIcon />} 
              label="Materiali" 
              iconPosition="start"
            />
          </Tabs>

          {/* Tab Contents */}
          <TabPanel value={currentTab} index={0}>
            <StudentsTab classData={classData} />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Analisi dei Test
              </Typography>
              {/* Contenuto per la sezione Analisi */}
              <Typography variant="body1">
                Qui verranno visualizzati i risultati dei test specifici della classe
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Materiali Didattici
              </Typography>
              {/* Contenuto per la sezione Materiali */}
              <Typography variant="body1">
                Qui verranno gestiti i materiali e i test della classe
              </Typography>
            </Box>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ClassDetails;