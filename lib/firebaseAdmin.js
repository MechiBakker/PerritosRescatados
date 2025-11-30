import admin from "firebase-admin";

if (!admin.apps.length) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!json) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT no está definida en Vercel.");
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(json);

    // Vercel a veces escapa los saltos de línea del private_key:
    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    }

  } catch (err) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT tiene un formato inválido: " + err.message);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export default admin;
