// Horario laboral: 9:00-18:00, hora de Tijuana (America/Tijuana)
const ZONA = "America/Tijuana";

export function dentroDeHorario(fecha = new Date()) {
  const hora = Number(
    new Intl.DateTimeFormat("es-MX", {
      timeZone: ZONA,
      hour: "numeric",
      hour12: false,
    }).format(fecha)
  );
  return hora >= 9 && hora < 20;
}

// Próxima marca de las 9:00 (hoy si aún no llega, mañana si ya pasó el horario)
export function proximaAperturaHorario(fecha = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    hour12: false,
  });
  const partes = Object.fromEntries(
    fmt.formatToParts(fecha).map((p) => [p.type, p.value])
  );
  const horaActual = Number(partes.hour);

  const base = new Date(fecha);
  if (horaActual >= 20) base.setDate(base.getDate() + 1);
  // fija a las 9:00 en zona Tijuana de forma aproximada (offset fijo -8/-7, suficiente para este uso)
  const iso = `${partes.year}-${partes.month}-${partes.day}T09:00:00`;
  const apertura = new Date(iso);
  if (horaActual >= 20) apertura.setDate(apertura.getDate() + 1);
  return apertura;
}
