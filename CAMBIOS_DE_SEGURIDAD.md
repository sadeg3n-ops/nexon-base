# CAMBIOS DE SEGURIDAD

## Resumen

El formulario ya no es un simple envio de datos al correo.
Ahora tiene varias capas para reducir spam, abuso, replay, origenes hostiles y errores inseguros.

## Antes

Antes, el riesgo tipico de un formulario asi seria:

- envios directos al endpoint sin control
- spam automatizado
- reenvios repetidos
- abuso verbal o amenazas llegando al inbox principal
- errores demasiado detallados
- ausencia de validaciones server-side reales

## Ahora

El sistema actual endurece:

- captacion del token del formulario
- validacion del envio
- proteccion anti replay
- moderacion `allow / review / drop`
- cuarentena para casos dudosos
- limitacion de velocidad
- validacion de origen
- Turnstile
- cabeceras de seguridad

## Inventario exacto de medidas

### 1. Turnstile

- Que hace:
  exige un challenge anti-bot cuando esta configurado.
- Por que se puso:
  para reducir envios automaticos y abuso masivo.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js), [src/sections/DiagnosticOffer.tsx](/Users/antonio/Documents/nexo-base-official-worktree/src/sections/DiagnosticOffer.tsx)
- Como verificar:
  `curl -s https://nexobase.dev/api/contact | jq`
  y comprobar `"challengeRequired": true`

### 2. Validacion server-side

- Que hace:
  el servidor valida estructura, campos permitidos, longitudes y formato.
- Por que se puso:
  el frontend no es una frontera de seguridad.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  mandar JSON incompleto o invalido y comprobar que responde con error publico generico.

### 3. Token firmado de formulario

- Que hace:
  cada sesion del formulario usa un token firmado.
- Por que se puso:
  para evitar envios directos sin bootstrap previo.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  `GET /api/contact` devuelve `formToken`.

### 4. Cookie HttpOnly + SameSite=Strict

- Que hace:
  vincula el token del formulario a una cookie de sesion protegida.
- Por que se puso:
  para reforzar el vinculo entre navegador, sesion y envio.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  `curl -i https://nexobase.dev/api/contact`

### 5. Tiempo minimo de envio

- Que hace:
  exige una espera minima antes de enviar.
- Por que se puso:
  muchos bots envian demasiado rapido.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  el JSON de bootstrap devuelve `minSubmitDelayMs`.

### 6. Honeypot

- Que hace:
  usa el campo `website` como trampa silenciosa.
- Por que se puso:
  para atrapar bots que rellenan todos los campos.
- Archivo:
  [src/sections/DiagnosticOffer.tsx](/Users/antonio/Documents/nexo-base-official-worktree/src/sections/DiagnosticOffer.tsx), [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  si el campo oculto se rellena, el envio no debe tratarse como legitimo.

### 7. Filtro anti insultos / spam / abuso

- Que hace:
  detecta insultos, amenazas, acusaciones hostiles, leetspeak, espacios y signos para evasion, y algunas obfuscaciones Unicode.
- Por que se puso:
  para que el inbox principal no reciba abuso evidente.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js), [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)
- Como verificar:
  ejecutar `npm run test:security`.

### 8. Allow / review / drop

- Que hace:
  clasifica envios en:
  - `allow`
  - `review`
  - `drop`
- Por que se puso:
  no todo debe ir al inbox principal y no todo debe bloquearse igual.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  revisar los tests de `review` y `drop`.

### 9. Cuarentena

- Que hace:
  los envios dudosos van al correo de cuarentena.
- Por que se puso:
  para no perder casos validos raros ni contaminar el inbox principal.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  comprobar que `review` usa `CONTACT_QUARANTINE_TO_EMAIL`.

### 10. Replay y duplicados

- Que hace:
  evita reutilizar tokens y reenvios iguales repetidos.
- Por que se puso:
  para cortar automatizaciones simples y repeticion accidental.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  tests de replay y duplicados en [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)

### 11. Rate limiting

- Que hace:
  limita velocidad tanto en bootstrap GET como en POST.
- Por que se puso:
  para reducir abuso por rafagas.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  tests de rate limit y, si procede, regla WAF en Vercel o Cloudflare.

### 12. Origin allowlist

- Que hace:
  solo acepta origenes permitidos.
- Por que se puso:
  para cortar posts directos desde webs hostiles.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  `POST /api/contact` con `Origin: https://evil.example` debe fallar.

### 13. JSON-only

- Que hace:
  el endpoint POST solo acepta JSON.
- Por que se puso:
  para simplificar la superficie de entrada y evitar payloads inesperados.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  un content-type incorrecto devuelve `415`.

### 14. Limites de tamano

- Que hace:
  corta cuerpos demasiado grandes.
- Por que se puso:
  para reducir abuso, payloads raros y consumo innecesario.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  existe `MAX_BODY_BYTES = 12 * 1024`.

### 15. Errores publicos genericos

- Que hace:
  no expone detalles internos en respuestas al cliente.
- Por que se puso:
  para no regalar senales sobre las defensas activas.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  los errores devuelven mensajes publicos cortos y neutros.

### 16. Seguridad del email

- Que hace:
  compone el email con estructura fija y escape de HTML.
- Por que se puso:
  para evitar inyeccion de contenido peligroso en el correo.
- Archivo:
  [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- Como verificar:
  tests de `createEmailContent`.

### 17. Headers de seguridad

- Que hace:
  sirve CSP, HSTS, COOP, CORP, X-Frame-Options, no-store en API y demas cabeceras.
- Por que se puso:
  para endurecer navegador y cacheo.
- Archivo:
  [vercel.json](/Users/antonio/Documents/nexo-base-official-worktree/vercel.json)
- Como verificar:
  `curl -I https://nexobase.dev`

### 18. Integracion con Vercel y Cloudflare

- Que hace:
  Vercel aloja, sirve headers y ejecuta la funcion del formulario.
  Cloudflare aporta Turnstile y puede aportar WAF/rate limit.
- Por que se puso:
  para reforzar proteccion sin cambiar la arquitectura principal.
- Archivo:
  [DEPLOYMENT.md](/Users/antonio/Documents/nexo-base-official-worktree/DEPLOYMENT.md)
- Como verificar:
  revisar deployment y `challengeRequired`.

## Que archivos se tocaron en esta capa de seguridad

- [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- [src/sections/DiagnosticOffer.tsx](/Users/antonio/Documents/nexo-base-official-worktree/src/sections/DiagnosticOffer.tsx)
- [vercel.json](/Users/antonio/Documents/nexo-base-official-worktree/vercel.json)
- [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)
- [DEPLOYMENT.md](/Users/antonio/Documents/nexo-base-official-worktree/DEPLOYMENT.md)

## Que sigue pendiente o es opcional

- conectar autodeploy GitHub -> Vercel si aun no queda automatizado del todo
- reglas WAF externas si quieres una capa adicional
- proteccion de rama y tags en GitHub
- variables preview de Turnstile por rama si quieres previews con challenge

## Regla importante

No toques [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js) sin pasar:

- `npm run build`
- `npm run test:security`
