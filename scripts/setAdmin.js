import admin from "../lib/firebaseAdmin.js";

const email = "mechibakker@gmail.com";

const token = await res.user.getIdTokenResult(true);

console.log("CLAIMS:", token.claims);

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(email);

    await admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    });

    console.log("✅ ADMIN LISTO:", email);
  } catch (error) {
    console.error("❌ Error asignando admin:", error);
  }
})();