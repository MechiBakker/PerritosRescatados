import admin from "../../lib/firebaseAdmin";

async function verifyAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error("No auth header");

  const token = auth.split(" ")[1];
  if (!token) throw new Error("Invalid token format");

  const decoded = await admin.auth().verifyIdToken(token);
  if (!decoded.admin) throw new Error("Not admin");

  return decoded;
}

export default async function handler(req, res) {
  try {
    const db = admin.firestore();

    if (req.method === "GET") {
      const snap = await db.collection("stats").orderBy("createdAt", "desc").get();
      const stats = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(stats);
    }

    if (req.method === "POST") {
      await verifyAdmin(req);

      const data = req.body;
      const doc = await db.collection("stats").add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: doc.id });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (e) {
    console.error("API /stats ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}
