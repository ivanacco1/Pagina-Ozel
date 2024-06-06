import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AutentificacionProvider } from './componentes/AutentificacionProvider';
import Navegacion from './componentes/Navegacion';
import { ThemeProvider, createTheme } from '@mui/material/styles';


const theme = createTheme({
  typography: {
    fontFamily: [
      'Josefin Sans',
      'Arial', // Fallback en caso de que 'Josefin Sans' no esté disponible
      'sans-serif',
    ].join(','),
  },
});


function App() {
  return (
    <ThemeProvider theme={theme}>
    <AutentificacionProvider>
      <Router>
        <Navegacion />
      </Router>
    </AutentificacionProvider>
    </ThemeProvider>
  );
}

export default App;