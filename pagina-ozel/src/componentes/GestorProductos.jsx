import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, IconButton, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import '../estilos/MiCuenta.css';

const GestorProductos = () => {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' o 'edit'
  const [formValues, setFormValues] = useState({
    ProductID: '',
    ProductName: '',
    Category: '',
    Subcategory: '',
    Price: '',
    Stock: '',
    DateAdded: '',
    Size: '',
    Color: '',
    Discount: ''
  });

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/productos');
      if (response.status === 200) {
        setProductos(response.data);
      } else {
        console.error('Error al cargar la lista de productos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar la lista de productos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const isValueIncluded = (value, searchTerm) => {
    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleAddProductClick = () => {
    setFormMode('add');
    setFormValues({
      ProductID: '',
      ProductName: '',
      Category: '',
      Subcategory: '',
      Price: '',
      Stock: '',
      DateAdded: '',
      Size: '',
      Color: '',
      Discount: ''
    });
    setOpenFormDialog(true);
  };

  const handleEditProductClick = (product) => {
    setFormMode('edit');
    setFormValues(product);
    setOpenFormDialog(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleFormSubmit = async () => {
    try {
      if (formMode === 'add') {
        const response = await axios.post('http://localhost:3000/api/productos', formValues);
        if (response.status === 201) {
          alert('Producto añadido correctamente.');
        } else {
          console.error('Error al añadir el producto:', response.statusText);
          alert('Error al añadir el producto.');
        }
      } else {
        const response = await axios.put(`http://localhost:3000/api/productos/${formValues.ProductID}`, formValues);
        if (response.status === 200) {
          alert('Producto actualizado correctamente.');
        } else {
          console.error('Error al actualizar el producto:', response.statusText);
          alert('Error al actualizar el producto.');
        }
      }
      cargarProductos();
    } catch (error) {
      console.error('Error al enviar el formulario:', error.message);
      alert('Error al enviar el formulario.');
    } finally {
      setOpenFormDialog(false);
    }
  };

  const filteredProductos = productos.filter((product) =>
    isValueIncluded(product.ProductName, searchTerm) ||
    isValueIncluded(product.Category, searchTerm) ||
    isValueIncluded(product.Subcategory, searchTerm)
  );

  return (
    <>
      <Typography variant="h5" gutterBottom mt={4}>Gestor de Productos</Typography>
      <Button variant="contained" color="primary" onClick={handleAddProductClick}>
        Añadir Nuevo Producto
      </Button>
      <TextField
        label="Buscar producto"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper} style={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ProductID</TableCell>
                  <TableCell>ProductName</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>DateAdded</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Editar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProductos.map((product) => (
                  <TableRow key={product.ProductID}>
                    <TableCell>{product.ProductID}</TableCell>
                    <TableCell>{product.ProductName}</TableCell>
                    <TableCell>{product.Category}</TableCell>
                    <TableCell>{product.Subcategory}</TableCell>
                    <TableCell>{product.Price}</TableCell>
                    <TableCell>{product.Stock}</TableCell>
                    <TableCell>{product.DateAdded}</TableCell>
                    <TableCell>{product.Size}</TableCell>
                    <TableCell>{product.Color}</TableCell>
                    <TableCell>{product.Discount}</TableCell>
                    <TableCell>
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditProductClick(product)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Formulario de producto */}
          <Dialog open={openFormDialog} onClose={() => setOpenFormDialog(false)}>
            <DialogTitle>{formMode === 'add' ? 'Añadir Nuevo Producto' : 'Editar Producto'}</DialogTitle>
            <DialogContent>
              <Box
                component="form"
                sx={{
                  '& .MuiTextField-root': { m: 1, width: '100%' },
                }}
                noValidate
                autoComplete="off"
              >
                <TextField
                  required
                  label="Nombre del Producto"
                  name="ProductName"
                  value={formValues.ProductName}
                  onChange={handleFormChange}
                />
                <TextField
                  required
                  label="Categoría"
                  name="Category"
                  value={formValues.Category}
                  onChange={handleFormChange}
                />
                <TextField
                  required
                  label="Subcategoría"
                  name="Subcategory"
                  value={formValues.Subcategory}
                  onChange={handleFormChange}
                />
                <TextField
                  required
                  label="Precio"
                  name="Price"
                  type="number"
                  value={formValues.Price}
                  onChange={handleFormChange}
                />
                <TextField
                  required
                  label="Stock"
                  name="Stock"
                  type="number"
                  value={formValues.Stock}
                  onChange={handleFormChange}
                />
                <TextField
                  required
                  label="Fecha de Adición"
                  name="DateAdded"
                  type="date"
                  value={formValues.DateAdded}
                  onChange={handleFormChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  label="Tamaño"
                  name="Size"
                  value={formValues.Size}
                  onChange={handleFormChange}
                />
                <TextField
                  label="Color"
                  name="Color"
                  value={formValues.Color}
                  onChange={handleFormChange}
                />
                <TextField
                  label="Descuento"
                  name="Discount"
                  type="number"
                  value={formValues.Discount}
                  onChange={handleFormChange}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenFormDialog(false)} color="primary">Cancelar</Button>
              <Button onClick={handleFormSubmit} color="primary" variant="contained">
                {formMode === 'add' ? 'Añadir' : 'Guardar'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default GestorProductos;