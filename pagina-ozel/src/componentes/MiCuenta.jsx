import React, { useState, useEffect } from 'react';
import { useAuth } from './AutentificacionProvider';
import { Typography, Container, Box, AppBar, Tabs, Tab, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import './MiCuenta.css';

const MiCuenta = () => {
  const { usuario } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Actualizar historial de compras cuando cambie el usuario
    if (usuario && usuario.Pedidos) {
      setHistorialCompras(usuario.Pedidos);
    }
  }, [usuario]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 2) { // Si se selecciona la pestaña "Historial de Compras"
      cargarHistorialCompras(); // Cargar historial de compras
    }
  };

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.UserId}/pedidos`);
      if (response.ok) {
        const data = await response.json();
        setHistorialCompras(data);
      } else {
        console.error('Error al cargar historial de compras:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar historial de compras:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return <Typography variant="h5">Debes estar logueado para ver esta página.</Typography>;
  }

  return (
    <Container className="mi-cuenta-container">
      <Box className="mi-cuenta-box">
        <AppBar position="static" color="default">
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            className="tabs-centered"
          >
            <Tab label="Resumen" />
            <Tab label="Modificar Datos" />
            <Tab label="Historial de Compras" />
            {usuario.Role === 'admin' && <Tab label="Gestor de Productos" />}
            {usuario.Role === 'admin' && <Tab label="Gestor de Cuentas" />}
          </Tabs>
        </AppBar>
        <Box p={3} className="mi-cuenta-content">
          
          {selectedTab === 0 && (
            <>
              <Typography variant="h4" gutterBottom>Mi Cuenta</Typography>
              <Typography variant="h6">{`${usuario.FirstName} ${usuario.LastName}`}</Typography>
              <Typography variant="h6">{usuario.Email}</Typography>
              <Typography variant="h6">{usuario.Phone}</Typography>
              <Typography variant="h6">{usuario.Address}, {usuario.City}, {usuario.PostalCode}</Typography>
            </>
          )}
          {selectedTab === 1 && (
            <>
              {/* Contenido para modificar datos */}
            </>
          )}
          {selectedTab === 2 && (
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
          )}
          {/* Agregar el contenido para las otras pestañas */}
        </Box>
      </Box>
    </Container>
  );
};

export default MiCuenta;