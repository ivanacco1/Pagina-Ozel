import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

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

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'ozel'
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('API de Productos Conectado a la base de datos MySQL');
});

// Función para formatear la fecha al formato YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

// Endpoint para obtener todos los productos
app.get('/api/productos', (req, res) => {
  const query = 'SELECT * FROM Productos';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener productos:', err);
      return res.status(500).json({ message: 'Error al obtener productos' });
    }

    // Formatea las fechas y construir la URL completa de la imagen en el resultado
    const formattedResults = results.map(product => {
      return {
        ...product,
        DateAdded: product.DateAdded ? formatDate(product.DateAdded) : null,
        SaleStart: product.SaleStart ? formatDate(product.SaleStart) : null,
        SaleEnd: product.SaleEnd ? formatDate(product.SaleEnd) : null,
        ImageURL: product.ImageURL ? `http://localhost:${PORT}${product.ImageURL}` : null
      };
    });

    res.status(200).json(formattedResults);
  });
});

// Endpoint para eliminar productos
app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { AdminPassword, AccountID } = req.body;

  if (!AdminPassword || !AccountID) {
    return res.status(400).json({ message: 'La contraseña del administrador y el ID de la cuenta son obligatorios' });
  }

  // Verifica la contraseña del administrador
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
        return res.status(500).json({ message: 'Producto actualmente en un carrito o pedido' });
      }

      if (deleteResults.affectedRows === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      res.status(204).send();
    });
  });
});

// Endpoint para crear productos
app.post('/api/productos', upload.single('Image'), (req, res) => {
  const {
    ProductName,
    Category,
    Subcategory,
    Description,
    Price,
    Stock,
    Size,
    Color,
    Discount
  } = req.body;

  let { SaleStart, SaleEnd } = req.body;

  // Valida si el precio es mayor o igual a 1
  if (Price < 1) {
    return res.status(400).json({ message: 'El precio debe ser mayor o igual a 1' });
  }

  const ImageURL = req.file ? `/uploads/${req.file.filename}` : null;
  const DateAdded = formatDate(new Date());
  const currentDate = formatDate(new Date());

  // Asigna fecha actual si SaleStart o SaleEnd son nulos
  SaleStart = SaleStart ? formatDate(SaleStart) : currentDate;
  SaleEnd = SaleEnd ? formatDate(SaleEnd) : currentDate;

  const query = `
    INSERT INTO Productos (
      ProductName, Category, Subcategory, Description, Price, Stock, ImageURL, DateAdded, Size, Color, Discount, SaleStart, SaleEnd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    ProductName,
    Category,
    Subcategory,
    Description,
    Price,
    Stock,
    ImageURL,
    DateAdded,
    Size,
    Color,
    Discount,
    SaleStart,
    SaleEnd
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error insertando producto en la base de datos:', err);
      return res.status(500).json({ message: 'Error al añadir el producto' });
    }

    res.status(201).json({
      message: 'Producto añadido correctamente',
      product: {
        ProductName,
        Category,
        Subcategory,
        Description,
        Price,
        Stock,
        Size,
        Color,
        Discount,
        SaleStart,
        SaleEnd,
        ImageURL: ImageURL ? `http://localhost:${PORT}${ImageURL}` : null
      }
    });
  });
});

// Endpoint para actualizar productos
app.put('/api/productos/:id', upload.single('Image'), (req, res) => {
  const productId = req.params.id;
  const {
    ProductName,
    Category,
    Subcategory,
    Description,
    Price,
    Stock,
    Size,
    Color,
    Discount
  } = req.body;

  let { SaleStart, SaleEnd } = req.body;

  // Validar si el precio es mayor o igual a 1
  if (Price < 1) {
    return res.status(400).json({ message: 'El precio debe ser mayor o igual a 1' });
  }

  const ImageURL = req.file ? `/uploads/${req.file.filename}` : null;
  const currentDate = formatDate(new Date());

  // Asigna fecha actual si SaleStart o SaleEnd son nulos
  SaleStart = SaleStart ? formatDate(SaleStart) : currentDate;
  SaleEnd = SaleEnd ? formatDate(SaleEnd) : currentDate;

  let query = `
    UPDATE Productos SET 
      ProductName = ?, Category = ?, Subcategory = ?, Description = ?, Price = ?, Stock = ?, Size = ?, Color = ?, Discount = ?, SaleStart = ?, SaleEnd = ?
  `;

  const values = [
    ProductName,
    Category,
    Subcategory,
    Description,
    Price,
    Stock,
    Size,
    Color,
    Discount,
    SaleStart,
    SaleEnd,
    productId
  ];

  if (ImageURL) {
    query += `, ImageURL = ?`;
    values.splice(10, 0, ImageURL);
  }

  query += ` WHERE ProductID = ?`;

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error actualizando producto en la base de datos:', err);
      return res.status(500).json({ message: 'Error al actualizar el producto' });
    }

    res.status(200).json({
      message: 'Producto actualizado correctamente',
      product: {
        ProductName,
        Category,
        Subcategory,
        Description,
        Price,
        Stock,
        Size,
        Color,
        Discount,
        SaleStart,
        SaleEnd,
        ImageURL: ImageURL ? `http://localhost:${PORT}${ImageURL}` : null
      }
    });
  });
});


// Obtener todas las categorías
app.get('/api/categorias', (req, res) => {
  const query = 'SELECT * FROM Categorias';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ message: 'Error al obtener categorías' });
    }

    res.status(200).json(results);
  });
});

// Crear una nueva categoría
app.post('/api/categorias', (req, res) => {
  const { categoria, subcategoria } = req.body;

  if (!categoria || !subcategoria) {
    return res.status(400).json({ message: 'Por favor, provea una categoría y subcategoría.' });
  }

  const query = 'INSERT INTO Categorias (categoria, subcategoria) VALUES (?, ?)';

  db.query(query, [categoria, subcategoria], (err, result) => {
    if (err) {
      console.error('Error al crear categoría:', err);
      return res.status(500).json({ message: 'Error al crear categoría' });
    }

    res.status(201).json({ message: 'Categoría creada exitosamente', categoryId: result.insertId });
  });
});

// Eliminar una categoría
app.delete('/api/categorias/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM Categorias WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar categoría:', err);
      return res.status(500).json({ message: 'Error al eliminar categoría' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    res.status(200).json({ message: 'Categoría eliminada exitosamente' });
  });
});


// Obtener todos los colores
app.get('/api/colores', (req, res) => {
  const query = 'SELECT * FROM Colores';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener colores:', err);
          return res.status(500).json({ message: 'Error al obtener colores' });
      }
      res.status(200).json(results);
  });
});

// Crear un nuevo color
app.post('/api/colores', (req, res) => {
  const { color } = req.body;
  const query = 'INSERT INTO Colores (color) VALUES (?)';
  db.query(query, [color], (err, result) => {
      if (err) {
          console.error('Error al agregar color:', err);
          return res.status(500).json({ message: 'Error al agregar color' });
      }
      res.status(201).json({ message: 'Color agregado con éxito' });
  });
});

// Eliminar un color
app.delete('/api/colores/:idColor', (req, res) => {
  const { idColor } = req.params;
  const query = 'DELETE FROM Colores WHERE idColor = ?';
  db.query(query, [idColor], (err, result) => {
      if (err) {
          console.error('Error al eliminar color:', err);
          return res.status(500).json({ message: 'Error al eliminar color' });
      }
      res.status(200).json({ message: 'Color eliminado con éxito' });
  });
});


// Obtener todas las tallas
app.get('/api/tallas', (req, res) => {
  const query = 'SELECT * FROM Tallas';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener tallas:', err);
          return res.status(500).json({ message: 'Error al obtener tallas' });
      }
      res.status(200).json(results);
  });
});

// Crear una nueva talla
app.post('/api/tallas', (req, res) => {
  const { talla } = req.body;
  const query = 'INSERT INTO Tallas (talla) VALUES (?)';
  db.query(query, [talla], (err, result) => {
      if (err) {
          console.error('Error al agregar talla:', err);
          return res.status(500).json({ message: 'Error al agregar talla' });
      }
      res.status(201).json({ message: 'Talla agregada con éxito' });
  });
});

// Eliminar una talla
app.delete('/api/tallas/:idTalla', (req, res) => {
  const { idTalla } = req.params;
  const query = 'DELETE FROM Tallas WHERE idTalla = ?';
  db.query(query, [idTalla], (err, result) => {
      if (err) {
          console.error('Error al eliminar talla:', err);
          return res.status(500).json({ message: 'Error al eliminar talla' });
      }
      res.status(200).json({ message: 'Talla eliminada con éxito' });
  });
});

// Ruta estática para servir los archivos de imagen
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});