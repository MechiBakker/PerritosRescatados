import admin from "../lib/firebaseAdmin.js";

async function verifyAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error("no auth header");

  const token = auth.split(" ")[1];
  if (!token) throw new Error("invalid token");

  const decoded = await admin.auth().verifyIdToken(token);

  if (!decoded.admin) throw new Error("not admin");

  return decoded;
}

export default async function handler(req, res) {
  try {
    const db = admin.firestore();

    // GET — listar productos
    if (req.method === "GET") {
      const snap = await db.collection("products").orderBy("createdAt", "desc").get();
      const products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.status(200).json(products);
    }

    // POST — agregar producto
    if (req.method === "POST") {
      await verifyAdmin(req);

      const data = req.body;
      if (!data.name || !data.desc || !data.price || !data.stock || !data.photoURL) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const doc = await db.collection("products").add({
        name: data.name,
        desc: data.desc,
        price: Number(data.price),
        stock: Number(data.stock),
        photoURL: data.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({ id: doc.id });
    }

    // DELETE — eliminar producto
    if (req.method === "DELETE") {
      await verifyAdmin(req);

      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Missing ID" });

      await db.collection("products").doc(id).delete();
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method Not Allowed" });

  } catch (e) {
    console.error("API /products error:", e);
    return res.status(500).json({ error: e.message });
  }
}
