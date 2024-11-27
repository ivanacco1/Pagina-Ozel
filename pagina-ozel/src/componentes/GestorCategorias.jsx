import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Tabs, Tab, Box } from '@mui/material';
import { Delete } from '@mui/icons-material';
import CategoriaModal from './CategoriaModal';
import ColorModal from './ColorModal';
import TallaModal from './TallaModal';

const GestorCategorias = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [tallaModalOpen, setTallaModalOpen] = useState(false);

  useEffect(() => {
    cargarDatos(); //carga los datos cuando se abre una ventana
  }, [tabIndex, modalOpen, colorModalOpen, tallaModalOpen]);


  const cargarDatos = async () => { //llama todas las categorias para filtros
    try {
      if (tabIndex === 0) {
        const response = await axios.get('http://localhost:3000/api/categorias');
        setCategorias(response.data);
      } else if (tabIndex === 1) {
        const response = await axios.get('http://localhost:3000/api/colores');
        setColores(response.data);
      } else if (tabIndex === 2) {
        const response = await axios.get('http://localhost:3000/api/tallas');
        setTallas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar los datos:', error.message);
    }
  };

  const handleEliminar = async (id, tipo) => {
    try {
      if (tipo === 'categoria') {
        await axios.delete(`http://localhost:3000/api/categorias/${id}`);
        cargarDatos();
      } else if (tipo === 'color') {
        await axios.delete(`http://localhost:3000/api/colores/${id}`);
        cargarDatos();
      } else if (tipo === 'talla') {
        await axios.delete(`http://localhost:3000/api/tallas/${id}`);
        cargarDatos();
      }
    } catch (error) {
      console.error(`Error al eliminar la ${tipo}:`, error.message);
    }
  };

  const handleCategoriaCreated = () => {
    cargarDatos(); //vuelve a cargar
  };

  return (
    <div>
      <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)}>
        <Tab label="Categorías" />
        <Tab label="Colores" />
        <Tab label="Tallas" />
      </Tabs>

      <Box mt={2}>
        {tabIndex === 0 && (
          <>
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
                        <IconButton onClick={() => handleEliminar(cat.id, 'categoria')}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabIndex === 1 && (
          <>
            <h2>Gestión de Colores</h2>
            <Button variant="contained" color="primary" onClick={() => setColorModalOpen(true)}>
              Nuevo Color
            </Button>
            <ColorModal
              open={colorModalOpen}
              onClose={() => setColorModalOpen(false)}
              onColorCreated={cargarDatos} // Aquí se llama directamente a cargarDatos después de crear un color
            />
            <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Color</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {colores.map((color) => (
                    <TableRow key={color.idColor}>
                      <TableCell>{color.color}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEliminar(color.idColor, 'color')}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {tabIndex === 2 && (
          <>
            <h2>Gestión de Tallas</h2>
            <Button variant="contained" color="primary" onClick={() => setTallaModalOpen(true)}>
              Nueva Talla
            </Button>
            <TallaModal
              open={tallaModalOpen}
              onClose={() => setTallaModalOpen(false)}
              onTallaCreated={cargarDatos} // Aquí se llama directamente a cargarDatos después de crear una talla
            />
            <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Talla</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tallas.map((talla) => (
                    <TableRow key={talla.idTalla}>
                      <TableCell>{talla.talla}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEliminar(talla.idTalla, 'talla')}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </div>
  );
};

export default GestorCategorias;