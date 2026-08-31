# Agente Mensajes OAT — Messenger + Instagram DM

Bot que contesta automático los mensajes de Facebook Messenger e Instagram DM de la campaña
"Agente Creador de Websites" (Operations AI Tools).

## Flujo

1. Prospecto escribe → contesta al instante (Claude, con precio/servicio ya cargado).
2. Silencio del prospecto → a los 15 min: 1 mensaje de seguimiento ("¿te quedó alguna duda?").
3. Sigue sin contestar → a los 45 min: se manda el flyer, y se detiene. No más mensajes.
4. Los mensajes que INICIA el bot (seguimiento/flyer) solo salen 9:00–20:00 hora Tijuana. Fuera de
   ese horario se esperan hasta las 9:00 del día siguiente. Las respuestas a algo que el prospecto
   SÍ escribió salen siempre, a cualquier hora.

## Variables de entorno necesarias (`.env`, mismas que ya existen en `Codigo-HQ/.env`)

```
META_PAGE_TOKEN_OAT=
ANTHROPIC_API_KEY=
META_WEBHOOK_VERIFY_TOKEN_OAT=   (inventa una palabra, la usas también en el paso 3 de abajo)
```

## Pendiente antes de encender

1. **`programador.js` línea `URL_FLYER`**: reemplazar `REEMPLAZAR_CON_ID_DEL_FLYER` por el link
   público del flyer (`flyer-promo-websites-v2.png` o cualquiera de `Ronda 2 - Profesional Adulto`)
   subido a Drive con permiso "cualquiera con el link puede ver".
2. **Desplegar en Render** (mismo patrón que los otros agentes de voz): subir esta carpeta, activar
   variables de entorno de arriba.
3. **Configurar el webhook en Meta for Developers** (app de OAT, la misma ya conectada):
   - URL: `https://<tu-app-en-render>.onrender.com/webhook`
   - Verify token: el mismo valor de `META_WEBHOOK_VERIFY_TOKEN_OAT`
   - Suscribirse a: `messages` (Messenger) y `messages` (Instagram) en la página/cuenta de OAT.

## Correr local

```
npm install
node index.js
```
