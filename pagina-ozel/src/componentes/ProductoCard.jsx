// ProductoCard.jsx

import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from './AutentificacionProvider';

const ProductoCard = ({ producto, onEdit }) => {
  const { usuario } = useAuth();
    //console.log(usuario.Role);
  const isAuthorized = usuario?.Role === 'admin' || usuario?.Role === 'gestor';

  return (
    <Card>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={producto.ImageUrl} // Asegúrate de que el producto tenga una URL de imagen
          alt={producto.ProductName}
        />
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" style={{ fontWeight: 'bold' }}>
            {producto.ProductName}
          </Typography>
          <Typography variant="body1" component="div" style={{ fontWeight: 'bold' }}>
            ${producto.Price}
          </Typography>
          <Typography variant="body2" component="div" style={{ color: 'gray' }}>
            HASTA 12 CUOTAS
          </Typography>
          {isAuthorized && (
            <Box mt={1} textAlign="right">
              <IconButton color="primary" onClick={() => onEdit(producto)}>
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