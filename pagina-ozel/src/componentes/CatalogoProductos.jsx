import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import ProductoCard from './ProductoCard'; 
import ProductForm from './ProductForm';
import { useAuth } from './AutentificacionProvider';
import '../estilos/Catalogo.css';

const CatalogoProductos = () => {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [filtros, setFiltros] = useState({
    categoria: {},
    talla: {},
    color: {},
  });
  const [formValues, setFormValues] = useState({
    ProductID: '',
    ProductName: '',
    Category: '',
    Subcategory: '',
    Price: '',
    Stock: '',
    Size: '',
    Color: '',
    Discount: '',
    Description: '',
    Image: null,
    SaleStart: '',
    SaleEnd: ''
  });
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState('edit');

  useEffect(() => {
    cargarProductos();
    cargarFiltros();
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      if (response.status === 200) {
        setProductos(response.data);
      } else {
        console.error('Error al cargar la lista de productos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar la lista de productos:', error.response.data.message);
    }
  };

  const cargarFiltros = async () => {
    try {
      const [categoriasRes, coloresRes, tallasRes] = await Promise.all([
        axios.get('http://localhost:3000/api/categorias'),
        axios.get('http://localhost:3000/api/colores'),
        axios.get('http://localhost:3000/api/tallas'),
      ]);
  
      setCategorias(categoriasRes.data);
      setColores(coloresRes.data);
      setTallas(tallasRes.data);
  
      const categoriasFiltros = categoriasRes.data.reduce((acc, cat) => {
        if (!acc[cat.categoria]) {
          acc[cat.categoria] = {
            isChecked: false,
            subcategorias: {}
          };
        }
        acc[cat.categoria].subcategorias[cat.subcategoria] = false;
        return acc;
      }, {});
  
      setFiltros({
        categoria: categoriasFiltros,
        talla: tallasRes.data.reduce((acc, talla) => ({ ...acc, [talla.talla]: false }), {}),
        color: coloresRes.data.reduce((acc, color) => ({ ...acc, [color.color]: false }), {}),
      });
    } catch (error) {
      console.error('Error al cargar filtros:', error.message);
    }
  };

  const handleFiltroChange = (event) => {
    const { name, checked } = event.target;
    const [tipo, categoria, subcategoria] = name.split('.');
  
    setFiltros((prevFiltros) => {
      if (tipo === 'categoria' && subcategoria) {
        return {
          ...prevFiltros,
          categoria: {
            ...prevFiltros.categoria,
            [categoria]: {
              ...prevFiltros.categoria[categoria],
              subcategorias: {
                ...prevFiltros.categoria[categoria].subcategorias,
                [subcategoria]: checked
              }
            }
          }
        };
      } else {
        return {
          ...prevFiltros,
          [tipo]: {
            ...prevFiltros[tipo],
            [categoria]: checked
          }
        };
      }
    });
  };

  const filtrarProductos = () => {
    return productos.filter((producto) => {
      const { Category, Size, Color } = producto;
      
      // Verificar filtros de categoría
      const categoriaFiltro = Object.keys(filtros.categoria).every(key => {
        if (filtros.categoria[key]) {
          return Category.toLowerCase().includes(key.toLowerCase());
        }
        return true; // Mostrar todos si ningún filtro está seleccionado
      });
  
      // Verificar filtros de talla
      const tallaFiltro = Object.keys(filtros.talla).every(key => {
        if (filtros.talla[key]) {
          return Size.toLowerCase().includes(key.toLowerCase());
        }
        return true; // Mostrar todos si ningún filtro está seleccionado
      });
  
      // Verificar filtros de color
      const colorFiltro = Object.keys(filtros.color).every(key => {
        if (filtros.color[key]) {
          return Color.toLowerCase().includes(key.toLowerCase());
        }
        return true; // Mostrar todos si ningún filtro está seleccionado
      });
  
      // Mostrar el producto si cumple con todos los filtros
      return categoriaFiltro && tallaFiltro && colorFiltro;
    });
  };

  const productosFiltrados = filtrarProductos();

  const handleEditProductClick = (product) => {
    setFormMode('edit');
    setFormValues(product);
    setOpenFormDialog(true);
  };

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Catálogo de Productos
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3} md={3}>
          <Typography variant="h6">Filtrar por</Typography>
          <FormControl component="fieldset">
            <Typography variant="subtitle1">Categoría</Typography>
            <FormGroup>
              {Object.keys(filtros.categoria).map((categoria) => (
                <FormControlLabel
                  key={categoria}
                  control={<Checkbox checked={filtros.categoria[categoria]} onChange={handleFiltroChange} name={`categoria.${categoria}`} />}
                  label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                />
              ))}
            </FormGroup>
            <Typography variant="subtitle1">Talla</Typography>
            <FormGroup>
              {Object.keys(filtros.talla).map((talla) => (
                <FormControlLabel
                  key={talla}
                  control={<Checkbox checked={filtros.talla[talla]} onChange={handleFiltroChange} name={`talla.${talla}`} />}
                  label={talla.charAt(0).toUpperCase() + talla.slice(1)}
                />
              ))}
            </FormGroup>
            <Typography variant="subtitle1">Color</Typography>
            <FormGroup>
              {Object.keys(filtros.color).map((color) => (
                <FormControlLabel
                  key={color}
                  control={<Checkbox checked={filtros.color[color]} onChange={handleFiltroChange} name={`color.${color}`} />}
                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={9} md={9}>
          <Grid container spacing={2}>
            {productosFiltrados.map((producto) => (
              <Grid item key={producto.ProductID} xs={12} sm={6} md={4} lg={3}>
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