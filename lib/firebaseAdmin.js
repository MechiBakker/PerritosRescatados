import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!json) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT no está definida.");
    }

    const serviceAccount = JSON.parse(json);

    // Corrige los saltos de línea de la private key escapados
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

  } catch (error) {
    console.error("Error al inicializar Firebase Admin:", error);
    throw error;
  }
}

export default admin;
