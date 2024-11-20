
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import db from './db.js';
import usuariosController from './routes/users.js';
import pedidosController from './routes/pedidos.js';
import carritoController from './routes/carrito.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos de cuentas exitosa');
});


// Rutas para usuarios
app.post('/api/usuarios/registro', usuariosController.registro);
app.post('/api/usuarios/login', usuariosController.login);
app.put('/api/usuarios/:id', usuariosController.actualizarUsuario);
app.get('/api/usuarios/lista', usuariosController.listaUsuarios);
app.post('/api/usuarios/validate-password', usuariosController.validarContraseña);
app.delete('/api/usuarios/:id', usuariosController.borrar);

app.get('/api/pedidos-completo', pedidosController.pedidosCompleto);
app.get('/api/usuarios/:id/pedidos', pedidosController.pedidos);
app.post('/api/pedidos', pedidosController.nuevoPedido);
app.get('/api/pedidos/:orderId', pedidosController.detallesPedidos);
app.put('/api/pedidos/:orderId/status', pedidosController.estadosPedidos);
app.get('/api/pedidos/historial/:accountId', pedidosController.historialPedidos);


app.post('/api/carrito', carritoController.agregar);
app.get('/api/carrito/:accountId', carritoController.carritoUsuario);
app.put('/api/carrito', carritoController.actualizar);
app.delete('/api/carrito/:accountId/:productId', carritoController.borrarProducto);
app.delete('/carritovaciar/:userId', carritoController.limpiar);



//-------------------------------------------------------------------------------------------------------------------
//   Activando puerto
//-------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`API de cuentas escuchando en puerto ${PORT}`);
});