import admin from "../lib/firebaseAdmin.js";

export default async function handler(req, res) {
  try {
    const db = admin.firestore();

    if (req.method === "GET") {
      const snap = await db.collection("products").orderBy("createdAt", "desc").get();
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(items);
    }

    if (req.method === "POST") {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Missing token" });

      const decoded = await admin.auth().verifyIdToken(token);
      if (!decoded.admin) return res.status(403).json({ error: "Not admin" });

      const data = req.body;
      const doc = await db.collection("products").add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: doc.id });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (e) {
    console.error("/api/products ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}
