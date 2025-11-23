import admin from "@/lib/firebaseAdmin";

async function verifyAdmin(req) {
  const auth = req.headers.authorization;
  if (!auth) throw new Error("no auth");
  const token = auth.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(token);
  if (!decoded.admin) throw new Error("not admin");
  return decoded;
}

export default async function handler(req, res) {
  const db = admin.firestore();

  // GET — obtener rescatados
  if (req.method === "GET") {
    const snap = await db.collection("pets").orderBy("createdAt", "desc").get();
    const pets = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json(pets);
  }

  // POST — crear nuevo rescatado
  if (req.method === "POST") {
    try {
      await verifyAdmin(req);
      const data = req.body;

      const doc = await db.collection("pets").add({
        name: data.name,
        desc: data.desc,
        photoURL: data.photoURL,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return res.status(201).json({ id: doc.id });
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  }

  // DELETE — eliminar
  if (req.method === "DELETE") {
    try {
      await verifyAdmin(req);
      const { id } = req.query;
      await db.collection("pets").doc(id).delete();
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(401).json({ error: e.message });
    }
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
