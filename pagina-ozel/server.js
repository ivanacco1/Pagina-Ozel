
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 5000;

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
  const { Email, Password } = req.body;

  // Validar datos de entrada
  if (!Email || !Password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Verificar el usuario en la base de datos
  const query = 'SELECT * FROM Usuarios WHERE Email = ?';
  db.query(query, [Email], async (err, results) => {
    if (err) {
      console.error('Error verificando usuario en la base de datos:', err);
      return res.status(500).json({ message: 'Error en el inicio de sesión' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];

    // Comparar la contraseña ingresada con la contraseña hasheada en la base de datos
    const isMatch = await bcrypt.compare(Password, user.Password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    res.status(200).json({ token: 'fake-jwt-token' });
  });
});

app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});