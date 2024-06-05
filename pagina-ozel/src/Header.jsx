import React, { useState } from 'react';
import './Header.css';

import Register from './Register.jsx';
import Login from './Login.jsx';

function Header() {
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-top">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <div className="header-buttons">
          <button className="header-button" 
            onClick={() => setRegisterModalOpen(true)}>CREAR CUENTA</button>
          <span className="separator">|</span>
          <button className="header-button" 
            onClick={() => setLoginModalOpen(true)}>INICIAR SESION</button>
        </div>
      </div>
      <div className="header-bottom">
        <div className="nav-left">
          <input type="text" placeholder="Buscar..." className="search-bar" />
        </div>
        <div className="nav-right">
          <button className="nav-button">INICIO</button>
          <button className="nav-button">PRODUCTOS</button>
          <button className="nav-button">AYUDA</button>
          <button className="nav-button">CONTACTO</button>
          <button className="nav-button">
            <i className="fas fa-shopping-cart"></i>
          </button>
        </div>
      </div>
      <Register
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <Login
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </header>
  );
}

export default Header;