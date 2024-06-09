
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
      return res.status(403).json({ message: 'Correo o contraseña incorrectos' });
    }

    const user = results[0];

    // Comparar la contraseña ingresada con la contraseña hasheada en la base de datos
    const isMatch = await bcrypt.compare(Password, user.Password);

    if (!isMatch) {
      return res.status(403).json({ message: 'Correo o contraseña incorrectos' });
    }

    



     // Enviar la información del usuario al frontend
     const userData = {
      UserId: user.AccountID,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      Role: user.Role,
      Phone: user.Phone,
      Address: user.Address,
      City: user.City,
      PostalCode: user.PostalCode
    };


    res.status(200).json({ token: 'fake-jwt-token', user: userData  });
  });
});

//endpoint para modificar usuario
app.put('/api/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const { FirstName, LastName, Email, CurrentPassword, NewPassword, Phone, Address, City, PostalCode, Role } = req.body;

  // Validar datos de entrada
  if (!FirstName || !LastName || !Email) {
    return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
  }

  // Definir Función para actualizar el usuario
  const updateUser = async (hashedPassword) => {
    // Crear la consulta SQL para actualizar el usuario
    let query = `UPDATE Usuarios SET FirstName = ?, LastName = ?, Email = ?, 
                  ${hashedPassword ? 'Password = ?, ' : ''} Phone = ?, Address = ?, City = ?, PostalCode = ? 
                  ${Role ? ', Role = ?' : ''} 
                  WHERE AccountID = ?`;

    const values = [FirstName, LastName, Email];
    if (hashedPassword) {
      values.push(hashedPassword);
    }
    values.push(Phone, Address, City, PostalCode);
    if (Role) {
      values.push(Role);
    }
    values.push(userId);

    // Ejecutar la consulta SQL
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error actualizando el usuario en la base de datos:', err);
        return res.status(501).json({ message: 'Error actualizando el usuario' });
      }

      // Consultar y devolver los datos actualizados del usuario
      db.query('SELECT * FROM Usuarios WHERE AccountID = ?', [userId], (err, updatedUser) => {
        if (err) {
          console.error('Error obteniendo el usuario actualizado de la base de datos:', err);
          return res.status(500).json({ message: 'Error obteniendo el usuario actualizado' });
        }

        res.status(200).json(updatedUser[0]);
      });
    });
  };

  console.log(userId);
  // Verificar si el correo electrónico ya está en uso por otro usuario
  const checkEmailQuery = 'SELECT * FROM Usuarios WHERE Email = ? AND AccountID != ?';
  db.query(checkEmailQuery, [Email, userId], (err, results) => {
    if (err) {
      console.error('Error comprobando el correo electrónico en la base de datos:', err);
      return res.status(500).json({ message: 'Error comprobando el correo electrónico' });
    }

    if (results.length > 0) {
      return res.status(403).json({ message: 'El correo electrónico ya está en uso por otro usuario' });
    }

    // Función de actualización de datos para usuarios
    if (CurrentPassword) {
      // Obtener la contraseña actual del usuario de la base de datos
      db.query('SELECT Password, Email FROM Usuarios WHERE AccountID = ?', [userId], async (err, results) => {
        if (err) {
          console.error('Error obteniendo la contraseña actual del usuario:', err);
          return res.status(500).json({ message: 'Error obteniendo la contraseña actual del usuario' });
        }

        const user = results[0];
        const isPasswordCorrect = await bcrypt.compare(CurrentPassword, user.Password);
        if (!isPasswordCorrect) {
          return res.status(403).json({ message: 'La contraseña actual es incorrecta' });
        }

        // Verificar si hay nueva contraseña
        if (NewPassword) {
          let hashedPassword;
          try {
            hashedPassword = await bcrypt.hash(NewPassword, 10);
          } catch (err) {
            console.error('Error encriptando la nueva contraseña:', err);
            return res.status(500).json({ message: 'Error encriptando la nueva contraseña' });
          }

          // Actualizar el usuario con la nueva contraseña
          updateUser(hashedPassword);
        } else {
          updateUser();
        }
      });
    } else {
      // Si no hay CurrentPassword, se asume que es una solicitud de cambio de datos para Admin
      updateUser();
    }
  });
});




app.get('/api/usuarios/:id/pedidos', (req, res) => {
  const userId = req.params.id;

  // Obtener todos los pedidos del usuario por ID
  const query = 'SELECT * FROM Pedidos WHERE Usuarios_AccountID = ? ORDER BY OrderDate DESC';
  db.query(query, [userId], (err, results) => {
    if (err) {
      // Manejo de errores...
    }

      // Formatear la fecha en cada pedido
      const formattedResults = results.map(result => {
        return {
          ...result,
          OrderDate: result.OrderDate.toLocaleDateString().split('T')[0] // Formato día-mes-año
        };
      });
  
      res.status(200).json(formattedResults || []); // Enviar un array vacío si no hay pedidos

  });
});


app.listen(PORT, () => {
  console.log(`Server escuchando en puerto ${PORT}`);
});