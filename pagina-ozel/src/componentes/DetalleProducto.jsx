import React from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useAuth } from './AutentificacionProvider'; 

const DetalleProducto = () => {
  const location = useLocation();
  const { producto } = location.state || {};
  const { usuario } = useAuth(); 

  if (!producto) {
    return <Typography>No se encontró el producto</Typography>;
  }

  // Calcula el precio con descuento si Discount es mayor a 0
  const price = Number(producto.Price) || 0;
  let discount = Number(producto.Discount) || 0;

  // Asegura que el descuento no exceda el 99%
  if (discount > 99) {
    discount = 99;
  }

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleAddToCart = async () => {
    if (!usuario) {
      alert("Debes iniciar sesión o registrarte para añadir productos al carrito.");
      return;
    }

    const cartItem = {
      Quantity: 1, // Añade 1 item en el carrito
      Productos_ProductID: producto.ProductID,
      Usuarios_AccountID: usuario.UserId,
    };

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
          
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            {discount > 0 ? (
              <>
                <Typography
                  variant="h5"
                  style={{ textDecoration: 'line-through', color: 'gray', fontWeight: 'bold' }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Typography
                  variant="h5"
                  style={{ color: 'red', fontWeight: 'bold' }}
                >
                  ${discountedPrice.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="h5" color="textSecondary" gutterBottom>
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>

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