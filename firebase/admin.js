// firebase/admin.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VERCEL_FIREBASE_PROJECT_ID,
      clientEmail: process.env.VERCEL_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.VERCEL_FIREBASE_PRIVATE_KEY
        ? process.env.VERCEL_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
    }),
    storageBucket: process.env.VERCEL_FIREBASE_STORAGE_BUCKET,
  });
}

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
export { admin };
