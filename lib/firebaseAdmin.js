import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      ...JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY),
      private_key: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY).private_key.replace(/\\n/g, "\n")
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export default admin;
