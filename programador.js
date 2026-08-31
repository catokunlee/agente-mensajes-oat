import { todasLasConversaciones, actualizarConversacion } from "./estado.js";
import { dentroDeHorario } from "./horario.js";
import { enviarMensaje, enviarImagen } from "./meta.js";

const MIN = 60 * 1000;
const ESPERA_SEGUIMIENTO = 15 * MIN; // desde el último mensaje del prospecto
const ESPERA_FLYER = 45 * MIN;

const URL_FLYER =
  "https://drive.google.com/uc?export=view&id=1dd1XyxarQYTqhzVFF5uPSGVD7fuW2Cs-";

const TEXTO_SEGUIMIENTO = "¿Te quedó alguna duda sobre el servicio? Con gusto te ayudo.";

export function iniciarProgramador() {
  setInterval(revisarPendientes, MIN);
  console.log("[programador] corriendo, revisa cada 1 min");
}

async function revisarPendientes() {
  if (!dentroDeHorario()) return; // fuera de 9:00-18:00, no se inicia nada

  const conversaciones = todasLasConversaciones();
  const ahora = Date.now();

  for (const [clave, conv] of Object.entries(conversaciones)) {
    if (conv.detenido) continue;
    if (!conv.ultimoMensajeUsuario) continue;

    const [canal, id] = clave.split(":");
    const transcurrido = ahora - conv.ultimoMensajeUsuario;

    if (!conv.seguimientoEnviado && transcurrido >= ESPERA_SEGUIMIENTO) {
      await enviarMensaje(id, TEXTO_SEGUIMIENTO);
      actualizarConversacion(canal, id, { seguimientoEnviado: ahora });
      console.log(`[programador] seguimiento enviado a ${clave}`);
      continue;
    }

    if (
      conv.seguimientoEnviado &&
      !conv.flyerEnviado &&
      transcurrido >= ESPERA_FLYER
    ) {
      await enviarImagen(id, URL_FLYER);
      actualizarConversacion(canal, id, { flyerEnviado: ahora, detenido: true });
      console.log(`[programador] flyer enviado a ${clave}, conversación cerrada`);
    }
  }
}
