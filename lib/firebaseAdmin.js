import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    // Simplificamos la corrección de saltos de línea
    // Reemplaza el doble escape (\\n) que Vercel a veces añade al JSON de claves
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    // Si el JSON.parse falla o si falta la variable, este error se registra
    console.error("Error al inicializar Firebase Admin:", error.message);
    // Devolvemos un error, aunque en un entorno real esto puede ser problemático
    // throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY inválida o faltante."); 
  }
}

export default admin;