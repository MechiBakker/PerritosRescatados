import admin from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  const db = admin.firestore();

  try {
    const data = req.body;

    if (data.type !== "payment") {
      return res.status(200).json({ received: true });
    }

    const payment = data.data;
    const mpId = payment.id;

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${mpId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });

    const payInfo = await response.json();

    const orderId = payInfo.external_reference;
    if (!orderId) return res.status(200).json({ ok: true });

    if (payInfo.status === "approved") {
      const orderRef = db.collection("orders").doc(orderId);
      const snap = await orderRef.get();
      if (!snap.exists) return res.status(200).json({ ok: true });

      const ord = snap.data();

      // descontar stock en transacción
      const prodRef = db.collection("products").doc(ord.productId);

      await db.runTransaction(async (t) => {
        const prodSnap = await t.get(prodRef);
        const p = prodSnap.data();
        t.update(prodRef, { stock: p.stock - ord.quantity });
        t.update(orderRef, { status: "approved" });
      });
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error("WEBHOOK ERROR", e);
    res.status(500).json({ error: e.message });
  }
}
