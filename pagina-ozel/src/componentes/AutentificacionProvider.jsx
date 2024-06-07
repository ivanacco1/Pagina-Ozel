import React, { createContext, useState, useContext, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Proveedor del contexto de autenticación
const AutentificacionProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState('deslogueado');

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
      setEstado('logueado');
    }
  }, []);

  const login = (usuario) => {
    setUsuario(usuario);
    setEstado('logueado');
  };

  const logout = () => {
    setUsuario(null);
    setEstado('deslogueado');
    localStorage.removeItem('usuario');
  };

  return (
    <AuthContext.Provider value={{ usuario, estado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AutentificacionProvider, useAuth };