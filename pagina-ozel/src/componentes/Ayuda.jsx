// Ayuda.jsx
import React from 'react';
import { Box, Typography, Container, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const preguntasFrecuentes = [
  {
    pregunta: '¿Cómo puedo crear una cuenta?',
    respuesta: 'Para crear una cuenta, simplemente haz clic en el botón "Crear Cuenta" en la parte superior derecha de la página e ingresa tus datos.',
  },
  {
    pregunta: '¿Cómo puedo recuperar mi contraseña?',
    respuesta: 'Si has olvidado tu contraseña, dirígete a la página de inicio de sesión y selecciona la opción "¿Olvidaste tu contraseña?". Te enviaremos un enlace para restablecerla.',
  },
  {
    pregunta: '¿Cuáles son los métodos de pago disponibles?',
    respuesta: 'Aceptamos pagos con tarjeta de crédito, débito, y mediante Mercado Pago. También puedes pagar a través de transferencia bancaria o con dinero en efectivo en algunos puntos de pago autorizados.',
  },
  {
    pregunta: '¿Cómo puedo rastrear mi pedido?',
    respuesta: 'Una vez que tu pedido haya sido enviado, recibirás un correo electrónico con un número de seguimiento para que puedas rastrear tu pedido en tiempo real.',
  },
  {
    pregunta: '¿Qué debo hacer si tengo problemas con mi pedido?',
    respuesta: 'Si tienes algún problema con tu pedido, contáctanos a través de nuestro número de WhatsApp o por correo electrónico y estaremos encantados de ayudarte.',
  },
];

const Ayuda = () => {
  return (
    <Container maxWidth="md" sx={{ marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom align="center">
        Preguntas Frecuentes
      </Typography>
      <Box sx={{ marginTop: '20px' }}>
        {preguntasFrecuentes.map((faq, index) => (
          <Accordion 
            key={index} 
            defaultExpanded 
            sx={{ marginBottom: index === preguntasFrecuentes.length - 1 ? '40px' : '10px' }} // Espacio extra en el último
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {faq.pregunta}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2">{faq.respuesta}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      <Box sx={{ marginTop: '20px' }}></Box>
    </Container>
  );
};

export default Ayuda;