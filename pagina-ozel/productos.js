import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import db from './db.js';
import productosController from './routes/items.js';
import categoriasController from './routes/filtros.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Función para obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('API de Productos Conectado a la base de datos de productos');
});

// Función para formatear la fecha al formato YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};



app.get('/api/productos', productosController.lista);
app.delete('/api/productos/:id', (req, res) => productosController.borrar(req, res, __dirname));
app.post('/api/productos', upload.single('Image'), productosController.crear);
app.put('/api/productos/:id', upload.single('Image'), productosController.actualizar);

app.get('/api/categorias', categoriasController.lista);
app.post('/api/categorias', categoriasController.crearCategoria);
app.delete('/api/categorias/:id', categoriasController.borrarCategoria);
app.get('/api/colores', categoriasController.colores);
app.post('/api/colores', categoriasController.agregarColor);
app.delete('/api/colores/:idColor', categoriasController.borrarColor);
app.get('/api/tallas', categoriasController.tallas);
app.post('/api/tallas', categoriasController.agregarTalla);
app.delete('/api/tallas/:idTalla', categoriasController.borrarTalla);



// Ruta estática para servir los archivos de imagen
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});