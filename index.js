import "dotenv/config";
import express from "express";
import { obtenerConversacion, actualizarConversacion } from "./estado.js";
import { generarRespuesta } from "./respuestas.js";
import { enviarMensaje } from "./meta.js";
import { iniciarProgramador } from "./programador.js";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN_OAT || "oat-verify-2026";
const PAUSA_HORAS = 24; // si Abraham contesta a mano, el bot se calla esta conversación este tiempo

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
      const texto = evento.message?.text;
      if (!texto) continue;

      if (evento.message?.is_echo) {
        // Mensaje que salió de la página. Si NO trae app_id, no lo mandó el bot (sale
        // vía API con app_id) — lo mandó un humano a mano desde el inbox. Pausar ahí.
        if (!evento.message.app_id) {
          const clienteId = evento.recipient?.id;
          if (clienteId) pausarPorHumano(canal, clienteId);
        }
        continue;
      }

      const remitenteId = evento.sender?.id;
      if (!remitenteId) continue;

      await procesarMensaje(canal, remitenteId, texto);
    }
  }
});

function pausarPorHumano(canal, id) {
  actualizarConversacion(canal, id, {
    pausadoHasta: Date.now() + PAUSA_HORAS * 60 * 60 * 1000,
  });
  console.log(`[index] ${canal}:${id} pausado — Abraham ya está contestando a mano`);
}

async function procesarMensaje(canal, id, texto) {
  const conv = obtenerConversacion(canal, id) || { historial: [] };

  if (conv.pausadoHasta && conv.pausadoHasta > Date.now()) {
    console.log(`[index] ${canal}:${id} sigue pausado (Abraham contestando a mano), bot no responde`);
    return;
  }

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
