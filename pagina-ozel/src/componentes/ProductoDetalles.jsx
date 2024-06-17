// ProductoDetalles.jsx
// TODO --- SIN IMPLEMENTAR
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Grid, CardMedia } from '@mui/material';

const ProductoDetalles = () => {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/productos/${id}`);
        setProducto(response.data);
      } catch (error) {
        console.error('Error al cargar los detalles del producto:', error.message);
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) return <div>Cargando...</div>;

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            image={producto.ImageURL}
            alt={producto.ProductName}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>{producto.ProductName}</Typography>
          <Typography variant="h6" gutterBottom>${producto.Price}</Typography>
          <Typography variant="body1" gutterBottom>{producto.Description}</Typography>
          <Typography variant="body2" color="textSecondary">Categoría: {producto.Category}</Typography>
          <Typography variant="body2" color="textSecondary">Talla: {producto.Size}</Typography>
          <Typography variant="body2" color="textSecondary">Color: {producto.Color}</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductoDetalles;