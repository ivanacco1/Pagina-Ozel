import React, { useState } from 'react';
import './Modal.css';

function Register({ isOpen, onClose }) {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
        const result = await response.json();
        console.log('Registro exitoso:', result);
        onClose();
      } else {
        const errorData = await response.json();
        if (response.status === 400) {
          setError(errorData.message || 'Error al registrar la cuenta');
        } else if (response.status === 500) {
          setError('Error, el email ya está en uso.');
        } else {
          setError('Error al registrar la cuenta, Intente nuevamente más tarde');
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
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit">Registrarse</button>
          <button type="button" onClick={onClose}>Cerrar</button>
        </form>
      </div>
    </div>
  );
}

export default Register;