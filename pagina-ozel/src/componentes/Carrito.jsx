// Carrito.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import { Add, Remove, Delete } from '@mui/icons-material';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'



const Carrito = () => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [itemsToUpdate, setItemsToUpdate] = useState([]);
  const [preferenceId, setPreferenceId] = useState(null);

  initMercadoPago('APP_USR-d5acf825-4ea7-4a19-a692-9305e2907c99', {
    locale: "es-AR"
  });

  useEffect(() => {
    if (usuario) {
      cargarCarrito();
    }
  }, [usuario]);

  const createPreference = async () => {
    try {
      // Crear un arreglo de productos con los items del carrito
      const items = carrito.map((item) => ({
        title: item.ProductName,  // Nombre del producto
        quantity: item.Quantity,  // Cantidad seleccionada
        price: item.Price,        // Precio del producto
      }));
  
      // Enviar los productos al backend
      const response = await axios.post("http://localhost:4500/create_preference", { items });
  
      // Obtener el ID de la preferencia de pago
      const { id } = response.data;
      return id;
    } catch (error) {
      console.log(error);
    }
  };

  const cargarCarrito = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/carrito/${usuario.UserId}`);
      if (response.status === 200) {
        setCarrito(response.data);
        calcularCostoTotal(response.data);
      } else {
        console.error('Error al cargar el carrito:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error.message);
    }
  };

  const handleBuy = async () => {
    const id = await createPreference();
    if (id) {
      setPreferenceId(id);
    }
  };

  const calcularCostoTotal = (cartItems) => {
    const total = cartItems.reduce((acc, item) => acc + item.Quantity * item.Price, 0);
    setTotalCost(total);
  };

  const handleUpdateClick = async () => {
    try {
      await Promise.all(itemsToUpdate.map(({ productId, quantity }) =>
        axios.put('http://localhost:5000/api/carrito', {
          Usuarios_AccountID: usuario.UserId,
          Productos_ProductID: productId,
          Quantity: quantity,
        })
      ));
      cargarCarrito(); // Recarga el carrito después de la actualización
      setItemsToUpdate([]); // Limpia la lista de elementos a actualizar
      handleBuy();
      alert('Cantidades actualizadas, Lógica de Compra a implementar');
    } catch (error) {
      console.error('Error al actualizar la cantidad del producto:', error.message);
    }
  };
 
  const handleRemoveFromCart = async (productId) => {
    try {
      await axios.delete(`http://localhost:5000/api/carrito/${usuario.UserId}/${productId}`);
      cargarCarrito(); // Recargar el carrito después de la eliminación
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error.message);
    }
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const updatedCart = carrito.map(item => {
      if (item.ProductID === productId) {
        return { ...item, Quantity: newQuantity };
      }
      return item;
    });
  
    setCarrito(updatedCart);
    setItemsToUpdate(prevItems => [...prevItems, { productId, quantity: newQuantity }]);
  
    // Recalcular el costo total después de actualizar la cantidad
    calcularCostoTotal(updatedCart);
  };


  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Carrito de Compras</Typography>
      {carrito.length === 0 ? (
        <Typography variant="body1">No hay productos en el carrito</Typography>
      ) : (
        <TableContainer component={Paper} style={{ maxWidth: '800px', margin: 'auto' }}>
          <Table aria-label="carrito de compras">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="right">Cantidad</TableCell>
                <TableCell align="right">Eliminar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {carrito.map((item) => (
                <TableRow key={item.ProductID}>
                  <TableCell component="th" scope="row">
                    {item.ProductName}
                  </TableCell>
                  <TableCell align="right">${item.Price}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleQuantityChange(item.ProductID, item.Quantity - 1)} disabled={item.Quantity <= 1}>
                      <Remove />
                    </IconButton>
                    {item.Quantity}
                    <IconButton onClick={() => handleQuantityChange(item.ProductID, item.Quantity + 1)}>
                      <Add />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveFromCart(item.ProductID)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} align="right"><Typography variant="h6">Total:</Typography></TableCell>
                <TableCell align="right"><Typography variant="h6">${totalCost}</Typography></TableCell>
                <TableCell align="right">
                  <Button variant="contained" color="primary" onClick={handleUpdateClick}>Comprar</Button>
                  {preferenceId && (
  <Wallet
    initialization={{ preferenceId: preferenceId }}
    customization={{ texts: { valueProp: 'smart_option' } }}
  />
)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Carrito;