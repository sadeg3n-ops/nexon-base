# BACKUP PENDRIVE

## Objetivo

Crear una copia de seguridad offline, portable y verificable para guardarla en un pendrive.

La idea es que esta copia permita recuperar el proyecto aunque se pierda:

- el ordenador
- la carpeta local
- el disco interno

## Que SI incluir

La copia del pendrive debe incluir:

- el codigo fuente limpio
- la documentacion de backup y recuperacion
- el historial Git portable en formato bundle
- los checksums SHA-256 para validar integridad

## Que NO incluir

No metas en el pendrive, dentro del repo sin cifrar:

- `node_modules`
- `dist`
- `.env` reales
- tokens de Vercel
- tokens de Cloudflare
- credenciales SMTP
- ficheros temporales
- sesiones locales

## Metodo recomendado

### Paso 1. Generar la exportacion

```bash
cd "/Users/antonio/Documents/nexo-base-official-worktree"
./scripts/create-backup.sh
```

Esto genera una carpeta `backup-export/` con:

- `nexobase-copia-seguridad-...tar.gz`
- `nexobase-copia-seguridad-...zip`
- `nexobase-copia-seguridad-...bundle`
- `...-MANIFIESTO.txt`
- `...-SHA256SUMS.txt`

### Paso 2. Copiar al pendrive

Copia al pendrive toda la carpeta `backup-export/`.

Nombre recomendado del directorio en el pendrive:

- `COPIA-SEGURIDAD-NEXOBASE-2026-04-01`

## Como guardar los secretos aparte

Los secretos NO deben ir dentro del repo sin cifrar.

Opciones recomendadas:

- guardarlos en un gestor de contrasenas
- guardarlos en una nota segura cifrada
- guardarlos en un archivo cifrado fuera del repo, por ejemplo con GPG o un ZIP protegido con contrasena fuerte

Contenido minimo de esa copia separada de secretos:

- variables de Vercel
- claves de Turnstile
- SMTP
- emails de destino del formulario
- identificadores de rate limit o reglas de firewall

## Como verificar que la copia del pendrive vale

### Validar checksums

Dentro de la carpeta copiada al pendrive:

```bash
shasum -a 256 -c nexobase-copia-seguridad-AAAA-MM-DD_HH-MM-SS-SHA256SUMS.txt
```

### Validar el bundle Git

```bash
git clone nexobase-copia-seguridad-AAAA-MM-DD_HH-MM-SS.bundle prueba-restauracion
cd prueba-restauracion
git log --oneline -n 5
```

### Validar el codigo fuente

```bash
npm install
npm run build
npm run test:security
```

## Frecuencia recomendada

Haz una nueva copia de seguridad:

- antes de cambios grandes de infraestructura
- despues de cambios de seguridad
- antes de tocar DNS, Vercel o Cloudflare
- antes de refactors delicados
- al menos una vez al mes si la web sigue siendo critica
