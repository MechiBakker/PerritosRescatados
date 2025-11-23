// pages/api/admin-auth.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "password required" });

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "admin password not configured" });
  }

  if (password === process.env.ADMIN_PASSWORD) {
    // return the admin token that the other endpoints expect (ADMIN_TOKEN)
    return res.status(200).json({ ok: true, adminToken: process.env.ADMIN_TOKEN });
  } else {
    return res.status(401).json({ error: "invalid" });
  }
}
