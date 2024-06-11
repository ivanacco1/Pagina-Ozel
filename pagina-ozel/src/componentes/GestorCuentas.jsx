import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import '../estilos/GestorCuentas.css';

const GestorCuentas = () => {
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/usuarios/lista');
      if (response.status === 200) {
        setUsuarios(response.data);
        console.log(response.data);
      } else {
        console.error('Error al cargar la lista de usuarios:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar la lista de usuarios:', error.message);
    } finally {
      setLoading(false);

    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const isValueIncluded = (value, searchTerm) => {
    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
  };

  const handleChangeRol = (event, user) => {
    setSelectedUser(user);
    setNewRole(event.target.value);
    setOpenConfirmationDialog(true);
  };

  const handleConfirmChange = async () => {
    setOpenConfirmationDialog(false);
    console.log(usuario.UserId, newRole, adminPassword, selectedUser.AccountID);
    try {
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuario.UserId}`, {
        Role: newRole,
        AdminPassword: adminPassword,
        TargetID: selectedUser.AccountID
      });
      if (response.status === 200) {
        // Actualizar lista de usuarios
        cargarUsuarios();
        alert('Rol de usuario actualizado correctamente.');
      } else {
        console.error('Error al actualizar el rol del usuario:', response.statusText);
        alert('Error al actualizar el rol del usuario.');
      }
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error.message);
      alert('Error al actualizar el rol del usuario.');
    } finally {
      setSelectedUser(null);
      setNewRole('');
      setAdminPassword('');
    }
  };

  const handleCancelChange = () => {
    setOpenConfirmationDialog(false);
    setSelectedUser(null);
    setNewRole('');
    setAdminPassword('');
  };

  const filteredUsuarios = usuarios.filter((user) =>
    isValueIncluded(user.FirstName, searchTerm) ||
    isValueIncluded(user.LastName, searchTerm) ||
    isValueIncluded(user.Email, searchTerm) ||
    isValueIncluded(user.Role, searchTerm) ||
    isValueIncluded(user.Phone, searchTerm) ||
    isValueIncluded(user.Address, searchTerm) ||
    isValueIncluded(user.City, searchTerm) ||
    isValueIncluded(user.PostalCode, searchTerm)
  );

  return (
    <>
      <Typography variant="h5" gutterBottom mt={4}>Gestor de Cuentas</Typography>
      <TextField
        label="Buscar usuario"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearchChange}
      />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <TableContainer component={Paper} style={{ maxWidth: '100%' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Dirección</TableCell>
                  <TableCell>Ciudad</TableCell>
                  <TableCell>Código Postal</TableCell>
                  <TableCell>Fecha de registro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsuarios.map((user) => (
                  <TableRow key={user.AccountID}>
                    <TableCell>{user.AccountID}</TableCell>
                    <TableCell>{user.FirstName}</TableCell>
                    <TableCell>{user.LastName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>
                      <FormControl variant="standard" fullWidth>
                        <InputLabel id={`rol-label-${user.UserId}`} shrink={false}></InputLabel>
                        <Select
                        MenuProps={{
                          disableScrollLock: true,
                        }}
                          labelId={`rol-label-${user.UserId}`}
                          id={`rol-select-${user.UserId}`}
                          value={user.Role}
                          onChange={(event) => handleChangeRol(event, user)}
                          label=""
                          disabled={user.AccountID === usuario.UserId} 
                        >
                          <MenuItem value="admin">Admin</MenuItem>
                          <MenuItem value="client">Cliente</MenuItem>
                          <MenuItem value="gestor">Gestor</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>{user.Phone}</TableCell>
                    <TableCell>{user.Address}</TableCell>
                    <TableCell>{user.City}</TableCell>
                    <TableCell>{user.PostalCode}</TableCell>
                    <TableCell>{user.DateRegistered}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Dialog open={openConfirmationDialog} onClose={handleCancelChange}>
            <DialogTitle>Confirmar Cambio de Rol</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Por favor, introduce la contraseña de administrador para confirmar el cambio de rol para el usuario {selectedUser ? selectedUser.UserId : ''}:</Typography>
              <TextField
                label="Contraseña de Administrador"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelChange} color="primary">Cancelar</Button>
              <Button onClick={handleConfirmChange} color="primary" variant="contained">Confirmar</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default GestorCuentas;