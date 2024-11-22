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
        console.log(response.data);
      } catch (error) {
        console.error('Error al cargar los detalles del producto:', error.message);
      }
    };

    fetchProducto();
  }, [id]);

  if (!producto) return <div>Cargando...</div>;

  const price = Number(producto.Price) || 0;
  let discount = Number(producto.Discount) || 0;

  // Asegurar que el descuento no exceda el 99%
  if (discount > 99) {
    discount = 99;
  }

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

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

          {/* Mostrar el precio con descuento si aplica */}
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            {discount > 0 ? (
              <>
                <Typography
                  variant="h6"
                  component="span"
                  style={{
                    textDecoration: 'line-through',
                    color: 'gray',
                  }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Typography
                  variant="h6"
                  component="span"
                  style={{
                    color: 'red',
                    fontWeight: 'bold',
                  }}
                >
                  ${discountedPrice.toFixed(2)}
                </Typography>
              </>
            ) : (
              <Typography variant="h6">${price.toFixed(2)}</Typography>
            )}
          </Box>

          {discount > 0 && (
            <Typography
              variant="body2"
              style={{ color: 'green', fontWeight: 'bold' }}
            >
              ¡{discount}% de descuento!
            </Typography>
          )}

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