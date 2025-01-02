import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import {
  Description as DocumentIcon,
  Upload as UploadIcon,
  Assignment as TestIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const MaterialsTab = ({ studentData, teachersData }) => {
  const { user } = useAuth(); // Add auth context

  // Fix authorization check
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
      {/* Header con azioni */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Materiali e Test
        </Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          sx={{ borderRadius: 2 }}
        >
          Carica Materiale
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Lista Materiali */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={500}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="text.secondary">
                    Materiali Didattici
                  </Typography>
                </Box>
                <List>
                  {/* Lista placeholder */}
                  <ListItem>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Area materiali didattici"
                      secondary="Qui verranno mostrati i materiali caricati"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>

        {/* Lista Test */}
        <Grid item xs={12} md={6}>
          <Fade in timeout={700}>
            <Card sx={{ borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TestIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" color="text.secondary">
                    Test Assegnati
                  </Typography>
                </Box>
                <List>
                  {/* Lista placeholder */}
                  <ListItem>
                    <ListItemIcon>
                      <TestIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Area test"
                      secondary="Qui verranno mostrati i test assegnati"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Fade>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MaterialsTab;