import admin from "../../lib/firebaseAdmin.js";

import MercadoPago from "mercadopago";

import MercadoPago from "mercadopago";

const mp = new MercadoPago.MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method Not Allowed" });

  const db = admin.firestore();

  try {
    const { productId, quantity } = req.body;

    const prodRef = db.collection("products").doc(productId);
    const prodSnap = await prodRef.get();

    if (!prodSnap.exists)
      return res.status(404).json({ error: "Producto no encontrado" });

    const p = prodSnap.data();

    if (p.stock < quantity)
      return res.status(400).json({ error: "Sin stock suficiente" });

    const orderRef = await db.collection("orders").add({
      productId,
      quantity,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const preference = await mp.preference.create({
      body: {
        items: [
          {
            title: p.name,
            quantity,
            currency_id: "ARS",
            unit_price: p.price
          }
        ],
        back_urls: {
          success: process.env.MP_SUCCESS_URL,
          failure: process.env.MP_FAILURE_URL,
          pending: process.env.MP_PENDING_URL
        },
        notification_url: process.env.MP_WEBHOOK_URL,
        external_reference: orderRef.id
      }
    });

    return res.status(200).json({
      init_point: preference.init_point
    });
  } catch (e) {
    console.error("MP error:", e);
    return res.status(500).json({ error: e.message });
  }
}
