import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, TextField, Button, MenuItem } from '@mui/material';
import axios from 'axios';

const CategoriaModal = ({ open, onClose, onCategoriaCreated }) => {
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [newCategoria, setNewCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');

  useEffect(() => {
    const fetchCategorias = async () => { //consigue las categorias para mostrar en el menu de crear nueva
      try {
        const response = await axios.get('http://localhost:3000/api/categorias');
        // Filtra las categorías duplicadas antes de establecer el estado
        const uniqueCategorias = response.data.filter(
          (cat, index, self) =>
            index === self.findIndex((c) => c.categoria === cat.categoria)
        );
        setCategorias(uniqueCategorias);
      } catch (error) {
        console.error('Error al cargar las categorías:', error);
      }
    };

    if (open) {
      fetchCategorias();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!newCategoria && !selectedCategoria) {
      alert('Debe seleccionar o crear una categoría.');
      return;
    }

    try { //guarda la nueva categoria en bbdd
      const categoriaToSubmit = newCategoria || selectedCategoria;
      const response = await axios.post('http://localhost:3000/api/categorias', {
        categoria: categoriaToSubmit,
        subcategoria,
      });

      onClose();
    } catch (error) {
      console.error('Error al crear la categoría:', error);
    }
  };

  const handleCategoriaChange = (e) => {
    const value = e.target.value;
    setSelectedCategoria(value);
    if (value === '') {
      setNewCategoria('');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ ...modalStyle, width: 400 }}>
        <Typography variant="h6" gutterBottom>
          Crear o Seleccionar Categoría
        </Typography>
        <TextField
          select
          label="Seleccionar Categoría"
          value={selectedCategoria}
          onChange={handleCategoriaChange}
          fullWidth
          margin="normal"
          disabled={!!newCategoria}
        >
          <MenuItem value="">
            <em>Ninguna</em>
          </MenuItem>
          {categorias.map((cat) => (
            <MenuItem key={cat.id} value={cat.categoria}>
              {cat.categoria}
            </MenuItem>
          ))}
        </TextField>
        <Typography align="center" variant="body2">o</Typography>
        <TextField
          label="Nueva Categoría"
          value={newCategoria}
          onChange={(e) => setNewCategoria(e.target.value)}
          fullWidth
          margin="normal"
          disabled={!!selectedCategoria}
        />
        <TextField
          label="Subcategoría"
          value={subcategoria}
          onChange={(e) => setSubcategoria(e.target.value)}
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

export default CategoriaModal;

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