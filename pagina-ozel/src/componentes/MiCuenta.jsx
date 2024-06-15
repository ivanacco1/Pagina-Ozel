import React, { useState, useEffect } from 'react';
import { useAuth } from './AutentificacionProvider';
import { Typography, Container, Box, AppBar, Tabs, Tab } from '@mui/material';
import '../estilos/MiCuenta.css';
import Resumen from './Resumen';
import HistorialCompras from './HistorialCompras';
import GestorCuentas from './GestorCuentas';
import GestorProductos from './GestorProductos';

const MiCuenta = () => {
  const { usuario } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (usuario && usuario.Pedidos) {
      setHistorialCompras(usuario.Pedidos);
    }
  }, [usuario]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
            <Tab label="Historial de Compras" />
            {(usuario.Role === 'admin' || usuario.Role === 'gestor') && <Tab label="Gestor de Productos" />}
            {usuario.Role === 'admin' && <Tab label="Gestor de Cuentas" />}
          </Tabs>
        </AppBar>
        <Box p={3} className="mi-cuenta-content">
          {selectedTab === 0 && <Resumen />}
          {selectedTab === 1 && <HistorialCompras />}
          {selectedTab === 2 && <GestorProductos />}
          {selectedTab === 3 && <GestorCuentas />}
        </Box>
      </Box>
    </Container>
  );
};

export default MiCuenta;