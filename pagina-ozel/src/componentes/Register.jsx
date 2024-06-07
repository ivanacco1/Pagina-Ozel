import React, { useState } from 'react';
import './Modal.css';
import { ValidatePassword } from './ValidatePassword';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AutentificacionProvider';

function Register({ isOpen, onClose }) {
  const { login } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [error, setError] = useState(null);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const handleMostrarContraseñaClick = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!ValidatePassword(contraseña)) {
      setError('La contraseña debe tener al menos 6 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.');
      return;
    }

    const data = {
      nombre,
      apellido,
      correo,
      contraseña,
    };

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setRegistroExitoso(true);
        setError(null); // Limpiar el mensaje de error si lo hay
        setTimeout(() => {
          setRegistroExitoso(false);
          onClose();
          login(data); // Cambiar el estado a "logueado"
        }, 5000);
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          setError(errorData.message || 'Error al registrar la cuenta');
        } else if (response.status === 500) {
          setError('Error, el email ya está en uso.');
        } else {
          setError('Error al registrar la cuenta. Intente nuevamente más tarde.');
        }
      }
    } catch (err) {
      setError('Error de red');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Crear Cuenta</h2>
        {error && <p className="error">{error}</p>}
        {registroExitoso && <p className="success">¡Registro exitoso!</p>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Contraseña"
            type={mostrarContraseña ? 'text' : 'password'}
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
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
            fullWidth
            margin="normal"
            label="Confirmar Contraseña"
            type={mostrarContraseña ? 'text' : 'password'}
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <Button variant="contained" color="primary" type="submit">
              Registrarse
            </Button>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;