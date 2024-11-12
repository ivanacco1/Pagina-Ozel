import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, Box, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ProductoCard from './Catalogo/ProductoCard';
import ProductForm from './ProductForm';
import { useAuth } from './AutentificacionProvider';
import FiltrosComponentes from './Catalogo/FiltrosComponentes';
import { cargarFiltros, filtrarProductos } from './Catalogo/FiltrosFunciones';

const CatalogoProductos = () => {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [filtros, setFiltros] = useState({ categoria: {}, talla: {}, color: {} });
  const [formValues, setFormValues] = useState({});
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState('edit');
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda
  const [sortCriteria, setSortCriteria] = useState(''); // Estado para el criterio de ordenación

  useEffect(() => {
    cargarProductos();
    cargarFiltros(setCategorias, setColores, setTallas, setFiltros);
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      if (response.status === 200) setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar la lista de productos:', error.response?.data?.message);
    }
  };

  const handleFiltroChange = (event) => {
    const { name, checked } = event.target;
    const [tipo, categoria, subcategoria] = name.split('.');
    setFiltros((prevFiltros) => {
      const newFiltros = { ...prevFiltros };
      if (tipo === 'categoria') {
        if (subcategoria) {
          newFiltros.categoria[categoria].isChecked = true;
          newFiltros.categoria[categoria].subcategorias[subcategoria].isChecked = checked;
        } else {
          newFiltros.categoria[categoria].isChecked = checked;
          for (const sub of Object.keys(newFiltros.categoria[categoria].subcategorias)) {
            newFiltros.categoria[categoria].subcategorias[sub].isChecked = checked;
          }
        }
      } else {
        newFiltros[tipo][categoria].isChecked = checked;
      }
      return newFiltros;
    });
  };

  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };

  // Filtrar y ordenar productos
  const productosFiltrados = filtrarProductos(productos, filtros)
    .filter((producto) => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        producto.ProductName.toLowerCase().includes(lowerSearchTerm) ||
        producto.Description.toLowerCase().includes(lowerSearchTerm) ||
        producto.Category.toLowerCase().includes(lowerSearchTerm) ||
        producto.Subcategory.toLowerCase().includes(lowerSearchTerm) ||
        producto.Size.toLowerCase().includes(lowerSearchTerm)
      );
    })
    .sort((a, b) => {
      if (sortCriteria === 'price') return a.Price - b.Price;
      if (sortCriteria === 'date') return new Date(b.Date) - new Date(a.Date);
      return 0;
    });

  const handleEditProductClick = (product) => {
    setFormMode('edit');
    setFormValues(product);
    setOpenFormDialog(true);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
        Catálogo de Productos
      </Typography>
      <Box display="flex" alignItems="center" sx={{ mb: 4 }}>
        <TextField
          label="Buscar productos"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mr: 2 }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 180 }}>
          <InputLabel>Ordenar por</InputLabel>
          <Select
            value={sortCriteria}
            onChange={handleSortChange}
            label="Ordenar por"
          >
            <MenuItem value="">Sin ordenar</MenuItem>
            <MenuItem value="price">Precio</MenuItem>
            <MenuItem value="date">Fecha</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3} md={3} style={{ maxWidth: '250px' }}>
          <Typography variant="h6">Filtrar por</Typography>
          <FiltrosComponentes filtros={filtros} handleFiltroChange={handleFiltroChange} />
        </Grid>
        <Grid item xs={12} sm={9} md={9}>
          <Grid container spacing={2}>
            {productosFiltrados.map((producto) => (
              <Grid item key={producto.id} xs={12} sm={6} md={4}>
                <ProductoCard producto={producto} onEdit={handleEditProductClick} />
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
      <ProductForm
        open={openFormDialog}
        onClose={() => setOpenFormDialog(false)}
        onFormSubmit={cargarProductos}
        formMode={formMode}
        formValues={formValues}
        setFormValues={setFormValues}
      />
    </Box>
  );
};

export default CatalogoProductos;