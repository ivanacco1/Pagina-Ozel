import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import CategoriaModal from './CategoriaModal'; // Importar el modal

const GestorCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Error al cargar las categorías:', error.message);
    }
  };

  const handleEliminarCategoria = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/categorias/${id}`);
      cargarCategorias(); // Recargar la lista de categorías después de eliminar
    } catch (error) {
      console.error('Error al eliminar la categoría:', error.message);
    }
  };

  const handleCategoriaCreated = () => {
    cargarCategorias(); // Recargar la lista de categorías después de crear una nueva
  };

  return (
    <div>
      <h2>Gestión de Categorías</h2>
      <Button variant="contained" color="primary" onClick={() => setModalOpen(true)}>
        Nueva Categoría
      </Button>
      <CategoriaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCategoriaCreated={handleCategoriaCreated}
      />
      <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Categoría</TableCell>
              <TableCell>Subcategoría</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorias.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell>{cat.categoria}</TableCell>
                <TableCell>{cat.subcategoria}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEliminarCategoria(cat.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default GestorCategorias;