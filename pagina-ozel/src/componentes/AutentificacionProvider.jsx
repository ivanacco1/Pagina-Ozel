import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const verificarCamposRequeridos = (userData) => { //verifica si el usuario tiene direccion guardada
  const { City, Address, PostalCode, Provincia } = userData || {};
  return [City, Address, PostalCode, Provincia].some(
    (campo) => !campo || campo.trim() === ''
  );
};

export const AutentificacionProvider = ({ children }) => {
  const [estadoAdvertencia, setEstadoAdvertencia] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const usuarioAlmacenado = localStorage.getItem('usuario');
    const mantenerSesion = localStorage.getItem('mantenerSesion');
    //const camposGuardados = localStorage.getItem('camposIncompletos') === 'true';

    if (usuarioAlmacenado && mantenerSesion === 'true') {
      setUsuario(JSON.parse(usuarioAlmacenado));
      setEstadoAdvertencia(verificarCamposRequeridos(usuario));
    }
  }, []);

/*
  const verificarCamposRequeridos = (userData) => { //verifica si el usuario tiene direccion guardada
    const { City, Address, PostalCode, Provincia } = userData || {};
    const camposFaltantes = [City, Address, PostalCode, Provincia].some(
      (campo) => !campo || campo.trim() === ''
    );
    setEstadoAdvertencia(camposFaltantes);
    //console.log(estadoAdvertencia);
  };*/

  const login = (userData, mantenerSesion) => {
    setUsuario(userData);
    setEstadoAdvertencia(verificarCamposRequeridos(userData));

    if (mantenerSesion) {
      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('mantenerSesion', 'true');
      //localStorage.setItem('camposIncompletos', camposVacíos); // Guarda la bandera en localStorage
    } else {
      localStorage.removeItem('usuario');
      localStorage.removeItem('mantenerSesion');
    }
  };

  const logout = () => {
    setUsuario(null);
    setEstadoAdvertencia(false);
    localStorage.removeItem('usuario');
    localStorage.removeItem('mantenerSesion');
    localStorage.removeItem('camposIncompletos');
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
    <AuthContext.Provider value={{ usuario, login, logout, actualizarUsuario, estadoAdvertencia,
      setEstadoAdvertencia  }}>
      {children}
    </AuthContext.Provider>
  );
};