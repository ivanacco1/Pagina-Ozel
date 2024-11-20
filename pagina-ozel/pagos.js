
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import db from './db.js';

// Importar componentes de Mercado Pago
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Initcializar con el token de Mercado Pago
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1262344036867002-090909-fdf61ec9d47221bc3b5ecb4b20172d9d-1981764003' });

const app = express();
const PORT = process.env.PORT || 4500;

app.use(cors());
app.use(bodyParser.json());

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos de pagos exitosa');
});

//-------------------------------------------------------------------------------------------------------------------
//   Mercado Pago
//-------------------------------------------------------------------------------------------------------------------


app.post("/create_preference", async (req, res) => {
  try {
    // Crear una lista de items que corresponde a los productos del carrito
    const items = req.body.items.map((item) => ({
      title: item.title,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: "ARS",
    }));

    const preferenceData = {
      items: items,  // Lista de productos del carrito
      back_urls: {
        success: "https://www.google.com/search?q=exito",
        failure: "https://www.google.com/search?q=fallo",
        pending: "https://www.google.com/search?q=pendiente",
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    res.json({ id: result.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error al crear la preferencia." });
  }
});

//-------------------------------------------------------------------------------------------------------------------
//   Activando puerto
//-------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`API de pagos escuchando en puerto ${PORT}`);
});