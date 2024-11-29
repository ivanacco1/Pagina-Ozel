// Navegacion.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AutentificacionProvider';
import Login from './Login';
import Register from './Register';
import { AppBar, Toolbar, Typography, Button, TextField, IconButton, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import '../estilos/Header.css';
import Home from './Home';
import MiCuenta from './MiCuenta';
import CatalogoProductos from './CatalogoProductos';
import DetalleProducto from './DetalleProducto';
import Carrito from './Carrito'; 
import Contacto from './Contacto'; 
import Ayuda from './Ayuda'; 

const Navegacion = () => {
  const { usuario, estado, logout, estadoAdvertencia } = useAuth();
  const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

//console.log(estadoAdvertencia);

  const handleSearch = () => { //funcion de la barra de busqueda
    if (searchTerm.trim()) {
      navigate(`/catalogo?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  return ( //encabezado y enrutamiento de páginas
    <div>
      <div className="header">
        <div className="header-top">
          <Link to="/" className="header-link">
            <img src="/images/logo.png" alt="Logo" className="logo" />
          </Link>
          <div className="header-buttons">
            {usuario && <Typography variant="body1" className="header-greeting">Hola, {usuario.FirstName}</Typography>}
            {usuario && <Button className="header-button" component={Link} to="/mi-cuenta">MI CUENTA</Button>}
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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
          </div>
          <div className="nav-right">
            <Button className="nav-button" component={Link} to="/">INICIO</Button>
            <Button className="nav-button" component={Link} to="/catalogo">PRODUCTOS</Button>
            <Button className="nav-button" component={Link} to="/ayuda">AYUDA</Button>
            <Button className="nav-button" component={Link} to="/contacto">CONTACTO</Button>
            <Button className="nav-button" component={Link} to="/carrito">
              <ShoppingCartIcon />
            </Button>
          </div>
        </div>
      </div>
      {estadoAdvertencia && (
     <div className="advertencia-perfil">
     ⚠️ Algunos datos de tu perfil están incompletos. Por favor, actualízalos en la sección "Mi Cuenta".
   </div>
  )}

      <div style={{ marginTop: '110px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mi-cuenta" element={<MiCuenta />} />
          <Route path="/catalogo" element={<CatalogoProductos />} />
          <Route path="/producto/:id" element={<DetalleProducto />} />
          <Route path="/carrito" element={<Carrito />} /> 
          <Route path="/contacto" element={<Contacto />} /> 
          <Route path="/ayuda" element={<Ayuda />} /> 
        </Routes>
      </div>
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