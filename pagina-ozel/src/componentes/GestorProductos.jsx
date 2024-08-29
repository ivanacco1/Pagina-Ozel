import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import ProductForm from './ProductForm';
import '../estilos/MiCuenta.css';

const GestorProductos = () => {
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
      Size: '',
      Color: '',
      Discount: '',
      Description: '',
      Image: null,
      SaleStart: '',
      SaleEnd: ''
    });
    setOpenFormDialog(true);
  };

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
    cargarProductos();
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
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteProductClick(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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