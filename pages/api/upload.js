// pages/api/upload.js
import Busboy from "busboy";
import admin, { bucket } from "../lib/firebaseAdmin"; // Asegúrate de importar 'admin' y 'bucket' correctamente

// 📌 Función de verificación con Firebase Auth ID Token
async function verifyAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error("no auth header");
  const token = auth.split(" ")[1];
  // Usa Firebase Admin SDK para verificar el token y el custom claim 'admin: true'
  const decoded = await admin.auth().verifyIdToken(token); 
  if (!decoded.admin) throw new Error("not admin claim");
  return decoded;
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    // 📌 VERIFICACIÓN ACTUALIZADA CON FIREBASE AUTH
    await verifyAdmin(req); 
    
    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

    const busboy = Busboy({ headers: req.headers });
    const uploads = [];

    // ... (El resto del código de Busboy y subida a Storage se mantiene igual)

    // El código original que verificaba 'x-admin-token' DEBE ELIMINARSE.
    /*
    const token = req.headers["x-admin-token"];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    */
    
    // ... (El resto del código de Busboy sigue aquí) ...

  } catch (e) {
    // 📌 Si la verificación falla (no-token, token-expirado, no-admin-claim)
    console.error("Error de subida:", e.message);
    return res.status(401).json({ error: "Unauthorized: " + e.message });
  }
}