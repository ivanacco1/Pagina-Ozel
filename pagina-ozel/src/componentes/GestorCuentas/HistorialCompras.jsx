import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
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
                  <TableCell>{pedido.Status}</TableCell>
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