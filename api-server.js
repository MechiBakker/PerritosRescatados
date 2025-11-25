import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Ruta absoluta a la carpeta api
const apiDir = path.join(__dirname, "api");

// Cargar dinámicamente todos los archivos .js dentro de /api
fs.readdirSync(apiDir).forEach((file) => {
  if (file.endsWith(".js")) {
    const route = `/api/${file.replace(".js", "")}`;
    const handler = (await import(path.join(apiDir, file))).default;

    app.all(route, (req, res) => handler(req, res));
    console.log("API cargada:", route);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
