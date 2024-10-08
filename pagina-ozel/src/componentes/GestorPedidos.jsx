import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, CircularProgress, Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import axios from 'axios';

const GestorPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [filters, setFilters] = useState({
    Pendiente: true,
    Cancelado: false,
    Procesando: true,
    Completado: true,
  });

  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/pedidos-completo');
        if (response.status === 200) {
          const pedidosOrdenados = response.data.sort((a, b) => b.OrderID - a.OrderID);
          setPedidos(pedidosOrdenados);
          setFilteredPedidos(pedidosOrdenados);
        } else {
          console.error('Error al cargar los pedidos:', response.statusText);
        }
      } catch (error) {
        console.error('Error al cargar los pedidos:', error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarPedidos();
  }, []);

  useEffect(() => {
    // Filtrar pedidos según los filtros de estado seleccionados
    const nuevosPedidosFiltrados = pedidos.filter((pedido) => filters[pedido.Status]);
    setFilteredPedidos(nuevosPedidosFiltrados);
  }, [filters, pedidos]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/pedidos/${orderId}/status`, {
        status: newStatus
      });

      if (response.status === 200) {
        setPedidos((prevPedidos) =>
          prevPedidos.map((pedido) =>
            pedido.OrderID === orderId ? { ...pedido, Status: newStatus } : pedido
          )
        );
      } else {
        console.error('Error al actualizar el estado del pedido:', response.statusText);
      }
    } catch (error) {
      console.error('Error al actualizar el estado del pedido:', error.response?.data?.message || error.message);
    }
  };

  const handleVerDetalles = async (pedido) => {
    setLoadingDetalles(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/pedidos/${pedido.OrderID}`);
      if (response.status === 200) {
        setSelectedPedido({
          ...pedido,
          detalles: response.data
        });
        setOpenModal(true);
      } else {
        console.error('Error al cargar los detalles del pedido:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar los detalles del pedido:', error.response?.data?.message || error.message);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedPedido(null);
  };

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.checked,
    });
  };

  return (
    <>
      <FormGroup row>
        <FormControlLabel
          control={<Checkbox checked={filters.Pendiente} onChange={handleFilterChange} name="Pendiente" />}
          label="Pendiente"
        />
        <FormControlLabel
          control={<Checkbox checked={filters.Procesando} onChange={handleFilterChange} name="Procesando" />}
          label="Procesando"
        />
        <FormControlLabel
          control={<Checkbox checked={filters.Completado} onChange={handleFilterChange} name="Completado" />}
          label="Completado"
        />
        <FormControlLabel
          control={<Checkbox checked={filters.Cancelado} onChange={handleFilterChange} name="Cancelado" />}
          label="Cancelado"
        />
      </FormGroup>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPedidos.map((pedido) => (
              <TableRow key={pedido.OrderID}>
                <TableCell>{pedido.OrderID}</TableCell>
                <TableCell>{new Date(pedido.OrderDate).toLocaleDateString()}</TableCell>
                <TableCell>{pedido.TotalAmount}</TableCell>
                <TableCell>{pedido.FirstName}</TableCell>
                <TableCell>{pedido.LastName}</TableCell>
                <TableCell>{pedido.Email}</TableCell>
                <TableCell>
                  <Select
                    value={pedido.Status}
                    onChange={(e) => handleStatusChange(pedido.OrderID, e.target.value)}
                    sx={{ width: 150 }}
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="Cancelado">Cancelado</MenuItem>
                    <MenuItem value="Procesando">Procesando</MenuItem>
                    <MenuItem value="Completado">Completado</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleVerDetalles(pedido)} sx={{ fontSize: '1.5rem' }}>👁</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle>Detalles del Pedido {selectedPedido?.OrderID}</DialogTitle>
        <DialogContent>
          {loadingDetalles ? (
            <CircularProgress />
          ) : (
            selectedPedido && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <Typography variant="body1"><strong>Email:</strong> {selectedPedido.Email}</Typography>
                  <Typography variant="body1"><strong>Teléfono:</strong> {selectedPedido.Phone}</Typography>
                  <Typography variant="body1"><strong>Dirección:</strong> {selectedPedido.detalles.Address}</Typography>
                  <Typography variant="body1"><strong>Ciudad:</strong> {selectedPedido.detalles.City}</Typography>
                  <Typography variant="body1"><strong>Provincia:</strong> {selectedPedido.detalles.Provincia}</Typography>
                  <Typography variant="body1"><strong>Código Postal:</strong> {selectedPedido.detalles.PostalCode}</Typography>
                </div>
                <Typography variant="h6">Productos:</Typography>
                <ul>
                  {selectedPedido.detalles.productos.map((producto, index) => (
                    <li key={index}>
                      {producto.ProductName} - {producto.Quantity} x ${producto.Price}
                    </li>
                  ))}
                </ul>
              </>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">Cerrar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GestorPedidos;