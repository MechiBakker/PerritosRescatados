import admin from "firebase-admin";

let app;

if (!admin.apps.length) {
  try {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!json) {
      throw new Error("❌ FIREBASE_SERVICE_ACCOUNT no está definida en Vercel");
    }

    let serviceAccount = JSON.parse(json);

    // Fix para llaves escapadas
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    // Inicializa Firebase Admin correctamente usando el JSON entero
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log("✅ Firebase Admin inicializado correctamente");

  } catch (err) {
    console.error("❌ Error al inicializar Firebase Admin:", err);
    throw err;
  }
} else {
  app = admin.app();
}

export default admin;
