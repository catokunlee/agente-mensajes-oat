import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARCHIVO = path.join(__dirname, "conversaciones.json");

function cargar() {
  if (!fs.existsSync(ARCHIVO)) return {};
  try {
    return JSON.parse(fs.readFileSync(ARCHIVO, "utf-8"));
  } catch {
    return {};
  }
}

function guardar(estado) {
  fs.writeFileSync(ARCHIVO, JSON.stringify(estado, null, 2));
}

// clave = `${canal}:${psid}` ej "messenger:1234" o "instagram:5678"
export function obtenerConversacion(canal, id) {
  const estado = cargar();
  const clave = `${canal}:${id}`;
  return estado[clave] || null;
}

export function actualizarConversacion(canal, id, cambios) {
  const estado = cargar();
  const clave = `${canal}:${id}`;
  estado[clave] = { ...(estado[clave] || {}), ...cambios };
  guardar(estado);
  return estado[clave];
}

export function todasLasConversaciones() {
  return cargar();
}
