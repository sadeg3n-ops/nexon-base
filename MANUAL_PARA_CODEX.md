# MANUAL PARA CODEX

## Objetivo

Este documento permite que otro agente o Codex entienda el proyecto rapido y no rompa produccion por falta de contexto.

## Arquitectura actual

- Frontend:
  Vite + React + TypeScript
- Hosting:
  Vercel Hobby
- Dominio de produccion:
  `nexobase.dev`
- Formulario:
  endpoint serverless en `/api/contact`
- Seguridad principal:
  token firmado + cookie segura + moderacion + Turnstile + rate limiting + allowlist de origen

## Estructura importante

- [src/](/Users/antonio/Documents/nexo-base-official-worktree/src)
  frontend
- [src/sections/](/Users/antonio/Documents/nexo-base-official-worktree/src/sections)
  secciones de la landing
- [src/components/](/Users/antonio/Documents/nexo-base-official-worktree/src/components)
  componentes compartidos
- [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
  logica critica del formulario y seguridad
- [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)
  pruebas de seguridad
- [vercel.json](/Users/antonio/Documents/nexo-base-official-worktree/vercel.json)
  headers y despliegue
- [DEPLOYMENT.md](/Users/antonio/Documents/nexo-base-official-worktree/DEPLOYMENT.md)
  pasos operativos externos

## Flujo del formulario

1. El cliente hace `GET /api/contact`.
2. El servidor devuelve:
   - `formToken`
   - `minSubmitDelayMs`
   - `challengeRequired`
   - cookie de sesion `HttpOnly` con `SameSite=Strict`
3. El frontend rellena datos y, si toca, resuelve Turnstile.
4. El cliente hace `POST /api/contact` con JSON.
5. El servidor valida:
   - content-type
   - origin
   - tamano
   - token/cookie
   - replay
   - rate limit
   - Turnstile
   - duplicados
   - moderacion
6. El servidor decide:
   - `allow` -> inbox principal
   - `review` -> cuarentena
   - `drop` -> responde ok pero no envia email

## Variables de entorno necesarias

Ver lista completa en:

- [VARIABLES_Y_SECRETOS.md](/Users/antonio/Documents/nexo-base-official-worktree/VARIABLES_Y_SECRETOS.md)

Las mas delicadas para produccion son:

- `CONTACT_FORM_SECRET`
- `CONTACT_ALLOWED_ORIGINS`
- `SMTP_PASS`
- `TURNSTILE_SECRET_KEY`
- `VITE_TURNSTILE_SITE_KEY`

## Decisiones de seguridad importantes

- No exponer nunca `TURNSTILE_SECRET_KEY`
- No debilitar los errores publicos genericos
- No eliminar el honeypot `website`
- No quitar el minimo de espera del formulario
- No reducir la moderacion sin revisar tests
- No permitir origenes comodin
- No tocar `CONTACT_ALLOWED_ORIGINS` a ojo

## Que no se debe tocar sin cuidado

- [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)
- [vercel.json](/Users/antonio/Documents/nexo-base-official-worktree/vercel.json)
- [src/sections/DiagnosticOffer.tsx](/Users/antonio/Documents/nexo-base-official-worktree/src/sections/DiagnosticOffer.tsx)

## Checklist antes de modificar produccion

1. Entender por que existe la defensa actual.
2. Revisar [CAMBIOS_DE_SEGURIDAD.md](/Users/antonio/Documents/nexo-base-official-worktree/CAMBIOS_DE_SEGURIDAD.md).
3. Confirmar si el cambio afecta a:
   - token
   - cookie
   - Turnstile
   - origen
   - moderacion
   - correo
4. Tener claro como verificar el cambio.

## Checklist antes de desplegar

1. `git status`
2. `npm run build`
3. `npm run test:security`
4. revisar `vercel.json`
5. revisar `api/contact.js`
6. confirmar que no hay secretos en el diff
7. desplegar
8. probar:
   - `/`
   - `/api/contact`
   - formulario real

## Regla para futuros agentes

Si vas a tocar el formulario:

- mantente minimalista
- no redisenes la arquitectura
- no elimines capas defensivas ya existentes
- documenta cualquier cambio de seguridad en [CAMBIOS_DE_SEGURIDAD.md](/Users/antonio/Documents/nexo-base-official-worktree/CAMBIOS_DE_SEGURIDAD.md)
