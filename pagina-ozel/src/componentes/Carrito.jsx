import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import { Add, Remove, Delete } from '@mui/icons-material';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import guardarPedido from './Carrito/GuardarPedido'; // Importar la función guardarPedido

const Carrito = () => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false); // Estado para la animación de "Cargando"
  const walletButtonRef = useRef(null); // Ref para el botón de Wallet

  initMercadoPago('APP_USR-d5acf825-4ea7-4a19-a692-9305e2907c99', {
    locale: "es-AR"
  });

  useEffect(() => {
    if (usuario) {
      cargarCarrito();
    }
  }, [usuario]);

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

  const calcularCostoTotal = (cartItems) => {
    const total = cartItems.reduce((acc, item) => acc + item.Quantity * item.Price, 0);
    setTotalCost(total);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) return; // Prevent negative or zero quantities
  
    const updatedCart = carrito.map(item => {
      if (item.ProductID === productId) {
        return { ...item, Quantity: newQuantity };
      }
      return item;
    });
  
    setCarrito(updatedCart);
    calcularCostoTotal(updatedCart);
  
    try {
      // Update the quantity in the database
      await axios.put('http://localhost:5000/api/carrito', {
        Usuarios_AccountID: usuario.UserId,
        Productos_ProductID: productId,
        Quantity: newQuantity,
      });
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

// Callback cuando se hace clic en el botón de Wallet
const onSubmit = async (formData) => {
  try {
    const items = carrito.map((item) => ({
      title: item.ProductName,
      quantity: item.Quantity,
      price: item.Price,
    }));

    const items2 = carrito.map((item) => ({
      ProductID: item.ProductID,
      Quantity: item.Quantity,
      Price: item.Price,
    }));

    // Guardar el pedido en la base de datos y enviar items2 como Productos
    await guardarPedido(usuario, totalCost, items2); 

    const response = await axios.post("http://localhost:4500/create_preference", { items });
    return new Promise((resolve) => {
      resolve(response.data.id); // Resuelve con el ID de la preferencia
    });
  } catch (error) {
    console.error('Error al crear la preferencia:', error);
  }
};



  const onError = (error) => {
    console.error('Error en el Wallet Brick:', error);
  };

  const onReady = () => {
    //console.log('Wallet Brick está listo');
  };

  // Función para simular el clic en el botón de Wallet
  const handleClickSimulate = () => {
    setLoading(true); // Mostrar animación de "Cargando"
    if (walletButtonRef.current) {
      const walletButton = walletButtonRef.current.querySelector('button');
      if (walletButton) {
        walletButton.click(); // Simula el clic en el botón del Wallet
      }
    }
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
                    <IconButton onClick={() => handleQuantityChange(item.ProductID, item.Quantity - 1)} disabled={item.Quantity <= 1} style={{ outline: 'none' }} >
                      <Remove />
                    </IconButton>
                    {item.Quantity}
                    <IconButton onClick={() => handleQuantityChange(item.ProductID, item.Quantity + 1)} style={{ outline: 'none' }}>
                      <Add />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleRemoveFromCart(item.ProductID)} style={{ outline: 'none' }}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2} align="right"><Typography variant="h6">Total:</Typography></TableCell>
                <TableCell align="right"><Typography variant="h6">${totalCost}</Typography></TableCell>
                <TableCell align="right">
      {/* Botón que simula el clic en el botón de Wallet */}
      <Button variant="contained" color="primary" onClick={handleClickSimulate} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Pagar con Mercado Pago'}
      </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

                  {/* Botón de Mercado Pago Wallet Brick con display: none */}
                  <div id="walletBrick_container" ref={walletButtonRef} style={{ display: 'none' }}>
                    <Wallet
                        onSubmit={onSubmit}
                        onReady={onReady}
                        onError={onError}
                    />
                  </div>


    </Box>
  );
};

export default Carrito;