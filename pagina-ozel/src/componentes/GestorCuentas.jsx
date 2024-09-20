import React, { useState, useEffect } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, TextField, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import { useAuth } from './AutentificacionProvider';
import HistorialCompras from './GestorCuentas/HistorialCompras'; // Importamos el nuevo componente
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
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [openHistorialDialog, setOpenHistorialDialog] = useState(false); // Estado para abrir/cerrar el historial de compras
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
const [openPasswordDialog, setOpenPasswordDialog] = useState(false);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/usuarios/lista');
      if (response.status === 200) {
        setUsuarios(response.data);
        //console.log(response.data);
      } else {
        console.error('Error al cargar la lista de usuarios:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar la lista de usuarios:', error.response.data.message);
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
    try {
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuario.UserId}`, {
        Role: newRole,
        AdminPassword: adminPassword,
        TargetID: selectedUser.AccountID
      });
      if (response.status === 200) {
        cargarUsuarios();
        alert('Rol de usuario actualizado correctamente.');
      } else {
        console.error('Error al actualizar el rol del usuario:', response.statusText);
        alert('Error al actualizar el rol del usuario.');
      }
    } catch (error) {
      console.error('Error al actualizar el rol del usuario:', error.response.data.message);
      alert('Error al actualizar el rol del usuario: ' + error.response.data.message);
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

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    return password;
  };

  const handleResetPasswordClick = (user) => {
    setSelectedUser(user);
    setResetPassword(generateRandomPassword());
    setOpenResetDialog(true);
  };

  const handleConfirmResetPassword = async () => {
    try {
      const response = await axios.put(`http://localhost:5000/api/usuarios/${usuario.UserId}`, {
        NewPassword: resetPassword,
        AdminPassword: adminPassword,
        TargetID: selectedUser.AccountID
      });
      if (response.status === 200) {
        alert(`Contraseña restablecida. La nueva contraseña es: ${resetPassword}`);
      } else {
        console.error('Error al restablecer la contraseña del usuario:', response.statusText);
        alert('Error al restablecer la contraseña del usuario.');
      }
    } catch (error) {
      console.error('Error al restablecer la contraseña del usuario:', error.response.data.message);
      alert('Error al restablecer la contraseña del usuario: ' + error.response.data.message);
    } finally {
      setSelectedUser(null);
      setAdminPassword('');
      setOpenResetDialog(false);
    }
  };

  const handleCancelResetPassword = () => {
    setSelectedUser(null);
    setAdminPassword('');
    setOpenResetDialog(false);
  };

  const handleDeleteUserClick = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleConfirmDeleteUser = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/usuarios/${usuario.UserId}`, {
        data: {
          AdminPassword: adminPassword,
          TargetID: selectedUser.AccountID
        }
      });
      if (response.status === 204) {
        alert('Usuario eliminado correctamente.');
        cargarUsuarios();
      } else {
        console.error('Error al eliminar el usuario:', response.statusText);
        alert('Error al eliminar el usuario.');
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error.response.data.message);
      alert('Error al eliminar el usuario.' + error.response.data.message);
    } finally {
      setSelectedUser(null);
      setAdminPassword('');
      setOpenDeleteDialog(false);
    }
  };

  const handleCancelDeleteUser = () => {
    setSelectedUser(null);
    setAdminPassword('');
    setOpenDeleteDialog(false);
  };

  const filteredUsuarios = usuarios.filter((user) =>
    isValueIncluded(user.FirstName, searchTerm) ||
    isValueIncluded(user.LastName, searchTerm) ||
    isValueIncluded(user.Email, searchTerm) ||
    isValueIncluded(user.Role, searchTerm) ||
    isValueIncluded(user.Phone, searchTerm)
  );

const handleHistorialClick = (user) => {
  setSelectedUser(user); // Guardamos el usuario seleccionado
  setOpenPasswordDialog(true); // Abrimos el modal de confirmación de contraseña
};

  const handleCloseHistorial = () => {
    setOpenHistorialDialog(false); // Cerramos el modal
  };

  const handleConfirmPassword = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/usuarios/validate-password', {
        UserId: usuario.UserId, // ID del usuario actual
        Password: passwordConfirmation
      });
      setPasswordConfirmation('');
      if (response.status === 200) {
        setOpenPasswordDialog(false); // Cerrar el modal de contraseña
        setOpenHistorialDialog(true); // Abrir el modal del historial
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (error) {
      console.error('Error al validar la contraseña:', error.response?.data?.message || error.message);
      alert('Error al validar la contraseña');
    }
  };

  


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
          <TableContainer component={Paper} style={{ width: '100%', overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Apellido</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Fecha de<br/>registro</TableCell>
                  <TableCell>Restablecer<br/>Contraseña</TableCell>
                  <TableCell>Borrar<br/>Cuenta</TableCell>
                  <TableCell>Ver<br/>Pedidos</TableCell>
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
                    <TableCell>{user.DateRegistered}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="secondary" 
                        disabled={user.AccountID === usuario.UserId} 
                        onClick={() => handleResetPasswordClick(user)}
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="error"        
                        disabled={user.AccountID === usuario.UserId} 
                        onClick={() => handleDeleteUserClick(user)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                    <TableCell>
              <IconButton
                color="primary"
                onClick={() => handleHistorialClick(user)}
              >
                <VisibilityIcon />
              </IconButton>
            </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Dialogo para cambiar rol */}
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
          {/* Dialogo para restablecer contraseña */}
          <Dialog open={openResetDialog} onClose={handleCancelResetPassword}>
            <DialogTitle>Confirmar Restablecimiento de Contraseña</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Por favor, introduce la contraseña de administrador para confirmar el restablecimiento de la contraseña para el usuario {selectedUser ? selectedUser.UserId : ''}:</Typography>
              <TextField
                label="Contraseña de Administrador"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <Typography variant="body1" mt={2}>Nueva contraseña: {resetPassword}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelResetPassword} color="primary">Cancelar</Button>
              <Button onClick={handleConfirmResetPassword} color="primary" variant="contained">Confirmar</Button>
            </DialogActions>
          </Dialog>
          {/* Dialogo para borrar cuenta */}
          <Dialog open={openDeleteDialog} onClose={handleCancelDeleteUser}>
            <DialogTitle>Confirmar Eliminación de Cuenta</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Por favor, introduce la contraseña de administrador para confirmar la eliminación de la cuenta para el usuario {selectedUser ? selectedUser.UserId : ''}:</Typography>
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
              <Button onClick={handleCancelDeleteUser} color="primary">Cancelar</Button>
              <Button onClick={handleConfirmDeleteUser} color="primary" variant="contained">Confirmar</Button>
            </DialogActions>
          </Dialog>


          
          <Dialog open={openHistorialDialog} onClose={handleCloseHistorial} fullWidth maxWidth="md">
        <DialogTitle>Historial de Compras de {selectedUser?.FirstName} {selectedUser?.LastName}</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <HistorialCompras userId={selectedUser.AccountID} /> // Renderizamos el componente con el historial de compras
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistorial} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
  <DialogTitle>Confirmar Contraseña</DialogTitle>
  <DialogContent>
    <Typography variant="body1">
      Introduzca su contraseña para ver el historial de compras del usuario {selectedUser ? selectedUser.FirstName : ''}:
    </Typography>
    <TextField
      label="Contraseña"
      type="password"
      variant="outlined"
      fullWidth
      margin="normal"
      value={passwordConfirmation}
      onChange={(e) => setPasswordConfirmation(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPasswordDialog(false)} color="primary">Cancelar</Button>
    <Button onClick={handleConfirmPassword} color="primary" variant="contained">Confirmar</Button>
  </DialogActions>
</Dialog>
        </>
      )}
    </>
  );
};

export default GestorCuentas;