import React, { useState, useEffect } from 'react';
import { useAuth } from './AutentificacionProvider';
import { Typography, Container, Box, AppBar, Tabs, Tab, Grid, Card, CardContent, CircularProgress, TextField, Button } from '@mui/material';
import './MiCuenta.css';

const MiCuenta = () => {
  const { usuario } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [historialCompras, setHistorialCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Address: '',
    City: '',
    PostalCode: '',
    CurrentPassword: '',
    NewPassword: '',
    ConfirmPassword: ''
  });

  useEffect(() => {
    if (usuario) {
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
    }
  }, [usuario]);

  useEffect(() => {
    if (usuario && usuario.Pedidos) {
      setHistorialCompras(usuario.Pedidos);
    }
  }, [usuario]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === 2) {
      cargarHistorialCompras();
    }
  };

  const cargarHistorialCompras = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.AccountID}/pedidos`);
      if (response.ok) {
        const data = await response.json();
        setHistorialCompras(data);
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
    }

    const updateData = {
      ...formData,
      NewPassword: formData.NewPassword || null
    };

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.AccountID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        alert('Datos actualizados correctamente.');
        setEditMode(false);
        setChangePasswordMode(false);

        // Actualizar los datos del usuario en localStorage
        localStorage.setItem('usuario', JSON.stringify(updatedUser));
      } else {
        console.error('Error al actualizar los datos:', response.statusText);
        alert('Error al actualizar los datos.');
      }
    } catch (error) {
      console.error('Error al actualizar los datos:', error.message);
      alert('Error al actualizar los datos.');
    }
  };

  if (!usuario) {
    return <Typography variant="h5">Debes estar logueado para ver esta página.</Typography>;
  }

  return (
    <Container className="mi-cuenta-container">
      <Box className="mi-cuenta-box">
        <AppBar position="static" color="default">
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
            className="tabs-centered"
          >
            <Tab label="Resumen" />
            <Tab label="Modificar Datos" />
            <Tab label="Historial de Compras" />
            {usuario.Role === 'admin' && <Tab label="Gestor de Productos" />}
            {usuario.Role === 'admin' && <Tab label="Gestor de Cuentas" />}
          </Tabs>
        </AppBar>
        <Box p={3} className="mi-cuenta-content">
          {selectedTab === 0 && (
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
                <Grid item xs={12}>
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
                    type="password"
                    value={formData.NewPassword}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    className="MuiTextField-root"
                    label="Confirmar Nueva Contraseña"
                    name="ConfirmPassword"
                    type="password"
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
                    <Button variant="contained" color="primary" onClick={handleEdit} style={{ marginTop: '20px' }}>Modificar Datos</Button>
                    <Button variant="contained" color="secondary" onClick={() => setChangePasswordMode(true)} style={{ marginTop: '20px', marginLeft: '10px' }}>Cambiar Contraseña</Button>
                  </>
                )}
              </Box>
            </>
          )}
          {selectedTab === 1 && (
            <>
              {/* Puedes mover el contenido de modificar datos aquí si lo prefieres */}
            </>
          )}
          {selectedTab === 2 && (
            <>
              <Typography variant="h5" gutterBottom mt={4}>Historial de Compras</Typography>
              {loading ? (
                <CircularProgress />
              ) : (
                <Grid container spacing={2} justifyContent="center">
                  {historialCompras.map((pedido, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="body1">
                            Pedido ID: {pedido.OrderID}, Fecha: {pedido.OrderDate}, Total: ${pedido.TotalAmount}, Estado: {pedido.Status}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default MiCuenta;