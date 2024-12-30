import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  useTheme,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';

const CreateClassDialog = ({ open, onClose, onSubmit, initialData = null }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    sezione: initialData?.sezione || '',
    annoScolastico: initialData?.annoScolastico || '2023/2024',
    docenti: initialData?.docenti || [],
    studenti: initialData?.studenti || []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          onClose={onClose}
          maxWidth="md"
          fullWidth
          PaperProps={{
            component: motion.div,
            initial: { y: -20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            exit: { y: -20, opacity: 0 },
            transition: { duration: 0.2 }
          }}
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="h5"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}
              >
                {initialData ? 'Modifica Classe' : 'Nuova Classe'}
              </Typography>
              <IconButton onClick={onClose} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nome Classe"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Sezione"
                    name="sezione"
                    value={formData.sezione}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Anno Scolastico"
                    name="annoScolastico"
                    value={formData.annoScolastico}
                    onChange={handleChange}
                    required
                    variant="outlined"
                  />
                </Grid>
                {/* Qui aggiungeremo i selettori per docenti e studenti */}
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={onClose}
                variant="outlined"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  color: 'white',
                  '&:hover': {
                    background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  }
                }}
              >
                {initialData ? 'Salva Modifiche' : 'Crea Classe'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default CreateClassDialog;