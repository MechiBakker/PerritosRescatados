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
      const snap = await db.collection("products").orderBy("createdAt", "desc").get();
      const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      await verifyAdmin(req);

      const data = req.body;
      if (!data.name || !data.photoURL || !data.price || !data.stock) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const doc = await db.collection("products").add({
        name: data.name,
        photoURL: data.photoURL,
        price: data.price,
        stock: data.stock,
        desc: data.desc || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return res.status(201).json({ id: doc.id });
    }

    if (req.method === "DELETE") {
      await verifyAdmin(req);

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });

      await db.collection("products").doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (e) {
    console.error("API /products ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}
