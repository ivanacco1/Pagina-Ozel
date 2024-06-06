import React, { useState } from 'react';
import './Modal.css';
import { TextField, Button } from '@mui/material';

function Login({ isOpen, onClose }) {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Aquí puedes agregar la lógica para enviar la solicitud de inicio de sesión
    // utilizando los valores de correo y contraseña

    // Temporalmente, aquí solo cerramos la ventana emergente
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
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
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
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