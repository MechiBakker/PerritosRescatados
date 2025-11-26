import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

  // Arreglar saltos de línea aunque vengan bien o mal
  serviceAccount.private_key = serviceAccount.private_key
    .replace(/\\n/g, "\n")
    .replace(/\\\\n/g, "\n");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export default admin;
