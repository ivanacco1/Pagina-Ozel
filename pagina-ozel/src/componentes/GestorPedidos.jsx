// GestorPedidos.jsx
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icono de "Ver más"
import axios from 'axios';

const GestorPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false); // Para manejar el estado de carga

  useEffect(() => {
    const cargarPedidos = async () => {
      setLoading(true); // Activar el estado de carga
      try {
        const response = await axios.get('http://localhost:5000/api/pedidos-completo');
        if (response.status === 200) {
          const pedidosOrdenados = response.data.sort((a, b) => b.OrderID - a.OrderID); // Ordenar por OrderID descendente
          setPedidos(pedidosOrdenados);
        } else {
          console.error('Error al cargar los pedidos:', response.statusText);
        }
      } catch (error) {
        console.error('Error al cargar los pedidos:', error.response?.data?.message || error.message);
      } finally {
        setLoading(false); // Desactivar el estado de carga
      }
    };

    cargarPedidos(); // Llamar la función para cargar los pedidos
  }, []);

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

  const handleVerMas = (orderId) => {
    // Aquí puedes implementar la lógica para mostrar más detalles del pedido
    console.log(`Ver más detalles del pedido: ${orderId}`);
  };

  return (
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
          {pedidos.map((pedido) => (
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
                >
                  <MenuItem value="Pendiente">Pendiente</MenuItem>
                  <MenuItem value="Cancelado">Cancelado</MenuItem>
                  <MenuItem value="Procesando">Procesando</MenuItem>
                  <MenuItem value="Completado">Completado</MenuItem>
                </Select>
              </TableCell>
              <TableCell>
                <IconButton onClick={() => handleVerMas(pedido.OrderID)}>
                  <VisibilityIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GestorPedidos;