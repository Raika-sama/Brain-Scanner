import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Box,
  Button,
  Alert,
  Skeleton,
  IconButton
} from '@mui/material';
import {
  School as SchoolIcon,
  LocationOn as MapPinIcon,
  Phone as PhoneIcon,
  Email as MailIcon,
  Edit as EditIcon,
  Group as UsersIcon,
  Warning as AlertCircleIcon
} from '@mui/icons-material';
import axios from '../utils/axios';

// Componente per le statistiche
const StatCard = ({ icon: Icon, title, value, className }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" gap={2}>
        <Icon sx={{ fontSize: 30, color: 'primary.main' }} />
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Componente per i dettagli
const DetailSection = ({ title, icon: Icon, children }) => (
  <Card sx={{ mb: 3 }}>
    <CardHeader
      avatar={<Icon sx={{ color: 'primary.main' }} />}
      title={<Typography variant="h6">{title}</Typography>}
      sx={{ pb: 1 }}
    />
    <CardContent>
      <Grid container spacing={3}>
        {children}
      </Grid>
    </CardContent>
  </Card>
);

// Componente per i singoli dettagli
const DetailItem = ({ label, value }) => (
  <Grid item xs={12} md={6}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1">
      {value || 'Non specificato'}
    </Typography>
  </Grid>
);

const SchoolPage = () => {
  const [school, setSchool] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    totalTeachers: 0
  });

  const fetchSchool = async () => {
    try {
      const response = await axios.get('/api/schools/assigned');
      if (response.data.success) {
        setSchool(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Errore nel caricamento della scuola');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchool();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, '& > *': { mb: 3 } }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          ))}
        </Grid>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={200} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" icon={<AlertCircleIcon />}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!school) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" icon={<AlertCircleIcon />}>
          Nessuna scuola assegnata
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con azioni */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestione Scuola
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => {/* Implementare modifica */}}
        >
          Modifica
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <StatCard 
            icon={UsersIcon}
            title="Studenti Totali"
            value={stats.totalStudents}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={SchoolIcon}
            title="Classi"
            value={stats.totalClasses}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={UsersIcon}
            title="Docenti"
            value={stats.totalTeachers}
          />
        </Grid>
      </Grid>

      {/* Dettagli Scuola */}
      <DetailSection title="Anagrafica" icon={SchoolIcon}>
        <DetailItem label="Nome Istituto" value={school.name} />
        <DetailItem label="Codice Meccanografico" value={school.mechanographicCode} />
        <DetailItem
          label="Tipo Istituto"
          value={school.schoolType === 'middle_school' ?
            'Scuola Secondaria di Primo Grado' :
            'Scuola Secondaria di Secondo Grado'}
        />
        {school.schoolType !== 'middle_school' && (
          <DetailItem
            label="Indirizzo Scolastico"
            value={school.institutionType}
          />
        )}
      </DetailSection>

      {/* Localizzazione */}
      <DetailSection title="Localizzazione" icon={MapPinIcon}>
        <DetailItem label="Regione" value={school.region} />
        <DetailItem label="Provincia" value={school.province} />
        <DetailItem label="Città" value={school.city} />
        <DetailItem label="Indirizzo" value={school.address} />
      </DetailSection>

      {/* Contatti */}
      <DetailSection title="Contatti" icon={MailIcon}>
        <DetailItem label="Email Istituzionale" value={school.email} />
        {school.manager && (
          <>
            <DetailItem
              label="Referente"
              value={`${school.manager.firstName} ${school.manager.lastName}`}
            />
            <DetailItem label="Email Referente" value={school.manager.email} />
            <DetailItem label="Telefono Referente" value={school.manager.phone} />
          </>
        )}
      </DetailSection>
    </Box>
  );
};

export default SchoolPage;