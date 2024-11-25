// Contacto.jsx
import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

const Contacto = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: '50px' }}>
      <Box sx={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom>
          Contáctanos
        </Typography>
        <Typography variant="body1" paragraph>
          Si tienes alguna duda o necesitas asistencia con nuestros productos, no dudes en ponerte en contacto con nosotros.
        </Typography>
        <Typography variant="body1" paragraph>
          Estamos disponibles para atender cualquier consulta o problema que puedas tener.
        </Typography>
        <Typography variant="h6" gutterBottom>
          Comunícate con nosotros a través de WhatsApp:
        </Typography>
        <Button
          variant="contained"
          color="success"
          href="https://wa.me/+123456789" // Numero de Whatsapp ficticio
          startIcon={<WhatsAppIcon />}
          sx={{ marginTop: '20px' }}
        >
          +123 456 789
        </Button>
      </Box>
    </Container>
  );
};

export default Contacto;