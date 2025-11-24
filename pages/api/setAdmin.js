import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

initializeApp({
  credential: cert(serviceAccount)
});

const uid = "ubc3pqFHRschGUWEPjK03fpacx83";

getAuth().setCustomUserClaims(uid, { admin: true })
  .then(() => console.log("Administrador asignado"))
  .catch(console.error);
