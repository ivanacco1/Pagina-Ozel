import React, { useState, useEffect } from 'react'; 
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const HistorialCompras = ({ userId }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarHistorial = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/api/pedidos/historial/${userId}`);
        if (response.status === 200) {
          const sortedHistorial = response.data.sort((a, b) => b.OrderID - a.OrderID); // Ordenar por OrderID descendente
          setHistorial(sortedHistorial);
        } else {
          console.error('Error al cargar el historial de compras:', response.statusText);
        }
      } catch (error) {
        console.error('Error al cargar el historial de compras:', error.response.data.message);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [userId]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-ES').format(date); // Formato dd/mm/yyyy
  };

  // Función para manejar el cambio de estado
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/pedidos/${orderId}/status`, {
        status: newStatus
      });

      if (response.status === 200) {
        // Actualiza el historial en la UI
        setHistorial((prevHistorial) => 
          prevHistorial.map((pedido) =>
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

  return (
    <>
      {loading ? (
        <CircularProgress />
      ) : historial.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pedido</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.map((pedido) => (
                <TableRow key={pedido.OrderID}>
                  <TableCell>{pedido.OrderID}</TableCell>
                  <TableCell>{formatearFecha(pedido.OrderDate)}</TableCell>
                  <TableCell>{pedido.TotalAmount}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1">Este usuario no tiene compras registradas.</Typography>
      )}
    </>
  );
};

export default HistorialCompras;