// pages/api/stats.js

import { google } from "googleapis";

export default async function handler(req, res) {
  // Aseguramos que todas las variables de entorno necesarias existan
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY || !process.env.GOOGLE_SHEETS_ID) {
    console.error("Faltan variables de entorno de Google Sheets.");
    // Devolvemos un error 500 si la configuración es incompleta
    return res.status(500).json({ error: "Configuración de Google Sheets incompleta" });
  }

  // --- CORRECCIÓN CLAVE ---
  // Vercel escapa los saltos de línea (\n) como \\n.
  // Es mejor limpiar la clave privada ANTES de usarla en el constructor JWT.
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");

  try {
    // 1. Autenticación con JWT (Service Account)
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null, // KeyFile (no necesario)
      privateKey, // Usamos la clave limpia
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    // 2. Inicializar Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });
    
    // 3. Obtener Datos
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = "Metrics!A1:B20";
    
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = resp.data.values || [];

    // 4. Transformar los datos a un objeto (clave-valor)
    const out = {};
    rows.forEach((r) => {
      // Aseguramos que la columna A tenga un valor para usarla como clave
      if (r[0]) out[r[0]] = r[1] ?? ""; 
    });

    // 5. Devolver la respuesta exitosa
    res.status(200).json(out);
  } catch (err) {
    // Si la conexión falla (por credenciales o red), devuelve un 500
    console.error("Error al acceder a Google Sheets:", err.message);
    res.status(500).json({ error: "Error interno al cargar estadísticas" });
  }
}