import React, { useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './AutentificacionProvider';
import Login from './Login';
import Register from './Register';
import { AppBar, Toolbar, Typography, Button, TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './Header.css';
import Home from './Home';

const Navegacion = () => {
  const { usuario, estado, logout } = useAuth();
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="header">
      <div className="header-top">
        <Link to="/" className="header-link">
          <img src="/images/logo.png" alt="Logo" className="logo" />
        </Link>
        <div className="header-buttons">
          {usuario && <Button className="header-button">MI CUENTA</Button>}
          {!usuario && <Button className="header-button" onClick={() => setRegisterModalOpen(true)}>CREAR CUENTA</Button>}
          <span className="separator">|</span>
          {!usuario && <Button className="header-button" onClick={() => setLoginModalOpen(true)}>INICIAR SESION</Button>}
          {usuario && <Button className="header-button" onClick={logout}>CERRAR SESION</Button>}
        </div>
      </div>
      <div className="header-bottom">
        <div className="nav-left">
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            size="small"
            className="search-bar"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </div>
        <div className="nav-right">
          <Button className="nav-button" component={Link} to="/">INICIO</Button>
          <Button className="nav-button">PRODUCTOS</Button>
          <Button className="nav-button">AYUDA</Button>
          <Button className="nav-button">CONTACTO</Button>
          <Button className="nav-button">
            <i className="fas fa-shopping-cart"></i>
          </Button>
        </div>
      </div>
      <Routes>
      <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={estado === 'logueado' ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={estado === 'logueado' ? <Navigate to="/" /> : <Register />}
        />
      </Routes>
      <Register
        isOpen={isRegisterModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
      <Login
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default Navegacion;