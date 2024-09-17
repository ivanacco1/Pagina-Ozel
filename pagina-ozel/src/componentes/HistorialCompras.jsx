import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Button, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useAuth } from './AutentificacionProvider';
import '../estilos/MiCuenta.css';
import axios from 'axios';

const HistorialCompras = () => {
  const { usuario } = useAuth();
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1); // Página actual
  const [detallePedido, setDetallePedido] = useState(null); // Pedido seleccionado para mostrar detalles
  const [modalOpen, setModalOpen] = useState(false); // Estado del modal

  const pedidosPorPagina = 15; // Número de pedidos por página

  useEffect(() => {
    cargarHistorialCompras();
  }, [paginaActual]);

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/usuarios/${usuario.UserId}/pedidos?page=${paginaActual}&limit=${pedidosPorPagina}`);
      if (response.status === 200) {
        // Ordenar por OrderID (descendente) para que el ID más alto sea el primero
        const pedidosOrdenados = response.data.sort((a, b) => b.OrderID - a.OrderID);
        setHistorialCompras(pedidosOrdenados);
      } else {
        console.error('Error al cargar historial de compras:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar historial de compras:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const mostrarDetallesPedido = (pedido) => {
    setDetallePedido(pedido);
    setModalOpen(true); // Abrir el modal
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setDetallePedido(null); // Limpiar el pedido seleccionado
  };

  const handlePaginaAnterior = () => {
    if (paginaActual > 1) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const handlePaginaSiguiente = () => {
    if (historialCompras.length === pedidosPorPagina) {
      setPaginaActual(paginaActual + 1);
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
              <Card onClick={() => mostrarDetallesPedido(pedido)} style={{ cursor: 'pointer' }}>
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

      {/* Botones de paginación */}
      <Grid container justifyContent="center" mt={2}>
        <Button variant="contained" onClick={handlePaginaAnterior} disabled={paginaActual === 1}>
          Anterior
        </Button>
        <Button variant="contained" onClick={handlePaginaSiguiente} disabled={historialCompras.length < pedidosPorPagina} style={{ marginLeft: '10px' }}>
          Siguiente
        </Button>
      </Grid>

      {/* Modal para mostrar detalles del pedido */}
      {detallePedido && (
        <Dialog open={modalOpen} onClose={cerrarModal}>
          <DialogTitle>Detalles del Pedido ID: {detallePedido.OrderID}</DialogTitle>
          <DialogContent>
            <Typography>Fecha: {detallePedido.OrderDate}</Typography>
            <Typography>Total: ${detallePedido.TotalAmount}</Typography>
            <Typography>Estado: {detallePedido.Status}</Typography>
            {/* Aquí puedes agregar más detalles, como los productos del pedido */}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default HistorialCompras;