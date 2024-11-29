import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import { Add, Remove, Delete } from '@mui/icons-material';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import guardarPedido from './Carrito/GuardarPedido'; 

const Carrito = () => {
  const { usuario, estadoAdvertencia } = useAuth();
  const [carrito, setCarrito] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false); // Estado para la animación de "Cargando"
  const walletButtonRef = useRef(null); // Ref para el botón de Wallet

  initMercadoPago('APP_USR-d5acf825-4ea7-4a19-a692-9305e2907c99', { //credenciales de prueba
    locale: "es-AR"
  });

  useEffect(() => {
    if (usuario) {
      cargarCarrito();
    }
  }, [usuario]);

  const cargarCarrito = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/carrito/${usuario.UserId}`); //carga carrito guardado del usuario
      if (response.status === 200) {
        setCarrito(response.data);
        
        console.log(response.data);
        calcularCostoTotal(response.data);
      } else {
        console.error('Error al cargar el carrito:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar el carrito:', error.message);
    }
  };

  const calcularCostoTotal = (cartItems) => {
    const total = cartItems.reduce((acc, item) => {
      const precioConDescuento = item.Price * (1 - (item.Discount || 0) / 100);
      return acc + item.Quantity * precioConDescuento;
    }, 0);
    setTotalCost(total.toFixed(2)); // Redondea a 2 decimales
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) return; // Previene cantidad cero o negativas de un producto
  
    const updatedCart = carrito.map(item => {
      if (item.ProductID === productId) {
        return { ...item, Quantity: newQuantity };
      }
      return item;
    });
  
    setCarrito(updatedCart);
    calcularCostoTotal(updatedCart);
  
    try {
      // Actualiza cantidad en bbdd
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
      cargarCarrito(); // Recarga el carrito después de la eliminación
    } catch (error) {
      console.error('Error al eliminar el producto del carrito:', error.message);
    }
  };

  // Función para limpiar el carrito después de guardar el pedido
  const limpiarCarrito = async () => {
    try {
      await axios.delete(`http://localhost:5000/carritovaciar/${usuario.UserId}`);
      //setCarrito([]); // Vacia el carrito en el estado
      //setTotalCost(0); // Reinicia el costo total
      console.log(usuario.UserId);
    } catch (error) {
      console.error('Error al vaciar el carrito:', error.message);
    }
  };

  const onSubmit = async (formData) => {
    try {
      const items = carrito.map((item) => {
        const precioConDescuento = item.Price * (1 - (item.Discount || 0) / 100);
        return {
          title: item.ProductName,
          quantity: item.Quantity,
          price: precioConDescuento.toFixed(2),
        };
      });
  
      const items2 = carrito.map((item) => ({
        ProductID: item.ProductID,
        Quantity: item.Quantity,
        Price: item.Price * (1 - (item.Discount || 0) / 100),
      }));
  
      await guardarPedido(usuario, totalCost, items2);
      await limpiarCarrito();
  
      const response = await axios.post("http://localhost:4500/create_preference", { items });
      return new Promise((resolve) => {
        resolve(response.data.id);
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
  {carrito.map((item) => {
    const precioConDescuento = item.Price * (1 - (item.Discount || 0) / 100);

    return (
      <TableRow key={item.ProductID}>
        <TableCell component="th" scope="row">{item.ProductName}</TableCell>
        <TableCell align="right">
          {item.Discount > 0 ? (
            <>
              <Typography
                variant="body2"
                
              >
                ${precioConDescuento}
              </Typography>
            </>
          ) : (
            <Typography variant="body2">${item.Price}</Typography>
          )}
        </TableCell>
        <TableCell align="right">
          <IconButton
            onClick={() => handleQuantityChange(item.ProductID, item.Quantity - 1)}
            disabled={item.Quantity <= 1}
            style={{ outline: 'none' }}
          >
            <Remove />
          </IconButton>
          {item.Quantity}
          <IconButton
            onClick={() => handleQuantityChange(item.ProductID, item.Quantity + 1)}
            style={{ outline: 'none' }}
          >
            <Add />
          </IconButton>
        </TableCell>
        <TableCell align="right">
          <IconButton
            onClick={() => handleRemoveFromCart(item.ProductID)}
            style={{ outline: 'none' }}
          >
            <Delete />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  })}
  <TableRow>
    <TableCell colSpan={2} align="right">
      <Typography variant="h6">Total:</Typography>
    </TableCell>
    <TableCell align="right">
      <Typography variant="h6">${totalCost}</Typography>
    </TableCell>
    <TableCell align="right">
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickSimulate}
        disabled={loading || estadoAdvertencia}
      >
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