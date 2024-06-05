const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

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
    console.log('Conectado a la base de datos MySQL');
  });

// Ruta para el registro de usuarios
app.post('/api/usuarios/registro', async (req, res) => {
    const { nombre, apellido, correo, contraseña } = req.body;
  
  
   // Validar datos de entrada
   if (!nombre || !apellido || !correo || !contraseña) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Generar un hash de la contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar el usuario en la base de datos con la contraseña hasheada
    const query = 'INSERT INTO Usuarios (FirstName, LastName, Email, Password) VALUES (?, ?, ?, ?)';
    db.query(query, [nombre, apellido, correo, hashedPassword], (err, results) => {
      if (err) {
        console.error('Error insertando usuario en la base de datos:', err);
        return res.status(500).json({ message: 'Error registrando el usuario' });
      }
      res.status(200).json({ message: 'Usuario registrado exitosamente!' });
    });
  } catch (error) {
    console.error('Error generando hash de contraseña:', error);
    return res.status(500).json({ message: 'Error registrando el usuario' });
  }
});


// Ruta para el inicio de sesión
app.post('/api/usuarios/login', (req, res) => {
  const { correo, contraseña } = req.body;
  // Aquí dlógica para autenticar al usuario

  res.status(200).json({ token: 'fake-jwt-token' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});