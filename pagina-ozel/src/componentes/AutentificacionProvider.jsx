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
    const advertenciaGuardada = localStorage.getItem('camposIncompletos') === 'true';
  
    if (usuarioAlmacenado && mantenerSesion === 'true') {
      const usuarioData = JSON.parse(usuarioAlmacenado);
      setUsuario(usuarioData);
  
      // Calcular estadoAdvertencia basado en usuario recuperado
      const advertencia = verificarCamposRequeridos(usuarioData);
      setEstadoAdvertencia(advertencia);
  
      // Opcionalmente, sincronizar advertencia guardada (si es necesario)
      if (advertencia !== advertenciaGuardada) {
        localStorage.setItem('camposIncompletos', advertencia);
      }
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
    const advertencia = verificarCamposRequeridos(userData);
    setUsuario(userData);
    setEstadoAdvertencia(advertencia);
  
    if (mantenerSesion) {
      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('mantenerSesion', 'true');
      localStorage.setItem('camposIncompletos', advertencia); // Guarda la bandera actualizada
    } else {
      localStorage.removeItem('usuario');
      localStorage.removeItem('mantenerSesion');
      localStorage.removeItem('camposIncompletos');
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
    const advertencia = verificarCamposRequeridos(updatedUserData);
    setUsuario(updatedUserData);
    setEstadoAdvertencia(advertencia);
  
    const mantenerSesion = localStorage.getItem('mantenerSesion');
    if (mantenerSesion === 'true') {
      localStorage.setItem('usuario', JSON.stringify(updatedUserData));
      localStorage.setItem('camposIncompletos', advertencia);
    }
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarUsuario, estadoAdvertencia,
      setEstadoAdvertencia  }}>
      {children}
    </AuthContext.Provider>
  );
};