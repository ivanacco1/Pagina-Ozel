import React, { useState } from 'react';
import './Modal.css';
import { TextField, Button, IconButton, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AutentificacionProvider';

function Login({ isOpen, onClose }) {
  const { login } = useAuth();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [error, setError] = useState(null);
  const [loginExitoso, setLoginExitoso] = useState(false);

  const handleMostrarPasswordClick = () => {
    setMostrarPassword(!mostrarPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const data = {
      Email,
      Password,
    };

    try {
      const response = await fetch('http://localhost:5000/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setLoginExitoso(true);
        setError(null);
        setTimeout(() => {
          setLoginExitoso(false);
          onClose();
          login(result.user); // Cambiar el estado a "logueado" con los datos del usuario
          console.log(result);
        }, 3000);

        // Guardar el estado de la sesión en el almacenamiento local si la casilla está marcada
        if (mantenerSesion) {
          localStorage.setItem('usuario', JSON.stringify(result.user));
        }
      } else {
        const errorData = await response.json();
        if (response.status === 400 || response.status === 401) {
          setError(errorData.message || 'Credenciales incorrectas');
        } else {
          setError('Error al iniciar sesión. Intente nuevamente más tarde.');
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
        <h2>Iniciar Sesión</h2>
        {error && <p className="error">{error}</p>}
        {loginExitoso && <p className="success">¡Inicio de sesión exitoso!</p>}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            type={mostrarPassword ? 'text' : 'password'}
            value={Password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleMostrarPasswordClick} style={{ backgroundColor: 'white', outline: 'none' }} disableFocusRipple>
                    {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={mantenerSesion} onChange={(e) => setMantenerSesion(e.target.checked)} />}
            label="Mantener sesión abierta"
          />
          <div className="modal-buttons">
            <Button variant="contained" color="primary" type="submit">
              Iniciar Sesión
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

export default Login;