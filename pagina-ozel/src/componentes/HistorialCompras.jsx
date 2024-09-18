import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Button, Dialog, DialogTitle, DialogContent, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useAuth } from './AutentificacionProvider';
import '../estilos/MiCuenta.css';
import axios from 'axios';

const HistorialCompras = () => {
  const { usuario } = useAuth();
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1); // Página actual
  const [detallePedido, setDetallePedido] = useState(null); // Pedido seleccionado para mostrar datos
  const [Pedido, setPedido] = useState(null); // Pedido seleccionado para mostrar detalles
  const [modalOpen, setModalOpen] = useState(false); // Estado del modal

  const pedidosPorPagina = 10; // Número de pedidos por página

  useEffect(() => {
    cargarHistorialCompras();
  }, [paginaActual]);

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/usuarios/${usuario.UserId}/pedidos?page=${paginaActual}&limit=${pedidosPorPagina}`);
      if (response.status === 200) {
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

  // Función para cargar los detalles de un pedido
  const cargarDetallesPedido = async (pedidoId, pedido) => {
    try {
      console.log(pedido);
      const response = await axios.get(`http://localhost:5000/api/pedidos/${pedidoId}`);
      if (response.status === 200) {
        console.log(response.data);
        setPedido(pedido);
        setDetallePedido(response.data); // Guardar los detalles en el estado
        setModalOpen(true); // Abrir el modal
      } else {
        console.error('Error al cargar los detalles del pedido:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar los detalles del pedido:', error.message);
    }
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setDetallePedido(null); // Limpiar los detalles del pedido
    setPedido(null); // Limpiar los datos del pedido
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
              <Card onClick={() => cargarDetallesPedido(pedido.OrderID, pedido)} style={{ cursor: 'pointer' }}>
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
          <DialogTitle>Detalles del Pedido ID: {Pedido.OrderID}</DialogTitle>
          <DialogContent>
          <Typography>Fecha: {Pedido.OrderDate}</Typography>
            <Typography>Total: ${Pedido.TotalAmount}</Typography>
            <Typography>Estado: {Pedido.Status}</Typography>
            <Typography>Dirección: {detallePedido.Address}</Typography>
            <Typography>Ciudad: {detallePedido.City}</Typography>
            <Typography>Provincia: {detallePedido.Provincia}</Typography>
            <Typography>Código Postal: {detallePedido.PostalCode}</Typography>

            {/* Tabla de productos */}
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell>Cantidad</TableCell>
                  <TableCell>Precio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detallePedido.productos.map((producto, index) => (
                  <TableRow key={index}>
                    <TableCell>{producto.ProductName}</TableCell>
                    <TableCell>{producto.Quantity}</TableCell>
                    <TableCell>${producto.Price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default HistorialCompras;