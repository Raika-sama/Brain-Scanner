import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Skeleton,
  useTheme
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FolderIcon from '@mui/icons-material/Folder';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

// Componenti delle tab
import StudentsTab from '../components/tabs/StudentsTab';
import TeachersTab from '../components/tabs/TeachersTab';
import RegisterTab from '../components/tabs/RegisterTab';
import MaterialsTab from '../components/tabs/MaterialsTab';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`class-tabpanel-${index}`}
      aria-labelledby={`class-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ClassDetail = () => {
  const theme = useTheme();
  const { classId } = useParams();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await axios.get(`/api/classes/${classId}`);
        setClassData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Errore nel caricamento della classe');
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [classId]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={200} />
        <Box sx={{ mt: 3 }}>
          <Skeleton variant="rectangular" height={400} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate('/classes')} 
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs>
            <Link 
              component="button"
              variant="body1"
              onClick={() => navigate('/classes')}
              color="inherit"
            >
              Classi
            </Link>
            <Typography color="primary">
              {classData?.nome} {classData?.sezione}
            </Typography>
          </Breadcrumbs>
        </Box>

        <Paper 
          elevation={2} 
          sx={{ 
            p: 3, 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white'
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Classe {classData?.nome} {classData?.sezione}
          </Typography>
          <Typography variant="subtitle1">
            Anno Scolastico: {classData?.annoScolastico}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', gap: 4 }}>
            <Typography>
              Studenti: {classData?.studenti?.length || 0}
            </Typography>
            <Typography>
              Docenti: {classData?.docenti?.length || 0}
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<PeopleAltIcon />} 
            label="Studenti" 
            iconPosition="start"
          />
          <Tab 
            icon={<SchoolIcon />} 
            label="Docenti" 
            iconPosition="start"
          />
          <Tab 
            icon={<MenuBookIcon />} 
            label="Registro" 
            iconPosition="start"
          />
          <Tab 
            icon={<FolderIcon />} 
            label="Materiali" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <StudentsTab classData={classData} setClassData={setClassData} />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <TeachersTab classData={classData} setClassData={setClassData} />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <RegisterTab classData={classData} />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <MaterialsTab classData={classData} />
      </TabPanel>
    </Container>
  );
};

export default ClassDetail;