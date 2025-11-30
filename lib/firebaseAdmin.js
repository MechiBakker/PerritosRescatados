import admin from "firebase-admin";



let app;

if (!admin.apps.length) {
  try {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!json) {
      throw new Error("❌ FIREBASE_SERVICE_ACCOUNT no está definida en Vercel");
    }

    let serviceAccount = JSON.parse(json);

    // Fix para llaves escapadas en Vercel
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

    // Inicializa Firebase Admin
    app = admin.initializeApp({
      credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    })
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
