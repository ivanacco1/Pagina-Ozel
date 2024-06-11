import React, { useState, useEffect } from 'react';
import '../estilos/Modal.css';
import { ValidatePassword } from './ValidatePassword';
import { TextField, Button, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AutentificacionProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

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
  const navigate = useNavigate(); // Inicializa useNavigate

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
      const response = await axios.post('http://localhost:5000/api/usuarios/registro', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const result = response.data;
        setRegistroExitoso(true);
        setError(null); // Limpiar el mensaje de error si lo hay
        setTimeout(() => {
          setRegistroExitoso(false);
          onClose();
          login(result.user);  // Cambiar el estado a "logueado"
          navigate('/'); // Redirige a la página de inicio
        }, 3000);
      } else {
        const errorData = response.data;
        if (response.status === 400) {
          setError(errorData.message || 'Error al registrar la cuenta');
        } else if (response.status === 500) {
          setError('Error, el email ya está en uso.');
        } else {
          setError('Error al registrar la cuenta. Intente nuevamente más tarde.');
        }
      }
    } catch (err) {
      if (err.response) {
        const errorData = err.response.data;
        if (err.response.status === 400) {
          setError(errorData.message || 'Error al registrar la cuenta');
        } else if (err.response.status === 500) {
          setError('Error, el email ya está en uso.');
        } else {
          setError('Error al registrar la cuenta. Intente nuevamente más tarde.');
        }
      } else {
        setError('Error de red');
      }
    }
  };

  // Restablecer los campos del formulario cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setNombre('');
      setApellido('');
      setCorreo('');
      setContraseña('');
      setConfirmarContraseña('');
      setMostrarContraseña(false);
      setError(null);
      setRegistroExitoso(false);
    }
  }, [isOpen]);

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