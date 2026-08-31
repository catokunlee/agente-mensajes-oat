import "dotenv/config";
import express from "express";
import { obtenerConversacion, actualizarConversacion } from "./estado.js";
import { generarRespuesta } from "./respuestas.js";
import { enviarMensaje } from "./meta.js";
import { iniciarProgramador } from "./programador.js";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN_OAT || "oat-verify-2026";

// Verificación del webhook (Meta la llama una vez al configurar)
app.get("/webhook", (req, res) => {
  const modo = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const desafio = req.query["hub.challenge"];

  if (modo === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(desafio);
  }
  return res.sendStatus(403);
});

// Mensajes entrantes de Messenger e Instagram DM (mismo formato de payload)
app.post("/webhook", async (req, res) => {
  res.sendStatus(200); // responder rápido, procesar después

  const cuerpo = req.body;
  if (!cuerpo.entry) return;

  for (const entrada of cuerpo.entry) {
    const canal = cuerpo.object === "instagram" ? "instagram" : "messenger";
    const eventos = entrada.messaging || [];

    for (const evento of eventos) {
      const remitenteId = evento.sender?.id;
      const texto = evento.message?.text;
      if (!remitenteId || !texto) continue;
      if (evento.message?.is_echo) continue; // ignorar mensajes que mandó la propia página

      await procesarMensaje(canal, remitenteId, texto);
    }
  }
});

async function procesarMensaje(canal, id, texto) {
  const conv = obtenerConversacion(canal, id) || { historial: [] };

  const respuesta = await generarRespuesta(texto, conv.historial);

  await enviarMensaje(id, respuesta);

  const historialNuevo = [
    ...conv.historial,
    { rol: "user", texto },
    { rol: "assistant", texto: respuesta },
  ].slice(-20); // conservar solo los últimos 20 turnos

  actualizarConversacion(canal, id, {
    historial: historialNuevo,
    ultimoMensajeUsuario: Date.now(),
    seguimientoEnviado: null,
    flyerEnviado: null,
    detenido: false,
  });
}

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`[agente-mensajes-oat] escuchando en puerto ${PUERTO}`);
  iniciarProgramador();
});
