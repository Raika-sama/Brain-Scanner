// src/components/tabs/AnalysisTab.js
import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Fade,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';

const AnalysisTab = ({ studentData, teachersData }) => {
  const { user } = useAuth(); // Add auth context

  const isAuthorizedTeacher = teachersData?.some(
    teacher => teacher._id === user?._id
  );

  if (!isAuthorizedTeacher) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Non sei autorizzato a visualizzare questa sezione
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Header con statistiche generali */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Analisi Performance
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Fade in={true} timeout={500}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="text.secondary">
                    Andamento Test
                  </Typography>
                </Box>
                <Box sx={{ height: 300, p: 2 }}>
                  <Typography color="text.secondary">
                    Area grafico andamento test
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        <Grid item xs={12} md={4}>
          <Fade in={true} timeout={700}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssessmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="text.secondary">
                    Statistiche
                  </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography color="text.secondary">
                    Area statistiche dettagliate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisTab;