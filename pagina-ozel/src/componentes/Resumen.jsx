import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, Box, Typography, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AutentificacionProvider';
import { ValidatePassword } from './ValidatePassword';
import '../estilos/MiCuenta.css';
import axios from 'axios';

const Resumen = () => {
  const { usuario, actualizarUsuario } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Address: '',
    City: '',
    Provincia: '',
    PostalCode: '',
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: ''
  });

  const handleMostrarContraseñaClick = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  useEffect(() => {
    if (usuario) {
      setFormData({
        FirstName: usuario.FirstName,
        LastName: usuario.LastName,
        Email: usuario.Email,
        Phone: usuario.Phone,
        Address: usuario.Address,
        City: usuario.City,
        Provincia: usuario.Provincia,
        PostalCode: usuario.PostalCode,
        CurrentPassword: '',
        NewPassword: '',
        ConfirmPassword: ''
      });
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario && usuario.Pedidos) {
      setHistorialCompras(usuario.Pedidos);
    }
  }, [usuario]);

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/usuarios/${usuario.UserId}/pedidos`);
      if (response.status === 200) {
        setHistorialCompras(response.data);
      } else {
        console.error('Error al cargar historial de compras:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar historial de compras:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setChangePasswordMode(false);
    setFormData({
      FirstName: usuario.FirstName,
      LastName: usuario.LastName,
      Email: usuario.Email,
      Phone: usuario.Phone,
      Address: usuario.Address,
      City: usuario.City,
      PostalCode: usuario.PostalCode,
      CurrentPassword: '',
      NewPassword: '',
      ConfirmPassword: ''
    });
  };

  const handleConfirm = async () => {
    if (!formData.CurrentPassword) {
      alert('Por favor, introduce tu contraseña actual para confirmar.');
      return;
    }

    if (changePasswordMode) {
      if (formData.NewPassword !== formData.ConfirmPassword) {
        alert('Las nuevas contraseñas no coinciden.');
        return;
      }

      if (!ValidatePassword(formData.NewPassword)) {
        alert('La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.');
        return;
      }
    }

    const updateData = {
      ...formData,
      NewPassword: formData.NewPassword || null
    };

    try {
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuario.UserId}`, updateData);
      if (response.status === 200) {
        const updatedUser = response.data;
        alert('Datos actualizados correctamente.');
        setEditMode(false);
        setChangePasswordMode(false);
        actualizarUsuario(updatedUser.user); // Actualiza el contexto con los nuevos datos del usuario
        console.log(updatedUser.user);
      } else {
        console.error('Error al actualizar los datos:', response.statusText);
        alert('Error al actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error.response.data.message);
      alert('Error al actualizar los datos: ' + error.response.data.message);
    }
  };

  if (!usuario) {
    return <Typography variant="h5">Debes estar logueado para ver esta página.</Typography>;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>Mi Cuenta</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Nombre"
            name="FirstName"
            value={formData.FirstName}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Apellido"
            name="LastName"
            value={formData.LastName}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
 {/* Teléfono y Email en la misma fila */}
 <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Correo Electrónico"
            name="Email"
            value={formData.Email}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Teléfono"
            name="Phone"
            value={formData.Phone || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Grid>
        {/* Ciudad y Provincia en la misma fila */}
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Ciudad"
            name="City"
            value={formData.City || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Provincia"
            name="Provincia"
            value={formData.Provincia || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        {/* Dirección y Código Postal en la misma fila */}
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Dirección"
            name="Address"
            value={formData.Address || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            className="MuiTextField-root"
            label="Código Postal"
            name="PostalCode"
            value={formData.PostalCode || ''}
            onChange={handleInputChange}
            disabled={!editMode}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
     
      {changePasswordMode && (
        <>
          <TextField
            className="MuiTextField-root"
            label="Nueva Contraseña"
            name="NewPassword"
            type={mostrarContraseña ? 'text' : 'password'}
            value={formData.NewPassword}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleMostrarContraseñaClick} style={{ backgroundColor: 'white', outline: 'none' }} disableFocusRipple>
                    {mostrarContraseña ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            className="MuiTextField-root"
            label="Confirmar Nueva Contraseña"
            name="ConfirmPassword"
           type={mostrarContraseña ? 'text' : 'password'}
            value={formData.ConfirmPassword}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </>
      )}
       {(editMode || changePasswordMode) && (
        <TextField
          className="MuiTextField-root"
          label="Contraseña Actual"
          name="CurrentPassword"
          type="password"
          value={formData.CurrentPassword}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      )}
      <Box mt={2}>
        {editMode || changePasswordMode ? (
          <>
            <Button variant="contained" color="primary" onClick={handleConfirm}>Confirmar</Button>
            <Button variant="contained" color="secondary" onClick={handleCancel} style={{ marginLeft: '10px' }}>Cancelar</Button>
          </>
        ) : (
          <>
            <Button variant="contained" color="primary" onClick={() => setEditMode(true)} style={{ marginTop: '20px' }}>Modificar Datos</Button>
            <Button variant="contained" color="secondary" onClick={() => setChangePasswordMode(true)} style={{ marginTop: '20px', marginLeft: '10px' }}>Cambiar Contraseña</Button>
          </>
        )}
      </Box>
    </>
  );
};

export default Resumen;