import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AutentificacionProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [estado, setEstado] = useState('idle');

  const login = (userData) => {
    setUsuario(userData);
    //console.log("login",userData);
    localStorage.setItem('usuario', JSON.stringify(userData));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  const actualizarUsuario = (updatedUserData) => {
    setUsuario(updatedUserData);
    localStorage.setItem('usuario', JSON.stringify(updatedUserData));
  };

  return (
    <AuthContext.Provider value={{ usuario, estado, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};

//const useAuth = () => useContext(AuthContext);

//export { AutentificacionProvider, useAuth };