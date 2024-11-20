import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';

// Obtener todas las categorías
export const lista = async (req, res) => {
  const query = 'SELECT * FROM Categorias';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener categorías:', err);
      return res.status(500).json({ message: 'Error al obtener categorías' });
    }

    res.status(200).json(results);
  });
};

// Crear una nueva categoría
export const crearCategoria = async (req, res) => {
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
};

// Eliminar una categoría
export const borrarCategoria = async (req, res) => {
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
};

// Obtener todos los colores
export const colores = async (req, res) => {
  const query = 'SELECT * FROM Colores';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener colores:', err);
          return res.status(500).json({ message: 'Error al obtener colores' });
      }
      res.status(200).json(results);
  });
};

// Crear un nuevo color
export const agregarColor = async (req, res) => {
  const { color } = req.body;
  const query = 'INSERT INTO Colores (color) VALUES (?)';
  db.query(query, [color], (err, result) => {
      if (err) {
          console.error('Error al agregar color:', err);
          return res.status(500).json({ message: 'Error al agregar color' });
      }
      res.status(201).json({ message: 'Color agregado con éxito' });
  });
};



// Eliminar un color
export const borrarColor = async (req, res) => {
  const { idColor } = req.params;
  const query = 'DELETE FROM Colores WHERE idColor = ?';
  db.query(query, [idColor], (err, result) => {
      if (err) {
          console.error('Error al eliminar color:', err);
          return res.status(500).json({ message: 'Error al eliminar color' });
      }
      res.status(200).json({ message: 'Color eliminado con éxito' });
  });
};

// Obtener todas las tallas
export const tallas = async (req, res) => {
  const query = 'SELECT * FROM Tallas';
  db.query(query, (err, results) => {
      if (err) {
          console.error('Error al obtener tallas:', err);
          return res.status(500).json({ message: 'Error al obtener tallas' });
      }
      res.status(200).json(results);
  });
};

// Crear una nueva talla
export const agregarTalla = async (req, res) => {
  const { talla } = req.body;
  const query = 'INSERT INTO Tallas (talla) VALUES (?)';
  db.query(query, [talla], (err, result) => {
      if (err) {
          console.error('Error al agregar talla:', err);
          return res.status(500).json({ message: 'Error al agregar talla' });
      }
      res.status(201).json({ message: 'Talla agregada con éxito' });
  });
};

// Eliminar una talla
export const borrarTalla = async (req, res) => {
  const { idTalla } = req.params;
  const query = 'DELETE FROM Tallas WHERE idTalla = ?';
  db.query(query, [idTalla], (err, result) => {
      if (err) {
          console.error('Error al eliminar talla:', err);
          return res.status(500).json({ message: 'Error al eliminar talla' });
      }
      res.status(200).json({ message: 'Talla eliminada con éxito' });
  });
};


export default {
    lista,
    borrarCategoria,
    crearCategoria,
    colores,
    agregarColor,
    borrarColor,
    tallas,
    agregarTalla,
    borrarTalla
  };