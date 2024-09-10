
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql2';
import bcrypt from 'bcrypt';
// Step 1: Importortar componentes de Mercado Pago
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Step 2: Initcializar con el token
const client = new MercadoPagoConfig({ accessToken: 'APP_USR-1262344036867002-090909-fdf61ec9d47221bc3b5ecb4b20172d9d-1981764003' });

const app = express();
const PORT = process.env.PORT || 4500;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu base de datos está en otro host
  user: 'root', // Usuario de tu base de datos
  password: 'admin', // Contraseña de tu base de datos
  database: 'ozel' // Nombre de tu base de datos
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
    return;
  }
  console.log('API de Pagos Conectado a la base de datos MySQL');
});

//-------------------------------------------------------------------------------------------------------------------
//   Mercado Pago
//-------------------------------------------------------------------------------------------------------------------


app.post("/create_preference", async (req,res) =>{
try{
  const body = {
    items: [
      {
        title: req.body.title,
        quantity: Number(req.body.quantity),
        unit_price: Number(req.body.price),
        currency_id: "ARS",
      },
    ],
    back_urls: { //no se pueden usar localhost para estas urls
      success: "https://www.google.com/search?q=exito",
      failure: "https://www.google.com/search?q=fallo",
      pending: "https://www.google.com/search?q=pendiente", 
    },
    auto_return: "approved", //redireccion en 5 segs
  };




  const preference = new Preference(client);
  const result = await preference.create({ body });
  res.json({
    id: result.id,
  });
}catch (error){
  console.log(error);
  res.status(500).json({
    error: "Error al crear la preferencia."
  });
}
});

//-------------------------------------------------------------------------------------------------------------------
//   Activando puerto
//-------------------------------------------------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`API de pagos escuchando en puerto ${PORT}`);
});