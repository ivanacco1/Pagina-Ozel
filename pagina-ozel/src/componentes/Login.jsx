import React, { useState, useEffect } from 'react';
import '../estilos/Modal.css';
import { TextField, Button, IconButton, InputAdornment, Checkbox, FormControlLabel } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from './AutentificacionProvider';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ isOpen, onClose }) {
  const { login } = useAuth();
  const [Email, setEmail] = useState('');
  const [Password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(false);
  const [error, setError] = useState(null);
  const [loginExitoso, setLoginExitoso] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post('http://localhost:5000/api/usuarios/login', data);

      if (response.status === 200) {
        const result = response.data;
        setLoginExitoso(true);
        setError(null);
        login(result.user, mantenerSesion);
        setTimeout(() => {
          setLoginExitoso(false);
          onClose();
        }, 3000);
      } else {
        const errorData = response.data;
        if (response.status === 400 || response.status === 401) {
          setError(errorData.message || 'Credenciales incorrectas');
        } else {
          setError('Error al iniciar sesión. Intente nuevamente más tarde.');
        }
      }
    } catch (err) {
      if (err.response) {
        // Error de respuesta del servidor
        
          setError(err.response.data.message || 'Credenciales incorrectas');

      } else {
        // La solicitud fue hecha pero no hubo respuesta
        setError('No se pudo conectar con el servidor. Intente nuevamente más tarde.');
      } 
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setMostrarPassword(false);
      setMantenerSesion(false);
      setError(null);
      setLoginExitoso(false);
    }
  }, [isOpen]);

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