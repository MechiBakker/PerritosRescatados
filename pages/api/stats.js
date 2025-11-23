// pages/api/stats.js
import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY
        ? process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    const range = "Metrics!A1:B20";
    const resp = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = resp.data.values || [];

    const out = {};
    rows.forEach((r) => {
      if (r[0]) out[r[0]] = r[1] ?? "";
    });

    res.status(200).json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}
