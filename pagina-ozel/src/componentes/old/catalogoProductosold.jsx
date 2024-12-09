import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Typography, FormControl, FormGroup, FormControlLabel, Checkbox, Box } from '@mui/material';
import ProductoCard from '../Catalogo/ProductoCard'; 
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

  const cargarProductos = async () => { //endpoint para conseguir todos los productos de la bbdd
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

  const cargarFiltros = async () => { //carga todos los filtros existentes de la bbdd
    try {
      const [categoriasRes, coloresRes, tallasRes] = await Promise.all([
        axios.get('http://localhost:3000/api/categorias'),
        axios.get('http://localhost:3000/api/colores'),
        axios.get('http://localhost:3000/api/tallas'),
      ]);
  
      setCategorias(categoriasRes.data);
      setColores(coloresRes.data);
      setTallas(tallasRes.data);
  
      const categoriasFiltros = categoriasRes.data.reduce((acc, cat) => { //arma los filtros de forma dinámica
        if (!acc[cat.categoria]) {
          acc[cat.categoria] = {
            isChecked: false,
            subcategorias: {}
          };
        }
        acc[cat.categoria].subcategorias[cat.subcategoria] = {
          isChecked: false,
        };
        return acc;
      }, {});

      const TallasFiltros = tallasRes.data.reduce((acc, talla) => {
          acc[talla.talla] = {
            isChecked: false,
          };

        return acc;
      }, {});

      const ColoresFiltros = coloresRes.data.reduce((acc, color) => {
        acc[color.color] = {
          isChecked: false,
        };

      return acc;
    }, {});
      
  
      setFiltros({
        categoria: categoriasFiltros,
        talla: TallasFiltros,
        color: ColoresFiltros,
      });
    } catch (error) {
      console.error('Error al cargar filtros:', error.message);
    }

  };

 /* useEffect(() => {
    console.log('Filtros actualizados:', filtros);
  }, [filtros]);*/

  const handleFiltroChange = (event) => { //función de la lógica de filtrado
    const { name, checked } = event.target;
    const [tipo, categoria, subcategoria] = name.split('.');
  
    if (tipo === 'categoria') {
      if (subcategoria) {
        // Si se selecciona una subcategoría, marca también la categoría
        setFiltros((prevFiltros) => ({
          ...prevFiltros,
          categoria: {
            ...prevFiltros.categoria,
            [categoria]: {
              ...prevFiltros.categoria[categoria],
              isChecked: true, // Selecciona la categoría
              subcategorias: {
                ...prevFiltros.categoria[categoria].subcategorias,
                [subcategoria]: { isChecked: checked } // Selecciona o deselecciona la subcategoría
              }
            }
          }
        }));
      } else {
        // Si solo se selecciona la categoría, cambiar el estado de la categoría y las subcategorías
        setFiltros((prevFiltros) => {
          const subcategoriasActualizadas = Object.keys(prevFiltros.categoria[categoria].subcategorias).reduce(
            (acc, subcategoriaKey) => ({
              ...acc,
              [subcategoriaKey]: { isChecked: checked } // Deselecciona todas las subcategorías si la categoría es deseleccionada
            }),
            {}
          );
  
          return {
            ...prevFiltros,
            categoria: {
              ...prevFiltros.categoria,
              [categoria]: {
                ...prevFiltros.categoria[categoria],
                isChecked: checked,
                subcategorias: subcategoriasActualizadas
              }
            }
          };
        });
      }
    } else {
      // Actualiza color o talla
      setFiltros((prevFiltros) => ({
        ...prevFiltros,
        [tipo]: {
          ...prevFiltros[tipo],
          [categoria]: { isChecked: checked }
        }
      }));
    }
  };

  const filtrarProductos = () => {
    return productos.filter((producto) => {
      const { Category, Subcategory, Size, Color } = producto;
  
      // Verifica filtros de categoría y subcategoría 
      const categoriaFiltro = Object.keys(filtros.categoria).some((categoria) => {
        const categoriaData = filtros.categoria[categoria];
        
        // Verifica si la categoría o alguna subcategoría está seleccionada
        const subcategoriasSeleccionadas = Object.values(categoriaData.subcategorias).some(sub => sub.isChecked);
        
        // Si ninguna subcategoría ni la categoría están seleccionadas, ignora esta categoría
        if (!categoriaData.isChecked && !subcategoriasSeleccionadas) return false;
  
        // Si la categoría está seleccionada, verifica si coincide la categoría o alguna subcategoría
        return (
          (categoriaData.isChecked && Category === categoria) ||
          (subcategoriasSeleccionadas && categoriaData.subcategorias[Subcategory]?.isChecked)
        );
      });
  
      // Verifica filtros de talla 
      const tallaFiltro = Object.keys(filtros.talla).some((talla) => {
        if (!filtros.talla[talla].isChecked) return false; 
        return Size === talla; 
      });
  
      // Verifica filtros de color
      const colorFiltro = Object.keys(filtros.color).some((color) => {
        if (!filtros.color[color].isChecked) return false; 
        return Color === color; 
      });
  
      // Si no hay filtros activos, devuelve todos los productos
      const hayFiltrosDeCategoria = Object.keys(filtros.categoria).some(cat => filtros.categoria[cat].isChecked || 
        Object.values(filtros.categoria[cat].subcategorias).some(sub => sub.isChecked));
      const hayFiltrosDeTalla = Object.values(filtros.talla).some(talla => talla.isChecked);
      const hayFiltrosDeColor = Object.values(filtros.color).some(color => color.isChecked);
  
      return (!hayFiltrosDeCategoria || categoriaFiltro) &&
             (!hayFiltrosDeTalla || tallaFiltro) &&
             (!hayFiltrosDeColor || colorFiltro);
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
        <Grid item xs={12} sm={3} md={3} style={{ maxWidth: '250px' }}>
          <Typography variant="h6">Filtrar por</Typography>
          <FormControl component="fieldset">
            {/* Categoría */}
            <Typography variant="subtitle1">Categoría</Typography>
            <FormGroup style={{ textAlign: 'left' }}>
              {Object.keys(filtros.categoria).map((categoria) => (
                <Box key={categoria} ml={1} style={{ display: 'flex', flexDirection: 'column' }}>
                  {/* Categoría */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filtros.categoria[categoria].isChecked}
                        onChange={handleFiltroChange}
                        name={`categoria.${categoria}`}
                      />
                    }
                    label={categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                    style={{ justifyContent: 'flex-start' }} 
                  />
                  {/* Subcategorías con dentado */}
                  <Box ml={4} style={{ display: 'flex', flexDirection: 'column' }}>
                    {Object.keys(filtros.categoria[categoria].subcategorias).map((subcategoria) => (
                      <FormControlLabel
                        key={subcategoria}
                        control={
                          <Checkbox
                            checked={filtros.categoria[categoria].subcategorias[subcategoria].isChecked}
                            onChange={handleFiltroChange}
                            name={`categoria.${categoria}.${subcategoria}`}
                          />
                        }
                        label={subcategoria.charAt(0).toUpperCase() + subcategoria.slice(1)}
                        style={{ justifyContent: 'flex-start' }} 
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </FormGroup>
            
            {/* Talla */}
            <Typography variant="subtitle1">Talla</Typography>
            <FormGroup style={{ textAlign: 'left' }}>
              {Object.keys(filtros.talla).map((talla) => (
                <FormControlLabel
                  key={talla}
                  control={
                    <Checkbox
                      checked={filtros.talla[talla].isChecked}
                      onChange={handleFiltroChange}
                      name={`talla.${talla}`}
                    />
                  }
                  label={talla.charAt(0).toUpperCase() + talla.slice(1)}
                  style={{ justifyContent: 'flex-start' }} // Justificar a la izquierda
                />
              ))}
            </FormGroup>
            
            {/* Color */}
            <Typography variant="subtitle1">Color</Typography>
            <FormGroup style={{ textAlign: 'left' }}>
              {Object.keys(filtros.color).map((color) => (
                <FormControlLabel
                  key={color}
                  control={
                    <Checkbox
                      checked={filtros.color[color].isChecked}
                      onChange={handleFiltroChange}
                      name={`color.${color}`}
                    />
                  }
                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                  style={{ justifyContent: 'flex-start' }} // Justificar a la izquierda
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
  
        {/* Mostrar productos filtrados */}
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