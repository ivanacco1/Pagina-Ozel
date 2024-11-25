import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';

const ColorModal = ({ open, onClose, onColorCreated }) => {
  const [colores, setColores] = useState([]);
  const [newColor, setNewColor] = useState('');

  useEffect(() => {
    const fetchColores = async () => { //consigue las colores para mostrar en el menu de crear nueva
      try {
        const response = await axios.get('http://localhost:3000/api/colores');
        setColores(response.data);
      } catch (error) {
        console.error('Error al cargar los colores:', error);
      }
    };

    if (open) {
      fetchColores();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newColor) {
      alert('Debe ingresar un color.');
      return;
    }

    try { //guarda el nuevo color en bbdd
      await axios.post('http://localhost:3000/api/colores', {
        color: newColor,
      });

      onClose();
    } catch (error) {
      console.error('Error al crear el color:', error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Crear Nuevo Color
        </Typography>
        <TextField
          label="Nuevo Color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
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

export default ColorModal;

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