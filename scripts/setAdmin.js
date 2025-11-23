import admin from "../lib/firebaseAdmin.js";

const email = "admin@tuperrito.com";

(async () => {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log("ADMIN LISTO:", email);
})();
