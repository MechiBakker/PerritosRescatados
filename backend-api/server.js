import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import mercadopago from 'mercadopago';

dotenv.config();
const app = express();
const PORT = 3001; // Elige un puerto diferente al de Strapi (1337)

// Configuración de CORS para permitir la conexión desde tu frontend (Vercel)
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-dominio-en-vercel.vercel.app']
}));
app.use(express.json());

// --- 1. CONFIGURACIÓN DE MERCADO PAGO ---
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

// Endpoint para generar la preferencia de pago
app.post('/api/checkout', async (req, res) => {
  const { items } = req.body; // Esperamos un array de ítems [{ title, quantity, unit_price }]

  const preference = {
    items: items.map(item => ({
      title: item.title,
      unit_price: item.unit_price,
      quantity: item.quantity,
    })),
    // URLs a donde regresará el usuario (IMPORTANTE)
    back_urls: {
      success: "https://tu-dominio.com/tienda/success",
      failure: "https://tu-dominio.com/tienda/failure",
      pending: "https://tu-dominio.com/tienda/pending"
    },
    auto_return: "approved",
    // Configuración para notificaciones (opcional pero recomendado para control de stock)
    notification_url: "https://tu-backend-api.com/api/webhooks/mercadopago" 
  };

  try {
    const response = await mercadopago.preferences.create(preference);
    // Retorna el ID de la preferencia y el enlace de pago
    res.json({ 
      id: response.body.id,
      init_point: response.body.init_point 
    });
  } catch (error) {
    console.error('Error al crear preferencia de Mercado Pago:', error);
    res.status(500).json({ error: 'Error al iniciar el checkout.' });
  }
});


// --- 2. CONFIGURACIÓN DE GOOGLE SHEETS ---
const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_SHEETS_API_KEY });

// Endpoint para obtener las estadísticas
app.get('/api/stats', async (req, res) => {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    // Rango de celdas a leer (Ejemplo: A1:B3 donde A tiene la métrica y B tiene el valor)
    const range = 'Hoja1!A1:B3'; 

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron datos en la hoja de cálculo.' });
    }
    
    // Convertir el array de datos en un objeto legible
    const stats = rows.reduce((acc, row) => {
        // Asumiendo que la columna 0 es el nombre y la columna 1 es el valor
        if (row.length >= 2) { 
            const key = row[0].toLowerCase().replace(/ /g, '_'); // Convertir "Rescatados Mes" a "rescatados_mes"
            acc[key] = parseInt(row[1]) || 0;
        }
        return acc;
    }, {});

    res.json(stats);
  } catch (error) {
    console.error('Error al leer Google Sheet:', error);
    res.status(500).json({ error: 'Error al obtener las estadísticas.' });
  }
});


app.listen(PORT, () => {
  console.log(`API Express corriendo en http://localhost:${PORT}`);
});