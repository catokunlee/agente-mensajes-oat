const TOKEN = process.env.META_PAGE_TOKEN_OAT;
const GRAPH = "https://graph.facebook.com/v21.0";

// Mismo endpoint sirve Messenger e Instagram DM (Send API), cambia solo el token/página de origen.
export async function enviarMensaje(destinatarioId, texto) {
  const res = await fetch(`${GRAPH}/me/messages?access_token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: destinatarioId },
      message: { text: texto },
      messaging_type: "RESPONSE",
    }),
  });
  const data = await res.json();
  if (data.error) {
    console.error("[meta] error enviando mensaje:", data.error);
  }
  return data;
}

export async function enviarImagen(destinatarioId, urlImagen) {
  const res = await fetch(`${GRAPH}/me/messages?access_token=${TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: destinatarioId },
      message: {
        attachment: {
          type: "image",
          payload: { url: urlImagen, is_reusable: true },
        },
      },
      messaging_type: "RESPONSE",
    }),
  });
  const data = await res.json();
  if (data.error) {
    console.error("[meta] error enviando imagen:", data.error);
  }
  return data;
}
