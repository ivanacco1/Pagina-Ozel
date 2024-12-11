import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import fs from 'fs';

const PORT = process.env.PORT || 3000;

  // Función para obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para formatear la fecha al formato YYYY-MM-DD
const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };


  // Endpoint para obtener todos los productos
  export const lista = async (req, res) => {
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
  };

// Función para eliminar un producto
export const borrar = async (req, res) => {
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

    // Recupera la URL de la imagen asociada al producto
    const selectQuery = 'SELECT ImageURL FROM Productos WHERE ProductID = ?';
    db.query(selectQuery, [id], (err, selectResults) => {
      if (err) {
        console.error('Error recuperando la URL de la imagen:', err);
        return res.status(500).json({ message: 'Error al recuperar la información del producto' });
      }

      if (selectResults.length === 0) {
        return res.status(404).json({ message: 'Producto no encontrado' });
      }

      const { ImageURL } = selectResults[0];

      // Si existe una imagen asociada, intenta eliminarla del sistema de archivos
      if (ImageURL) {
        const imagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(ImageURL)); // Asegúrate de usar path.join
        fs.unlink(imagePath, unlinkErr => {
          if (unlinkErr) {
            console.error('Error eliminando el archivo de la imagen:', unlinkErr);
          }
        });
      }

      // Elimina el producto de la base de datos
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
};

  
// Endpoint para crear productos
export const crear = async (req, res) => {
    const {
      ProductName,
      Category,
      Subcategory,
      Description,
      Price,
      Stock,
      Size,
      Color,
      Discount,
      IsHidden
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
        ProductName, Category, Subcategory, Description, Price, Stock, ImageURL, DateAdded, Size, Color, Discount, IsHidden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      IsHidden,
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
          IsHidden,
          ImageURL: ImageURL ? `http://localhost:${PORT}${ImageURL}` : null
        }
      });
    });
  };



 // Endpoint para actualizar productos
export const actualizar = async (req, res) => {
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
    Discount,
    IsHidden
  } = req.body;

  let { SaleStart, SaleEnd } = req.body;

  // Validar si el precio es mayor o igual a 1
  if (Price < 1) {
    return res.status(400).json({ message: 'El precio debe ser mayor o igual a 1' });
  }

  const ImageURL = req.file ? `/uploads/${req.file.filename}` : null;

  // Recuperar la URL de la imagen actual antes de actualizar
  const selectQuery = 'SELECT ImageURL FROM Productos WHERE ProductID = ?';
  db.query(selectQuery, [productId], (selectErr, selectResults) => {
    if (selectErr) {
      console.error('Error recuperando la URL de la imagen actual:', selectErr);
      return res.status(500).json({ message: 'Error al recuperar la información del producto' });
    }

    if (selectResults.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const oldImageURL = selectResults[0].ImageURL;

    // Construir la consulta de actualización
    let query = `
      UPDATE Productos SET 
        ProductName = ?, Category = ?, Subcategory = ?, Description = ?, Price = ?, Stock = ?, Size = ?, Color = ?, Discount = ?, IsHidden = ?
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
      IsHidden
    ];

    

    if (ImageURL) {
      query += `, ImageURL = ?`;
      values.splice(10, 0, ImageURL);
    }
    values.splice(10 + (ImageURL ? 1 : 0), 0, productId);

    query += ` WHERE ProductID = ?`;


    console.log(query);
    console.log(values);
    // Ejecutar la consulta de actualización
    db.query(query, values, (updateErr, results) => {
      if (updateErr) {
        console.error('Error actualizando producto en la base de datos:', updateErr);
        return res.status(500).json({ message: 'Error al actualizar el producto' });
      }

      // Eliminar la imagen antigua si se subió una nueva
      if (ImageURL && oldImageURL) {
        const oldImagePath = path.join(__dirname, '..', 'public', 'uploads', path.basename(oldImageURL));
        fs.unlink(oldImagePath, unlinkErr => {
          if (unlinkErr) {
            console.error('Error eliminando el archivo de la imagen antigua:', unlinkErr);
          }
        });
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
          IsHidden,
          ImageURL: ImageURL ? `http://localhost:${PORT}${ImageURL}` : null
        }
      });
    });
  });
};

export default {
    lista,
    borrar,
    crear,
    actualizar
  };