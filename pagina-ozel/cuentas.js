
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
  console.log('API de Cuentas Conectado a la base de datos MySQL');
});


// Función para crear userData
const createUserData = (user) => {
  return {
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
};

// Función para crear userData
const createUserDataComplete = (user) => {
  return {
    AccountID: user.AccountID,
    FirstName: user.FirstName,
    LastName: user.LastName,
    Email: user.Email,
    Role: user.Role,
    Phone: user.Phone,
    Address: user.Address,
    City: user.City,
    PostalCode: user.PostalCode,
    DateRegistered: user.DateRegistered
  };
};



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
    const fechaRegistro = new Date();

    // Insertar el usuario en la base de datos con la contraseña hasheada y la fecha de registro
    const query = 'INSERT INTO Usuarios (FirstName, LastName, Email, Password, DateRegistered) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [nombre, apellido, correo, hashedPassword, fechaRegistro], (err, results) => {
      if (err) {
        console.error('Error insertando usuario en la base de datos:', err);
        return res.status(500).json({ message: 'Error registrando el usuario: Email en uso' });
      }

      // Obtener el ID del usuario recién creado
      const userId = results.insertId;

      // Consultar los datos del usuario recién creado
      db.query('SELECT * FROM Usuarios WHERE AccountID = ?', [userId], (err, userResults) => {
        if (err) {
          console.error('Error obteniendo el usuario registrado de la base de datos:', err);
          return res.status(500).json({ message: 'Error obteniendo el usuario registrado' });
        }

        const user = userResults[0];

        // Enviar los datos del usuario al frontend
        const userData = createUserData(user);

        res.status(200).json({ message: 'Usuario registrado exitosamente!', user: userData });
      });
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

    



       // Enviar los datos del usuario al frontend
       const userData = createUserData(user)
      //console.log(user);

    res.status(200).json({ token: 'fake-jwt-token', user: userData  });
  });
});







//endpoint para modificar usuario
app.put('/api/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const { FirstName, LastName, Email, CurrentPassword, NewPassword, Phone, Address, City, PostalCode, Role , TargetID, AdminPassword} = req.body;

  //console.log(req.body);

  // Validar datos de entrada
  if (!AdminPassword) {
    if (!FirstName || !LastName || !Email) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser proporcionados' });
    }
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

               // Enviar los datos del usuario al frontend
               const userData = createUserData(updatedUser[0])

        res.status(200).json( {message: 'Usuario actualizado exitosamente!', user: userData });
      });
    });
  };


  // Función para actualizar el usuario
  const updateUser2 = async (hashedPassword) => {
    // Crear la consulta SQL para actualizar el usuario
    let query = `UPDATE Usuarios SET  
                  ${hashedPassword ? 'Password = ? ' : ''}
                  ${Role ? 'Role = ?' : ''} 
                  WHERE AccountID = ?`;

    const values = [];
    if (hashedPassword) {
      values.push(hashedPassword);
    }

    if (Role) {
      values.push(Role);
    }
    values.push(TargetID);

    // Ejecutar la consulta SQL
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error actualizando el usuario en la base de datos:', err);
        return res.status(501).json({ message: 'Error actualizando el usuario' });
      }

        res.status(200).json( {message: 'Usuario actualizado exitosamente!'});

    });
  };



  //console.log(userId);
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
          return res.status(403).json({ message: 'La contraseña ingresada es incorrecta' });
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
      // Si no hay CurrentPassword, se asume que es una solicitud de cambio de datos de Admin

      db.query('SELECT Password, Email FROM Usuarios WHERE AccountID = ?', [userId], async (err, results) => {
        if (err) {
          console.error('Error obteniendo la contraseña actual del usuario:', err);
          return res.status(500).json({ message: 'Error obteniendo la contraseña actual del usuario' });
        }

        const user = results[0];
        const isPasswordCorrect = await bcrypt.compare(AdminPassword, user.Password);
        if (!isPasswordCorrect) {
          return res.status(403).json({ message: 'La contraseña ingreada es incorrecta' });
        }
        
        if (NewPassword) {
          let hashedPassword;
          try {
            hashedPassword = await bcrypt.hash(NewPassword, 10);
          } catch (err) {
            console.error('Error encriptando la nueva contraseña:', err);
            return res.status(500).json({ message: 'Error encriptando la nueva contraseña' });
          }
          updateUser2(hashedPassword);
        } else{
          updateUser2();
        }
          
          
      });
    }
  });
});



// Ruta para obtener la lista de usuarios
app.get('/api/usuarios/lista', (req, res) => {
  const query = 'SELECT AccountID, FirstName, LastName, Email, Role, Phone, Address, City, PostalCode, DateRegistered FROM Usuarios';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error obteniendo la lista de usuarios de la base de datos:', err);
      return res.status(500).json({ message: 'Error obteniendo la lista de usuarios' });
    }


    // Formatear la fecha en cada pedido
    const formattedResults = results.map(result => {
      return {
        ...result,
        DateRegistered: result.DateRegistered.toLocaleDateString().split('T')[0] // Formato día-mes-año
      };
    });


    // Mapeamos los resultados para crear la lista de usuarios
    const usuarios = formattedResults.map(user => createUserDataComplete(user));

    res.status(200).json(usuarios);
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


// Endpoint para eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
  const adminId = req.params.id;
  const { AdminPassword, TargetID } = req.body;

  // Verificar que todos los datos necesarios están presentes
  if (!AdminPassword || !TargetID) {
    return res.status(400).json({ message: 'AdminPassword y TargetID son obligatorios' });
  }

  try {
    // Obtener la contraseña del administrador de la base de datos
    const query = 'SELECT Password, Role FROM Usuarios WHERE AccountID = ?';
    db.query(query, [adminId], async (err, results) => {
      if (err) {
        console.error('Error obteniendo datos del administrador de la base de datos:', err);
        return res.status(500).json({ message: 'Error verificando la identidad del administrador' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Administrador no encontrado' });
      }

      const admin = results[0];

      // Verificar que el usuario es administrador
      if (admin.Role !== 'admin') {
        return res.status(403).json({ message: 'Solo los administradores pueden eliminar usuarios' });
      }

      // Comparar la contraseña ingresada con la contraseña hasheada en la base de datos
      const isMatch = await bcrypt.compare(AdminPassword, admin.Password);

      if (!isMatch) {
        return res.status(403).json({ message: 'Contraseña de administrador incorrecta' });
      }

      // Eliminar el usuario especificado por TargetID
      const deleteQuery = 'DELETE FROM Usuarios WHERE AccountID = ?';
      db.query(deleteQuery, [TargetID], (err, results) => {
        if (err) {
          console.error('Error eliminando el usuario de la base de datos:', err);
          return res.status(500).json({ message: 'Error eliminando el usuario' });
        }

        // Si no se eliminó ningún usuario, significa que el TargetID no existe
        if (results.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(204).send(); // Responder con 204 No Content si se elimina correctamente
      });
    });
  } catch (error) {
    console.error('Error en el proceso de eliminación de usuario:', error);
    return res.status(500).json({ message: 'Error eliminando el usuario' });
  }
});

//-------------------------------------------------------------------------------------------------------------------
//   Carrito
//-------------------------------------------------------------------------------------------------------------------


// Endpoint para agregar un producto al carrito
app.post('/api/carrito', (req, res) => {
  const { Quantity, Productos_ProductID, Usuarios_AccountID } = req.body;

  const query = `
    INSERT INTO Carrito (Usuarios_AccountID, Productos_ProductID, Quantity)
    VALUES (?, ?, ?)
  `;
  //console.log(Usuarios_AccountID, " ", Productos_ProductID," ",Quantity);
  db.query(query, [Usuarios_AccountID, Productos_ProductID, Quantity], (err, results) => {
    if (err) {
      console.error('Error insertando producto en el carrito:', err);
      return res.status(500).json({ message: 'Error al añadir el producto al carrito' });
    }

    res.status(200).json({ message: 'Producto añadido al carrito correctamente' });
  });
});


// Endpoint para obtener los productos del carrito de un usuario
app.get('/api/carrito/:accountId', (req, res) => {
  const { accountId } = req.params;

  const query = `
    SELECT c.Quantity, p.ProductID, p.ProductName, p.Price
    FROM Carrito c
    JOIN Productos p ON c.Productos_ProductID = p.ProductID
    WHERE c.Usuarios_AccountID = ?
  `;

  db.query(query, [accountId], (err, results) => {
    if (err) {
      console.error('Error al obtener el carrito:', err);
      return res.status(500).json({ message: 'Error al obtener el carrito' });
    }

    res.status(200).json(results);
  });
});

// Endpoint para actualizar la cantidad de un producto en el carrito
app.put('/api/carrito', (req, res) => {
  const { Usuarios_AccountID, Productos_ProductID, Quantity } = req.body;

  if (Quantity <= 0) {
    const deleteQuery = `
      DELETE FROM Carrito
      WHERE Usuarios_AccountID = ? AND Productos_ProductID = ?
    `;
    db.query(deleteQuery, [Usuarios_AccountID, Productos_ProductID], (err, results) => {
      if (err) {
        console.error('Error al eliminar el producto del carrito:', err);
        return res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
      }

      return res.status(200).json({ message: 'Producto eliminado del carrito' });
    });
  } else {
    const query = `
      UPDATE Carrito
      SET Quantity = ?
      WHERE Usuarios_AccountID = ? AND Productos_ProductID = ?
    `;
    db.query(query, [Quantity, Usuarios_AccountID, Productos_ProductID], (err, results) => {
      if (err) {
        console.error('Error al actualizar la cantidad del producto en el carrito:', err);
        return res.status(500).json({ message: 'Error al actualizar la cantidad del producto en el carrito' });
      }

      res.status(200).json({ message: 'Cantidad del producto actualizada en el carrito' });
    });
  }
});

// Endpoint para eliminar un producto del carrito
app.delete('/api/carrito/:accountId/:productId', (req, res) => {
  const { accountId, productId } = req.params;

  const query = `
    DELETE FROM Carrito
    WHERE Usuarios_AccountID = ? AND Productos_ProductID = ?
  `;

  db.query(query, [accountId, productId], (err, results) => {
    if (err) {
      console.error('Error al eliminar el producto del carrito:', err);
      return res.status(500).json({ message: 'Error al eliminar el producto del carrito' });
    }

    res.status(200).json({ message: 'Producto eliminado del carrito' });
  });
});





//-------------------------------------------------------------------------------------------------------------------
//   Activando puerto
//-------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`API de cuentas escuchando en puerto ${PORT}`);
});