
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';

const app = express();
const PORT = process.env.PORT || 3000;

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
 // Formatear las fechas en el resultado
 const formattedResults = results.map(product => {
  return {
    ...product,
    DateAdded: product.DateAdded ? new Date(product.DateAdded).toLocaleDateString().split('T')[0] : null,
    SaleStart: product.SaleStart ? new Date(product.DateAdded).toLocaleDateString().split('T')[0] : null,
    SaleEnd: product.SaleEnd ? new Date(product.DateAdded).toLocaleDateString().split('T')[0] : null
  };
});

    res.status(200).json(formattedResults);
  });
});










// Endpoint para eliminar productos
app.delete('/api/productos/:id', async (req, res) => {
  console.log(req.params,req.body);
  const { id } = req.params;
  const { AdminPassword, AccountID } = req.body;

  if (!AdminPassword || !AccountID) {
    return res.status(400).json({ message: 'La contraseña del administrador y el ID de la cuenta son obligatorios' });
  }

  // Verificar la contraseña del administrador
  const query = 'SELECT Password FROM Usuarios WHERE AccountID = ? AND Role = "admin"';
  db.query(query, [AccountID], async (err, results) => {
    if (err) {
      console.error('Error verificando la contraseña del administrador:', err);
      return res.status(500).json({ message: 'Error verificando la contraseña del administrador' });
    }

    if (results.length === 0) {
      return res.status(403).json({ message: 'Permisos insuficientes o cuenta no encontrada' });
    }

    const admin = results[0];
    const isPasswordCorrect = await bcrypt.compare(AdminPassword, admin.Password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Contraseña del administrador incorrecta' });
    }

    // Eliminar el producto
    const deleteQuery = 'DELETE FROM Productos WHERE ProductID = ?';
    db.query(deleteQuery, [id], (err, deleteResults) => {
      if (err) {
        console.error('Error eliminando el producto de la base de datos:', err);
        return res.status(500).json({ message: 'Error eliminando el producto' });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      res.status(204).send();
    });
  });
});

app.listen(PORT, () => {
  console.log(`API de Productos escuchando en puerto ${PORT}`);
});