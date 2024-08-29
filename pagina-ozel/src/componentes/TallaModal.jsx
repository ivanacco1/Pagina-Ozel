import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const TallaModal = ({ open, onClose, onTallaCreated }) => {
  const [tallas, setTallas] = useState([]);
  const [newTalla, setNewTalla] = useState('');

  useEffect(() => {
    const fetchTallas = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/tallas');
        setTallas(response.data);
      } catch (error) {
        console.error('Error al cargar las tallas:', error);
      }
    };

    if (open) {
      fetchTallas();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newTalla) {
      alert('Debe ingresar una talla.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/tallas', {
        talla: newTalla,
      });

      onClose();
    } catch (error) {
      console.error('Error al crear la talla:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Crear Nueva Talla
        </Typography>
        <TextField
          label="Nueva Talla"
          value={newTalla}
          onChange={(e) => setNewTalla(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
          sx={{ mt: 2 }}
        >
          Guardar
        </Button>
      </Box>
    </Modal>
  );
};

export default TallaModal;

// Estilos del modal
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};