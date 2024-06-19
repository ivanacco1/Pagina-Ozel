// ProductoCard.jsx
import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from './AutentificacionProvider';
import { useNavigate } from 'react-router-dom';

const ProductoCard = ({ producto, onEdit }) => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const isAuthorized = usuario?.Role === 'admin' || usuario?.Role === 'gestor';

  const imageUrl = producto.ImageURL ? encodeURI(producto.ImageURL) : '';

  const handleCardClick = () => {
    navigate(`/producto/${producto.ProductID}`, { state: { producto } });
  };

  return (
    <Card>
      <CardActionArea onClick={handleCardClick}>
        <CardMedia
          component="img"
          height="340"
          image={imageUrl}
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