import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './Header';
import Register from './Register';
import Login from './Login';

function App() {
  return (
    <Router>
      <Header />
      <Container maxWidth="md" style={{ marginTop: '2rem' }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;