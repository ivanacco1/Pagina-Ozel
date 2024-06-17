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
        return res.status(500).json({ message: 'Error eliminando el producto' });
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

// Ruta estática para servir los archivos de imagen
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});