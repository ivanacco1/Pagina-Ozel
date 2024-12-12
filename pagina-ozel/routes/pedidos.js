
import db from '../db.js';



export const pedidosCompleto = async (req, res) => {
  
    const query = `SELECT pedidos.OrderID, pedidos.OrderDate, pedidos.TotalAmount, pedidos.Status, 
         usuarios.FirstName, usuarios.LastName, usuarios.Email
        FROM pedidos
        JOIN usuarios ON pedidos.Usuarios_AccountID = usuarios.AccountID`;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al obtener pedidos:', err);
        res.status(500).json({ message: 'Error al obtener los pedidos.' });
      }
      
      res.json(results);
    });
  };


  export const pedidos = async (req, res) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page) || 1; // Página actual, por defecto es 1
    const limit = parseInt(req.query.limit) || 15; // Límite de pedidos por página, por defecto es 15
    const offset = (page - 1) * limit; // Calcular el desplazamiento (offset)
  
    // Modificar la consulta para incluir la paginación
    const query = 'SELECT * FROM Pedidos WHERE Usuarios_AccountID = ? ORDER BY OrderID DESC LIMIT ? OFFSET ?';
  
    db.query(query, [userId, limit, offset], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener los pedidos del usuario' });
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
  };
  


  // Endpoint para guardar un nuevo pedido
export const nuevoPedido = async (req, res) => {
  let { OrderDate, TotalAmount, Status, Usuarios_AccountID, Productos, Address, City, PostalCode, Provincia } = req.body;

  // Convertir la fecha a formato compatible con MySQL
  const mysqlFormattedDate = new Date(OrderDate).toISOString().slice(0, 19).replace('T', ' ');

  // Consulta para insertar el pedido en la tabla Pedidos, ahora incluyendo Address, City, PostalCode y Provincia
  const queryInsertPedido = `
      INSERT INTO Pedidos (OrderDate, TotalAmount, Status, Usuarios_AccountID, Address, City, PostalCode, Provincia) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Ejecutar la consulta para insertar el pedido con los datos de dirección
  db.query(queryInsertPedido, [mysqlFormattedDate, TotalAmount, Status, Usuarios_AccountID, Address, City, PostalCode, Provincia], (err, result) => {
      if (err) {
          console.error('Error al guardar el pedido:', err);
          return res.status(500).json({ message: 'Error al guardar el pedido' });
      }

      const orderId = result.insertId; // Obtener el OrderID recién generado

      // Si hay productos en el pedido
      if (Productos && Productos.length > 0) {
          // Crear la consulta para insertar los productos con precio
          const queryInsertProductos = `
              INSERT INTO PedidosProductos (OrderID, Productos_ProductID, Quantity, Price) 
              VALUES ?
          `;

          // Crear un array de valores para la consulta
          const productosValues = Productos.map(p => [orderId, p.ProductID, p.Quantity, p.Price]);

          // Ejecutar la consulta para insertar los productos
          db.query(queryInsertProductos, [productosValues], (err) => {
              if (err) {
                  console.error('Error al guardar los productos del pedido:', err);
                  return res.status(500).json({ message: 'Error al guardar los productos del pedido' });
              }


                              // Actualizar el stock de los productos después de insertarlos en el pedido
              const updateStockPromises = Productos.map(p => {
                return new Promise((resolve, reject) => {
                    const queryUpdateStock = `
                        UPDATE Productos 
                        SET Stock = Stock - ? 
                        WHERE ProductID = ? AND Stock >= ?
                    `;
                    db.query(queryUpdateStock, [p.Quantity, p.ProductID, p.Quantity], (err, result) => {
                        if (err) {
                            console.error(`Error al actualizar el stock del producto ${p.ProductID}:`, err);
                            reject(err);
                        } else if (result.affectedRows === 0) {
                            console.error(`Stock insuficiente para el producto ${p.ProductID}`);
                            reject(new Error(`Stock insuficiente para el producto ${p.ProductID}`));
                        } else {
                            resolve();
                        }
                    });
                });
            });



              //res.status(200).json({ message: 'Pedido y productos guardados con éxito', OrderID: orderId });

                           // Ejecutar todas las actualizaciones de stock y manejar errores
                           Promise.all(updateStockPromises)
                           .then(() => {
                               res.status(200).json({ message: 'Pedido, productos y stock actualizados con éxito', OrderID: orderId });
                           })
                           .catch(err => {
                               console.error('Error al actualizar el stock:', err);
                               res.status(500).json({ message: 'Error al actualizar el stock de los productos' });
                           });
          });
      } else {
          // Si no hay productos, solo responder con el éxito del pedido
          res.status(200).json({ message: 'Pedido guardado con éxito', OrderID: orderId });
      }
  });
};





// Obtener los detalles de un pedido específico
export const detallesPedidos = async (req, res) => {
  const orderId = req.params.orderId;
  //console.log(req);
  const queryPedido = 'SELECT Address, City, Provincia, PostalCode FROM Pedidos WHERE OrderID = ?';
  const queryProductos = `
    SELECT p.ProductName, pp.Quantity, pp.Price
    FROM pedidosproductos pp
    JOIN productos p ON pp.Productos_ProductID = p.ProductID
    WHERE pp.OrderID = ?
  `;

  // Obtener los detalles del pedido (dirección, ciudad, etc.)
  db.query(queryPedido, [orderId], (err, pedidoResults) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los detalles del pedido' });
    }

    // Obtener los productos del pedido
    db.query(queryProductos, [orderId], (err, productosResults) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener los productos del pedido' });
      }

      const detallesPedido = {
        ...pedidoResults[0], // Dirección, ciudad, etc.
        productos: productosResults, // Productos, cantidad, precio
      };

      res.status(200).json(detallesPedido);
    });
  });
};



// Actualizar el estado de un pedido
export const estadosPedidos = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  // Consulta para actualizar el estado del pedido
  const queryUpdateStatus = 'UPDATE Pedidos SET Status = ? WHERE OrderID = ?';

  db.query(queryUpdateStatus, [status, orderId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al actualizar el estado del pedido' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    // Si el estado se cambia a "Cancelado", devolver los productos al stock
    if (status === 'Cancelado') {
      const queryGetProductos = `
        SELECT Productos_ProductID, Quantity 
        FROM PedidosProductos 
        WHERE OrderID = ?
      `;

      db.query(queryGetProductos, [orderId], (err, productos) => {
        if (err) {
          console.error('Error al recuperar productos del pedido:', err);
          return res.status(500).json({ error: 'Error al recuperar productos del pedido' });
        }

        if (productos.length > 0) {
          // Crear promesas para actualizar el stock de cada producto
          const updateStockPromises = productos.map((producto) => {
            return new Promise((resolve, reject) => {
              const queryUpdateStock = `
                UPDATE Productos 
                SET Stock = Stock + ? 
                WHERE ProductID = ?
              `;
              db.query(queryUpdateStock, [producto.Quantity, producto.Productos_ProductID], (err, result) => {
                if (err) {
                  console.error(`Error al actualizar el stock del producto ${producto.Productos_ProductID}:`, err);
                  reject(err);
                } else {
                  resolve();
                }
              });
            });
          });

          // Ejecutar todas las promesas
          Promise.all(updateStockPromises)
            .then(() => {
              res.status(200).json({ message: 'Estado del pedido actualizado y stock restaurado correctamente' });
            })
            .catch((err) => {
              console.error('Error al restaurar el stock:', err);
              res.status(500).json({ error: 'Error al restaurar el stock de los productos' });
            });
        } else {
          res.status(200).json({ message: 'Estado del pedido actualizado correctamente, pero no se encontraron productos para restaurar stock' });
        }
      });
    } else {
      // Si el estado no es "Cancelado", simplemente responder con éxito
      res.status(200).json({ message: 'Estado del pedido actualizado correctamente' });
    }
  });
};



// Obtener el historial de compras de un usuario específico
export const historialPedidos = async (req, res) => {
  const accountId = req.params.accountId;
  
  const queryPedidos = `
    SELECT OrderID, OrderDate, TotalAmount, Status
    FROM Pedidos
    WHERE Usuarios_AccountID = ?
    ORDER BY OrderDate DESC
  `;
  
  const queryProductos = `
    SELECT p.ProductName, pp.Quantity, pp.Price
    FROM pedidosproductos pp
    JOIN productos p ON pp.Productos_ProductID = p.ProductID
    WHERE pp.OrderID = ?
  `;

  // Obtener la lista de pedidos del usuario
  db.query(queryPedidos, [accountId], (err, pedidosResults) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el historial de pedidos' });
    }

    if (pedidosResults.length === 0) {
      return res.status(404).json({ message: 'No se encontraron compras para este usuario.' });
    }

    // Obtener los productos de cada pedido
    const pedidosConProductos = [];

    // Función para obtener los productos de cada pedido de manera secuencial
    const obtenerProductos = (index) => {
      if (index === pedidosResults.length) {
        // Si ya se procesaron todos los pedidos, enviar la respuesta
        return res.status(200).json(pedidosConProductos);
      }

      const pedido = pedidosResults[index];
      
      db.query(queryProductos, [pedido.OrderID], (err, productosResults) => {
        if (err) {
          return res.status(500).json({ error: 'Error al obtener los productos del pedido' });
        }

        // Agregar los productos al pedido actual
        pedidosConProductos.push({
          ...pedido, // OrderID, OrderDate, TotalAmount
          productos: productosResults, // Lista de productos del pedido
        });

        // Llamar recursivamente para el siguiente pedido
        obtenerProductos(index + 1);
      });
    };

    // Iniciar la obtención de productos para cada pedido
    obtenerProductos(0);
  });
};



  export default {
    pedidosCompleto,
    pedidos,
    nuevoPedido,
    detallesPedidos,
    estadosPedidos,
    historialPedidos
  };