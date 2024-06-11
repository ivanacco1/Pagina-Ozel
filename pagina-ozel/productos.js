
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu base de datos está en otro host
  user: 'root', // Usuario de tu base de datos
  password: 'admin', // Contraseña de tu base de datos
  database: 'ozel' // Nombre de tu base de datos
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('API de Productos Conectado a la base de datos MySQL');
});



// Endpoint para obtener todos los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM Productos';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }

    res.status(200).json(results);
  });
});

app.listen(PORT, () => {
  console.log(`API de Productos escuchando en puerto ${PORT}`);
});