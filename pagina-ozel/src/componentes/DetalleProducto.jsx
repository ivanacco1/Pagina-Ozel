// DetalleProducto.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useAuth } from './AutentificacionProvider'; // Importa el proveedor de autenticación


const DetalleProducto = () => {
  const location = useLocation();
  const { producto } = location.state || {};
  const { usuario } = useAuth(); // Obtén el usuario autenticado


  if (!producto) {
    return <Typography>No se encontró el producto</Typography>;
  }

  const handleAddToCart = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión o registrarte para añadir productos al carrito.");
     
      return;
    }

    const cartItem = {
      Quantity: 1, // Puedes cambiar esto para permitir la selección de cantidad
      Productos_ProductID: producto.ProductID,
      Usuarios_AccountID: usuario.UserId,
    };
    //console.log(cartItem);
    try {
      const response = await axios.post('http://localhost:5000/api/carrito', cartItem);
      if (response.status === 200) {
        alert('Producto añadido al carrito');
      } else {
        console.error('Error al añadir producto al carrito:', response.statusText);
      }
    } catch (error) {
      console.error('Error al añadir producto al carrito:', error.response.data.message);
      alert('Error al añadir producto al carrito: ' + error.response.data.message);
    }
  };

  return (
    <Box p={2}>
      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={5}>
          <img 
            src={producto.ImageURL} 
            alt={producto.ProductName} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxWidth: '32vw', 
              marginLeft: '40px',
            }} 
          />
        </Grid>
        <Grid item xs={12} md={7}>
          <Typography variant="h4" gutterBottom>{producto.ProductName}</Typography>
          <Typography variant="body1" gutterBottom>{producto.Description}</Typography>
          <Typography variant="h5" color="textSecondary" gutterBottom>Precio: ${producto.Price}</Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>Categoría: {producto.Category}</Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>Subcategoría: {producto.Subcategory}</Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>Tamaño: {producto.Size}</Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>Color: {producto.Color}</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            style={{ marginTop: '16px' }}
            onClick={handleAddToCart}
          >
            Añadir al Carrito
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetalleProducto;