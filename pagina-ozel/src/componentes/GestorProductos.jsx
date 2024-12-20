import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, IconButton, Checkbox, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import ProductForm from './ProductForm';
import '../estilos/MiCuenta.css';
import { StockMin } from './Constantes';

const GestorProductos = () => {
  //const StockMin = 5;
  const { usuario } = useAuth();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [formMode, setFormMode] = useState('add');
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
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => { //consigue toda la lista de productos
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

  const handleAddProductClick = () => { //parametros de un producto
    setFormMode('add');
    setFormValues({
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
      SaleStart: '', //estos ya no se usan por el momento
      SaleEnd: ''    //estos ya no se usan por el momento
    });
    setOpenFormDialog(true);
  };


    // Estados para las casillas de verificación
    const [showVisible, setShowVisible] = useState(true);
    const [showOutOfStock, setShowOutOfStock] = useState(true);
    const [showHidden, setShowHidden] = useState(true);

  const handleEditProductClick = (product) => {
    setFormMode('edit');
    setFormValues(product);
    setOpenFormDialog(true);
  };

  const handleDeleteProductClick = (product) => {
    setSelectedProduct(product);
    setOpenDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    try {
      const response = await axios.delete(`http://localhost:3000/api/productos/${selectedProduct.ProductID}`, {
        data: {
          AdminPassword: adminPassword,
          AccountID: usuario.UserId
        }
      });
      if (response.status === 204) {
        alert('Producto eliminado correctamente.');
        cargarProductos();
      } else {
        console.error('Error al eliminar el producto:', response.statusText);
        alert('Error al eliminar el producto.');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error.response.data.message);
      if (error.response) {
        alert(`Error al eliminar el producto: ${error.response.data.message}`);
      } else {
        alert('Error al eliminar el producto.');
      }
    } finally {
      setOpenDeleteDialog(false);
      setAdminPassword('');
    }
  };

  const handleFormSubmit = () => {
    cargarProductos(); //recarga la lista de productos al enviar un formulario
  };

 // Filtrar productos según las casillas
 const filteredProductos = productos.filter((product) => {
  const matchesSearch = 
    isValueIncluded(product.ProductName, searchTerm) ||
    isValueIncluded(product.Category, searchTerm) ||
    isValueIncluded(product.Subcategory, searchTerm);

  const matchesVisibility = 
    (showVisible && !product.IsHidden && product.Stock > StockMin) ||
    (showOutOfStock && product.Stock <= StockMin && !product.IsHidden) ||
    (showHidden && product.IsHidden);

  return matchesSearch && matchesVisibility;
});

  

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

<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={showVisible}
              onChange={() => setShowVisible(!showVisible)}
            />
          }
          label="Visibles"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showOutOfStock}
              onChange={() => setShowOutOfStock(!showOutOfStock)}
            />
          }
          label="Agotados"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={showHidden}
              onChange={() => setShowHidden(!showHidden)}
            />
          }
          label="Ocultos"
        />
      </div>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper} style={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Categoria</TableCell>
                  <TableCell>Subcategoria</TableCell>
                  <TableCell>Precio</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tamaño</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Descuento</TableCell>
                  <TableCell>Editar</TableCell>
                  <TableCell>Eliminar</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProductos.map((product) => {
 
                  // Determina el color de fondo según las condiciones
                  const backgroundColor = product.IsHidden
                  ? 'rgba(255, 235, 59, 0.3)' // Amarillo claro para productos ocultos
                  : product.Stock <= StockMin
                  ? 'rgba(244, 67, 54, 0.3)'  // Rojizo claro para stock bajo
                  : 'transparent';            // Fondo transparente para otros casos


                  return (
                  <TableRow 
                  key={product.ProductID} 
                  sx={{ backgroundColor }}>
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
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteProductClick(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <ProductForm
            open={openFormDialog}
            onClose={() => setOpenFormDialog(false)}
            onFormSubmit={handleFormSubmit}
            formMode={formMode}
            formValues={formValues}
            setFormValues={setFormValues}
          />

          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                ¿Está seguro de que desea eliminar el producto "{selectedProduct?.ProductName}"?
              </Typography>
              <TextField
                label="Contraseña del Administrador"
                type="password"
                fullWidth
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                margin="normal"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDeleteDialog(false)} color="primary">Cancelar</Button>
              <Button onClick={confirmDeleteProduct} color="primary" variant="contained">Confirmar</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default GestorProductos;