
import db from '../db.js';


//-------------------------------------------------------------------------------------------------------------------
//   Carrito
//-------------------------------------------------------------------------------------------------------------------


// Endpoint para agregar un producto al carrito
export const agregar = async (req, res) => {
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
  };


  

// Endpoint para obtener los productos del carrito de un usuario con descuento aplicado
export const carritoUsuario = async (req, res) => {
  const { accountId } = req.params;

  const query = `
    SELECT 
      c.Quantity, 
      p.ProductID, 
      p.ProductName, 
      p.Price, 
      p.Discount, 
      p.Stock,
      p.Price * (1 - (p.Discount / 100)) AS DiscountedPrice
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
};

// Endpoint para actualizar la cantidad de un producto en el carrito
export const actualizar = async (req, res) => {
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
};



// Endpoint para eliminar un producto del carrito
export const borrarProducto = async (req, res) => {
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
};


// Endpoint para limpiar un carrito
export const limpiar = async (req, res) => {
  const { userId } = req.params;

  const query = `
    DELETE FROM Carrito WHERE Usuarios_AccountID = ?
 `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al vaciar el carrito:', err);
      return res.status(500).json({ message: 'Error al vaciar el carrito' });
    }

    res.status(200).json({ message: 'Carrito vaciado exitosamente' });
  });
};


export default {
    agregar,
    carritoUsuario,
    actualizar,
    borrarProducto,
    limpiar
  };