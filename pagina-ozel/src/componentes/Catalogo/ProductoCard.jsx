// ProductoCard.jsx
import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../AutentificacionProvider';
import { useNavigate } from 'react-router-dom';

const ProductoCard = ({ producto, onEdit }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = usuario?.Role === 'admin' || usuario?.Role === 'gestor';
  const imageUrl = producto.ImageURL ? encodeURI(producto.ImageURL) : '';

  // Calcula el precio con descuento si Discount es mayor a 0
  const price = Number(producto.Price) || 0;
  let discount = Number(producto.Discount) || 0;

  // Asegurar que el descuento no exceda el 99%
  if (discount > 99) {
    discount = 99;
  }

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleCardClick = () => {
    navigate(`/producto/${producto.ProductID}`, { state: { producto } });
  };

  return (
    <Card>
      <CardActionArea onClick={handleCardClick}>
        <Box position="relative">
          <CardMedia
            component="img"
            height="340"
            image={imageUrl}
            alt={producto.ProductName}
          />
          {discount > 0 && (
            <Box
              position="absolute"
              top={8}
              right={8}
              bgcolor="red"
              color="white"
              borderRadius="50%"
              width="40px"
              height="40px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              -{discount}%{/* Muestra el descuento corregido */}
            </Box>
          )}
        </Box>
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" style={{ fontWeight: 'bold' }}>
            {producto.ProductName}
          </Typography>

          {/* Contenedor para centrar y mostrar los precios */}
          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
            {discount > 0 ? (
              <>
                <Typography
                  variant="body1"
                  component="span"
                  style={{
                    textDecoration: 'line-through',
                    color: 'gray',
                    fontWeight: 'bold',
                  }}
                >
                  ${price.toFixed(2)}
                </Typography>
                <Typography
                  variant="body1"
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
              <Typography
                variant="body1"
                component="span"
                style={{ fontWeight: 'bold' }}
              >
                ${price.toFixed(2)}
              </Typography>
            )}
          </Box>

          <Typography variant="body2" component="div" style={{ color: 'gray' }}>
            HASTA 12 CUOTAS
          </Typography>
          {isAuthorized && (
            <Box mt={1} textAlign="right">
              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); onEdit(producto); }}>
                <EditIcon />
              </IconButton>
            </Box>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProductoCard;