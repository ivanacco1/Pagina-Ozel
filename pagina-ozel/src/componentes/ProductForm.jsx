import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button, Typography, MenuItem } from '@mui/material';
import axios from 'axios';
import CategoriaModal from './CategoriaModal';
import ColorModal from './ColorModal';
import TallaModal from './TallaModal';

const ProductForm = ({ open, onClose, onFormSubmit, formMode, formValues, setFormValues }) => {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);
  const [isTallaModalOpen, setIsTallaModalOpen] = useState(false);

  useEffect(() => { //consigue todas las categorias existentes
    fetchCategorias();
    fetchColores();
    fetchTallas();
  }, []);

  const fetchCategorias = async () => { 
    try {
      const response = await axios.get('http://localhost:3000/api/categorias');
      const uniqueCategorias = response.data.filter(
        (cat, index, self) =>
          index === self.findIndex((c) => c.categoria === cat.categoria)
      );
      setCategorias(uniqueCategorias);
    } catch (error) {
      console.error('Error al cargar las categorías:', error.message);
    }
  };

  const fetchColores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/colores');
      setColores(response.data);
    } catch (error) {
      console.error('Error al cargar los colores:', error.message);
    }
  };

  const fetchTallas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tallas');
      setTallas(response.data);
    } catch (error) {
      console.error('Error al cargar las tallas:', error.message);
    }
  };

  const handleFormChange = (e) => { //actualiza variables a medida que cambian valores del formulario
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleFileChange = (e) => { //funcion para manejo de imagen
    const file = e.target.files[0];
    setFormValues((prevValues) => ({
      ...prevValues,
      Image: file
    }));
    setSelectedFileName(file ? file.name : '');
  };

  const handleSubmit = async () => { //adjunta y envia datos del formulario
    try {
      const formData = new FormData();
      for (const key in formValues) {
        if (formValues[key] !== null) {
          formData.append(key, formValues[key]);
        }
      }

      if (formMode === 'add') { //si se está añadiendo un producto se ejecuta esto
        formData.append('DateAdded', new Date().toISOString());
        const response = await axios.post('http://localhost:3000/api/productos', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 201) {
          alert('Producto añadido correctamente.');
        } else {
          console.error('Error al añadir el producto:', error.response.data.message);
          alert('Error al añadir el producto: ' + error.response.data.message);
        }
      } else { //en cambio si se está modificando un producto, se ejecuta esto en su lugar
        const response = await axios.put(`http://localhost:3000/api/productos/${formValues.ProductID}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          alert('Producto actualizado correctamente.');
        } else {
          console.error('Error al actualizar el producto:', error.response.data.message);
          alert('Error al actualizar el producto: ' + error.response.data.message);
        }
      }
      onFormSubmit();
    } catch (error) {
      console.error('Error al enviar el formulario:', error.response.data.message);
      alert('Error al enviar el formulario: ' + error.response.data.message);
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    setFormValues({ //parametros del producto
      ProductID: '',
      ProductName: '',
      Category: '',
      Subcategory: '',
      Price: '',
      Stock: '',
      Size: '',
      Color: '',
      Discount: '',
      Description: '',
      Image: null,
    });
    setSelectedFileName('');
    onClose();
  };

  const handleCategoriaSave = ({ categoria, subcategoria }) => { 
    setFormValues((prevValues) => ({
      ...prevValues,
      Category: categoria,
      Subcategory: subcategoria,
    }));
    fetchCategorias();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{formMode === 'add' ? 'Añadir Nuevo Producto' : 'Editar Producto'}</DialogTitle>
      <DialogContent>
        <Box
          component="form"
          sx={{
            '& .MuiTextField-root': { m: 1, width: '100%' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            required
            label="Nombre del Producto"
            name="ProductName"
            value={formValues.ProductName}
            onChange={handleFormChange}
          />
          <TextField
            select
            required
            label="Categoría"
            name="Category"
            value={formValues.Category}
            onChange={handleFormChange}
          >
            {categorias.map((cat) => (
              <MenuItem key={cat.id} value={cat.categoria}>
                {cat.categoria}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            required
            label="Subcategoría"
            name="Subcategory"
            value={formValues.Subcategory}
            onChange={handleFormChange}
          >
            {categorias
              .filter((cat) => cat.categoria === formValues.Category)
              .map((cat) => (
                <MenuItem key={cat.id} value={cat.subcategoria}>
                  {cat.subcategoria}
                </MenuItem>
              ))}
          </TextField>

          <Box display="flex" alignItems="center" mt={2}>
            <Button variant="contained" color="primary" onClick={() => setIsCategoriaModalOpen(true)}>
              Gestionar Categorías
            </Button>
          </Box>
          <TextField
            select
            required
            label="Color"
            name="Color"
            value={formValues.Color}
            onChange={handleFormChange}
          >
            {colores.map((color) => (
              <MenuItem key={color.id} value={color.color}>
                {color.color}
              </MenuItem>
            ))}
          </TextField>
          <Box display="flex" alignItems="center" mt={2}>
            <Button variant="contained" color="primary" onClick={() => setIsColorModalOpen(true)}>
              Gestionar Colores
            </Button>
          </Box>
          <TextField
            select
            required
            label="Tamaño"
            name="Size"
            value={formValues.Size}
            onChange={handleFormChange}
          >
            {tallas.map((talla) => (
              <MenuItem key={talla.id} value={talla.talla}>
                {talla.talla}
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" alignItems="center" mt={2}>
            <Button variant="contained" color="primary" onClick={() => setIsTallaModalOpen(true)}>
              Gestionar Tallas
            </Button>
          </Box>
          <TextField
            required
            label="Precio"
            name="Price"
            type="number"
            value={formValues.Price}
            onChange={handleFormChange}
          />
          <TextField
            required
            label="Stock"
            name="Stock"
            type="number"
            value={formValues.Stock}
            onChange={handleFormChange}
          />
          <TextField
            label="Descuento (%)"
            name="Discount"
            type="number"
            value={formValues.Discount}
            onChange={handleFormChange}
            inputProps={{ min: 0, max: 100 }}
          />
          <TextField
            label="Descripción"
            name="Description"
            value={formValues.Description}
            onChange={handleFormChange}
            multiline
            rows={4}
          />
          <Box display="flex" alignItems="center" mt={2}>
            <Button
              variant="contained"
              component="label"
            >
              Subir Imagen
              <input
                type="file"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {selectedFileName && (
              <Typography variant="body2" ml={2}>
                {selectedFileName}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Guardar
        </Button>
      </DialogActions>
      <CategoriaModal open={isCategoriaModalOpen} onClose={() => {setIsCategoriaModalOpen(false); fetchCategorias()}} onSave={handleCategoriaSave} />
      <ColorModal open={isColorModalOpen} onClose={() => {setIsColorModalOpen(false); fetchColores()}} />
      <TallaModal open={isTallaModalOpen} onClose={() => {setIsTallaModalOpen(false); fetchTallas()}} />
    </Dialog>
  );
};

export default ProductForm;