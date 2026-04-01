# VARIABLES Y SECRETOS

## Regla principal

Nunca subas secretos reales a GitHub.

Este repositorio solo debe contener:

- ejemplos seguros
- placeholders
- documentacion

Los valores reales deben guardarse en:

- Vercel Environment Variables
- gestor de contrasenas
- o archivo cifrado fuera del repositorio

## Lista completa de variables

### Variables secretas

Estas NO deben ser publicas:

- `CONTACT_TO_EMAIL`
- `CONTACT_QUARANTINE_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_ALLOWED_ORIGINS`
- `CONTACT_FORM_SECRET`
- `CONTACT_RATE_LIMIT_ID`
- `PROFANITY_ALLOWLIST_TERMS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SECRET_KEY`

### Variable publica

Esta SI se expone al navegador por diseno:

- `VITE_TURNSTILE_SITE_KEY`

## Donde se configuran

### Vercel

Proyecto oficial:

- equipo: `somosexpertosenia-6096s-projects`
- proyecto: `nexon-base`

Rutas habituales:

- `Settings -> Environment Variables`

## Ejemplos seguros

Estos ejemplos son de referencia y NO son valores reales:

```env
CONTACT_TO_EMAIL=contact@example.com
CONTACT_QUARANTINE_TO_EMAIL=review@example.com
CONTACT_FROM_EMAIL=mailer@example.com
CONTACT_ALLOWED_ORIGINS=https://nexobase.dev,https://www.nexobase.dev
CONTACT_FORM_SECRET=replace_with_at_least_32_random_characters
CONTACT_RATE_LIMIT_ID=contact-form
PROFANITY_ALLOWLIST_TERMS=anti estafa,anti fraude
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=mailer@example.com
SMTP_PASS=replace_with_smtp_password
TURNSTILE_SECRET_KEY=replace_with_cloudflare_turnstile_secret
VITE_TURNSTILE_SITE_KEY=replace_with_cloudflare_turnstile_site_key
```

## Significado de cada variable

- `CONTACT_TO_EMAIL`
  Buzon principal que recibe leads normales.

- `CONTACT_QUARANTINE_TO_EMAIL`
  Buzon de cuarentena para envios marcados como `review`.

- `CONTACT_FROM_EMAIL`
  Remitente usado por el sistema al enviar emails.

- `CONTACT_ALLOWED_ORIGINS`
  Lista exacta de origenes permitidos para el formulario.

- `CONTACT_FORM_SECRET`
  Secreto usado para firmar el token del formulario y la cookie.

- `CONTACT_RATE_LIMIT_ID`
  Identificador comun entre el codigo y la regla de rate limit gestionada.

- `PROFANITY_ALLOWLIST_TERMS`
  Terminos validos que no deben disparar falsos positivos de moderacion.

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
  Configuracion SMTP para el envio del formulario.

- `TURNSTILE_SECRET_KEY`
  Clave secreta para validar Turnstile en servidor.

- `VITE_TURNSTILE_SITE_KEY`
  Site key publica que se usa en el navegador.

## Recomendacion de almacenamiento de secretos

Recomendado:

- Bitwarden
- 1Password
- Apple Passwords si usas ecosistema Apple

Aceptable:

- archivo cifrado con GPG fuera del repo
- ZIP cifrado con AES y contrasena fuerte

No recomendado:

- notas sin cifrar
- TXT suelto en escritorio
- meter secretos dentro del repositorio
