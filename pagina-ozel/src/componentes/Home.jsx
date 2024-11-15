import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box } from '@mui/material';
import ProductoCard from './Catalogo/ProductoCard';
import axios from 'axios';
import '../estilos/Home.css';

const Home = () => {
  const [productosConDescuento, setProductosConDescuento] = useState([]);

  useEffect(() => {
    const cargarProductosConDescuento = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/productos');
        if (response.status === 200) {
          const productosFiltrados = response.data.filter((producto) => producto.Discount > 0);
          setProductosConDescuento(productosFiltrados);
        }
      } catch (error) {
        console.error('Error al cargar productos con descuento:', error.response?.data?.message);
      }
    };
    cargarProductosConDescuento();
  }, []);

  return (
    <div>
    <div className="home-container">
      {/* Sección principal con imagen y texto */}
      <div className="text-overlay">
        <h1 className="main-title">OZEL</h1>
        <h2 className="sub-title">moda y <br /> exclusividad</h2>
      </div>
      </div>
      {/* Sección de Ofertas */}
      {productosConDescuento.length > 0 && (
  <Box className="ofertas-section" p={2} mt={4}>
    <Typography variant="h4" component="h2" textAlign="center" sx={{ mb: 4 }}>
      Ofertas Exclusivas
    </Typography>
    <Grid container spacing={2}>
      {productosConDescuento.map((producto) => (
        <Grid item key={producto.id} xs={12} sm={6} md={3}>
          <ProductoCard producto={producto} />
        </Grid>
      ))}
    </Grid>
  </Box>
)}
      </div>
  );
};

export default Home;