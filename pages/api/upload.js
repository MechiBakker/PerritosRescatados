// pages/api/upload.js
import Busboy from "busboy";
import { bucket } from "../../firebase/admin";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  try {
    // Only admin can upload via this endpoint (header)
    const token = req.headers["x-admin-token"];
    if (!token || token !== process.env.ADMIN_TOKEN) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

    const busboy = Busboy({ headers: req.headers });
    const uploads = [];

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const filepath = `uploads/${Date.now()}_${filename.replace(/\s+/g, "_")}`;
      const fileRef = bucket.file(filepath);
      const stream = fileRef.createWriteStream({
        metadata: { contentType: mimetype },
      });

      file.pipe(stream);

      const p = new Promise((resolve, reject) => {
        stream.on("finish", async () => {
          try {
            // Make public
            await fileRef.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${encodeURIComponent(filepath)}`;
            resolve(publicUrl);
          } catch (err) {
            reject(err);
          }
        });
        stream.on("error", reject);
      });

      uploads.push(p);
    });

    busboy.on("finish", async () => {
      try {
        const urls = await Promise.all(uploads);
        res.status(200).json({ urls });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: "upload_failed" });
      }
    });

    req.pipe(busboy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}
