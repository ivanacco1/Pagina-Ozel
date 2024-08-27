import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button, Typography } from '@mui/material';
import axios from 'axios';

const ProductForm = ({ open, onClose, onFormSubmit, formMode, formValues, setFormValues }) => {
  const [selectedFileName, setSelectedFileName] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormValues((prevValues) => ({
      ...prevValues,
      Image: file
    }));
    setSelectedFileName(file ? file.name : '');
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      for (const key in formValues) {
        if (formValues[key] !== null) {
          formData.append(key, formValues[key]);
        }
      }

      if (formMode === 'add') {
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
      } else {
        const response = await axios.put(`http://localhost:3000/api/productos/${formValues.ProductID}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (response.status === 200) {
          alert('Producto actualizado correctamente.');
        } else {
          console.error('Error al actualizar el producto:', error.response.data.message);
          alert('Error al actualizar el producto: '  + error.response.data.message);
        }
      }
      onFormSubmit();
    } catch (error) {
      console.error('Error al enviar el formulario:', error.response.data.message);
      alert('Error al enviar el formulario: '  + error.response.data.message);
    } finally {
      onClose();
    }
  };

  const handleClose = () => {
    // Resetea los valores del formulario y el nombre del archivo seleccionado
    setFormValues({
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
      SaleStart: '',
      SaleEnd: ''
    });
    setSelectedFileName('');
    onClose();
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
            required
            label="Categoría"
            name="Category"
            value={formValues.Category}
            onChange={handleFormChange}
          />
          <TextField
            required
            label="Subcategoría"
            name="Subcategory"
            value={formValues.Subcategory}
            onChange={handleFormChange}
          />
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
            label="Tamaño"
            name="Size"
            value={formValues.Size}
            onChange={handleFormChange}
          />
          <TextField
            label="Color"
            name="Color"
            value={formValues.Color}
            onChange={handleFormChange}
          />
          <TextField
            label="Descuento"
            name="Discount"
            type="number"
            value={formValues.Discount}
            onChange={handleFormChange}
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
          <TextField
            label="Inicio de Venta"
            name="SaleStart"
            type="date"
            value={formValues.SaleStart}
            onChange={handleFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="Fin de Venta"
            name="SaleEnd"
            type="date"
            value={formValues.SaleEnd}
            onChange={handleFormChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancelar</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {formMode === 'add' ? 'Añadir' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductForm;