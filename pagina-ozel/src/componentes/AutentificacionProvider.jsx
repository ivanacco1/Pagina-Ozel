import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AutentificacionProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const usuarioAlmacenado = localStorage.getItem('usuario');
    const mantenerSesion = localStorage.getItem('mantenerSesion');

    if (usuarioAlmacenado && mantenerSesion === 'true') {
      setUsuario(JSON.parse(usuarioAlmacenado));
    }
  }, []);

  const login = (userData, mantenerSesion) => {
    setUsuario(userData);
    if (mantenerSesion) {
      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('mantenerSesion', 'true');
    } else {
      localStorage.removeItem('usuario');
      localStorage.removeItem('mantenerSesion');
    }
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('mantenerSesion');
    navigate('/'); // Redirige a la página de inicio al cerrar sesión
  };

  const actualizarUsuario = (updatedUserData) => {
    setUsuario(updatedUserData);
    const mantenerSesion = localStorage.getItem('mantenerSesion');
    if (mantenerSesion === 'true') {
      localStorage.setItem('usuario', JSON.stringify(updatedUserData));
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};