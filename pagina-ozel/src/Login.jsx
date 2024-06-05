import React from 'react';

import './Modal.css';

function Login({ isOpen, onClose }) {
    if (!isOpen) return null;
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Iniciar Sesión</h2>
          <form>
            <input type="email" placeholder="Correo electrónico" required />
            <input type="password" placeholder="Contraseña" required />
            <button type="submit">Iniciar Sesión</button>
            <button type="button" onClick={onClose}>Cerrar</button>
          </form>
        </div>
      </div>
    );
  }

  export default Login;