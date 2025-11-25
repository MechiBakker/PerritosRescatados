// pages/api/stats.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // Validación de variables de entorno
    const { GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEETS_ID } = process.env;

    if (!GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_ID) {
      console.error("❌ Faltan variables de entorno para Google Sheets");
      return res.status(500).json({ error: "Faltan variables de entorno para Google Sheets" });
    }

    // Reparar saltos de línea en la clave privada
    const privateKey = GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");

    // Autenticación con cuenta de servicio
    const auth = new google.auth.JWT(
      GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    // Google Sheets API
    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = GOOGLE_SHEETS_ID;
    const range = "Metrics!A1:B20";

    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });

    const rows = resp.data.values || [];

    // Transformar filas a objeto
    const output = {};
    rows.forEach((r) => {
      const key = r[0];
      const value = r[1] ?? "";

      if (key && typeof key === "string") {
        output[key] = value;
      }
    });

    return res.status(200).json(output);

  } catch (err) {
    console.error("❌ Error al acceder a Google Sheets:", err);
    return res.status(500).json({
      error: "Error interno al cargar estadísticas",
      detail: err.message
    });
  }
}
