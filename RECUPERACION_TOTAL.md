# RECUPERACION TOTAL

## Para que sirve este documento

Este manual esta pensado para recuperar la web desde cero si ocurre un desastre como:

- ordenador roto
- carpeta borrada
- perdida total del proyecto local
- necesidad de volver a desplegar desde otro equipo

Si sigues estos pasos en orden, deberias poder volver a levantar la web.

## Lo que necesitas antes de empezar

Necesitas tener acceso a:

- el repositorio de GitHub
- la cuenta de Vercel del proyecto
- las variables de entorno reales
- la cuenta de Cloudflare si usas Turnstile o WAF
- el email del formulario

## Opcion A: recuperar desde GitHub

### 1. Instalar herramientas base

Instala:

- Git
- Node.js 20 LTS o 22 LTS
- npm
- Vercel CLI

Comandos recomendados:

```bash
node -v
npm -v
git --version
npx -y vercel@latest --version
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/sadeg3n-ops/nexon-base.git
cd nexon-base
```

### 3. Recuperar la copia estable

Puedes trabajar desde el tag de backup:

```bash
git checkout copia-seguridad-2026-04-01
git switch -c restauracion-local-2026-04-01
```

O desde la rama de backup:

```bash
git checkout backup/copia-de-seguridad-completa-2026-04-01
```

## Opcion B: recuperar desde el pendrive

### 1. Clonar el bundle Git

```bash
git clone /ruta/al/pendrive/nexobase-copia-seguridad-AAAA-MM-DD_HH-MM-SS.bundle nexon-base
cd nexon-base
```

### 2. Revisar el estado del repositorio

```bash
git branch --all
git tag
git log --oneline -n 10
```

## Instalar dependencias

Dentro del proyecto:

```bash
npm install
```

## Restaurar variables de entorno

### Opcion 1. Restaurarlas en Vercel

Entra en el proyecto de Vercel:

- equipo: `somosexpertosenia-6096s-projects`
- proyecto: `nexon-base`

Ve a:

- `Settings -> Environment Variables`

Y crea o revisa las variables listadas en [VARIABLES_Y_SECRETOS.md](/Users/antonio/Documents/nexo-base-official-worktree/VARIABLES_Y_SECRETOS.md)

### Opcion 2. Restaurarlas en local para pruebas

No guardes secretos reales en Git.

Crea un `.env` local solo en tu maquina usando como base:

```bash
cp .env.example .env
```

Despues sustituye los placeholders por los valores reales.

## Verificar que el codigo compila

```bash
npm run build
npm run test:security
```

Si `test:security` falla, no despliegues hasta entender por que.

## Volver a enlazar o crear el proyecto en Vercel

### Si el proyecto ya existe

```bash
npx -y vercel@latest link --project nexon-base --scope somosexpertosenia-6096s-projects
```

### Si el proyecto se hubiera perdido

1. Crea un proyecto nuevo en Vercel con nombre `nexon-base`.
2. Apunta el dominio `nexobase.dev`.
3. Restaura todas las variables de entorno.
4. Vuelve a desplegar.

## Desplegar en Vercel

```bash
npx -y vercel@latest deploy --prod --yes --scope somosexpertosenia-6096s-projects
```

## Comprobaciones minimas despues del deploy

### Home

```bash
curl -I https://nexobase.dev
```

Debe devolver:

- `HTTP 200`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### API del formulario

```bash
curl -i https://nexobase.dev/api/contact
```

Debe devolver:

- `HTTP 200`
- `Cache-Control: no-store`
- cookie `HttpOnly` y `SameSite=Strict`
- JSON con `formToken`

Si Turnstile esta activo, tambien debe devolver:

- `"challengeRequired": true`

## Como recuperar el flujo de seguridad del formulario

Debes asegurarte de que siguen activos estos elementos:

- `CONTACT_FORM_SECRET`
- `CONTACT_ALLOWED_ORIGINS`
- `CONTACT_TO_EMAIL`
- `CONTACT_QUARANTINE_TO_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SECRET_KEY`
- `VITE_TURNSTILE_SITE_KEY`

Y en el codigo:

- [api/contact.js](/Users/antonio/Documents/nexo-base-official-worktree/api/contact.js)
- [src/sections/DiagnosticOffer.tsx](/Users/antonio/Documents/nexo-base-official-worktree/src/sections/DiagnosticOffer.tsx)
- [vercel.json](/Users/antonio/Documents/nexo-base-official-worktree/vercel.json)
- [tests/contact-security.test.mjs](/Users/antonio/Documents/nexo-base-official-worktree/tests/contact-security.test.mjs)

## Comprobacion final del formulario

1. Abre la web.
2. Baja al formulario.
3. Comprueba que aparece Turnstile si esta activado.
4. Marca privacidad.
5. Envia una prueba legitima.
6. Comprueba que el correo llega.

## Si algo falla

Mira en este orden:

1. variables de entorno
2. build local
3. `npm run test:security`
4. `curl https://nexobase.dev/api/contact`
5. configuracion de Turnstile
6. SMTP
7. Vercel deployment logs

## Checklist ultra corto de desastre

Tambien tienes una version resumida aqui:

- [CHECKLIST_DESASTRE.md](/Users/antonio/Documents/nexo-base-official-worktree/CHECKLIST_DESASTRE.md)
