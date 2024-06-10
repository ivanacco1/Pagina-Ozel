import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { useAuth } from './AutentificacionProvider';
import './MiCuenta.css';
import axios from 'axios';

const HistorialCompras = () => {
  const { usuario } = useAuth();
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarHistorialCompras();
  }, []);

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/usuarios/${usuario.UserId}/pedidos`);
      if (response.status === 200) {
        setHistorialCompras(response.data);
      } else {
        console.error('Error al cargar historial de compras:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar historial de compras:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Typography variant="h5" gutterBottom mt={4}>Historial de Compras</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {historialCompras.map((pedido, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="body1">
                    Pedido ID: {pedido.OrderID}, Fecha: {pedido.OrderDate}, Total: ${pedido.TotalAmount}, Estado: {pedido.Status}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default HistorialCompras;