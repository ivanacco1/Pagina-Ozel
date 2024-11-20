import bcrypt from 'bcrypt';
import db from '../db.js';

// Función para crear datos de usuario
const createUserData = (user) => ({
  UserId: user.AccountID,
  FirstName: user.FirstName,
  LastName: user.LastName,
  Email: user.Email,
  Role: user.Role,
  Phone: user.Phone,
  Address: user.Address,
  City: user.City,
  Provincia: user.Provincia,
  PostalCode: user.PostalCode
});

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
      Provincia: user.Provincia,
      PostalCode: user.PostalCode,
      DateRegistered: user.DateRegistered
    };
  };


  // Ruta para el registro de usuarios
  export const registro = async (req, res) => {
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
  };


  // Ruta para el inicio de sesión
  export const login = (req, res) => {
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
  };

  //endpoint para modificar usuario
  export const actualizarUsuario = (req, res) => {
    const userId = req.params.id;
    const { FirstName, LastName, Email, CurrentPassword, NewPassword, Phone, Address, City, Provincia, PostalCode, Role , TargetID, AdminPassword} = req.body;
  
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
                    ${hashedPassword ? 'Password = ?, ' : ''} Phone = ?, Address = ?, City = ?, Provincia = ?, PostalCode = ? 
                    ${Role ? ', Role = ?' : ''} 
                    WHERE AccountID = ?`;
  
      const values = [FirstName, LastName, Email];
      if (hashedPassword) {
        values.push(hashedPassword);
      }
      values.push(Phone, Address, City, Provincia, PostalCode);
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
              //console.log(userData);
          res.status(200).json( {message: 'Usuario actualizado exitosamente!', user: userData });
          //console.log(userData);
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
  };

  // Ruta para obtener la lista de usuarios
  export const listaUsuarios = (req, res) => {
    const query = 'SELECT AccountID, FirstName, LastName, Email, Role, Phone, Address, City, PostalCode, DateRegistered, Provincia FROM Usuarios';
  
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
  };

  

  export const validarContraseña = (req, res) => {
  const { UserId, Password } = req.body;

  // Consulta para obtener la contraseña hash del usuario
  const query = 'SELECT Password FROM usuarios WHERE AccountID = ?';
//console.log(req.body);
  // Ejecutar la consulta
  db.query(query, [UserId], (err, results) => {
    if (err) {
      return res.status(501).json({ error: 'Error al validar la contraseña' });
    }

    // Si no se encuentra al usuario
    if (results.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const hashedPassword = results[0].Password;

    // Comparar la contraseña proporcionada con la almacenada (hash)
    bcrypt.compare(Password, hashedPassword, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ error: 'Error al comparar la contraseña' });
      }

      // Si la contraseña coincide
      if (isMatch) {
        res.status(200).json({ message: 'Contraseña válida' });
      } else {
        // Si la contraseña es incorrecta
        res.status(401).json({ error: 'Contraseña incorrecta' });
      }
    });
  });
};


// Endpoint para eliminar usuario
export const borrar = (req, res) => {
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
};

  

  export default {
    registro,
    login,
    actualizarUsuario,
    listaUsuarios,
    validarContraseña,
    borrar
  };