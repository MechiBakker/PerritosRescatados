import * as admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.VITE_FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      ...serviceAccount,
      private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  });
}

export default admin;
