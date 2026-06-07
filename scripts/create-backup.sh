#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${ROOT_DIR}/backup-export"
TIMESTAMP="$(date +"%Y-%m-%d_%H-%M-%S")"
PROJECT_SLUG="nexobase"

ALLOW_DIRTY="${1:-}"

cd "${ROOT_DIR}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: este script debe ejecutarse dentro del repositorio Git." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" && "${ALLOW_DIRTY}" != "--allow-dirty" ]]; then
  echo "Error: el repositorio tiene cambios sin guardar en Git." >&2
  echo "Haz commit primero o ejecuta el script con --allow-dirty si sabes exactamente lo que haces." >&2
  exit 1
fi

mkdir -p "${OUTPUT_DIR}"

SHORT_SHA="$(git rev-parse --short HEAD)"
FULL_SHA="$(git rev-parse HEAD)"
CURRENT_BRANCH="$(git branch --show-current || true)"
REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo "sin remote")"
EXACT_TAG="$(git describe --tags --exact-match HEAD 2>/dev/null || echo "sin-tag-exacto")"

ARCHIVE_PREFIX="${PROJECT_SLUG}-copia-seguridad-${TIMESTAMP}"
TAR_PATH="${OUTPUT_DIR}/${ARCHIVE_PREFIX}.tar.gz"
ZIP_PATH="${OUTPUT_DIR}/${ARCHIVE_PREFIX}.zip"
BUNDLE_PATH="${OUTPUT_DIR}/${ARCHIVE_PREFIX}.bundle"
MANIFEST_PATH="${OUTPUT_DIR}/${ARCHIVE_PREFIX}-MANIFIESTO.txt"
CHECKSUM_PATH="${OUTPUT_DIR}/${ARCHIVE_PREFIX}-SHA256SUMS.txt"

git archive --format=tar.gz --output="${TAR_PATH}" HEAD
git archive --format=zip --output="${ZIP_PATH}" HEAD
git bundle create "${BUNDLE_PATH}" --all

cat > "${MANIFEST_PATH}" <<EOF
COPIA DE SEGURIDAD DE NEXO BASE
================================

Fecha de generacion: ${TIMESTAMP}
Commit: ${FULL_SHA}
Commit corto: ${SHORT_SHA}
Rama actual: ${CURRENT_BRANCH:-detached-head}
Tag exacto en HEAD: ${EXACT_TAG}
Remote origin: ${REMOTE_URL}

Archivos generados:
- $(basename "${TAR_PATH}")
- $(basename "${ZIP_PATH}")
- $(basename "${BUNDLE_PATH}")
- $(basename "${CHECKSUM_PATH}")

Contenido:
- TAR.GZ: codigo fuente limpio del commit actual
- ZIP: copia portable del codigo fuente limpio del commit actual
- BUNDLE: repositorio Git portable con historial y refs

Validacion recomendada:
1. Copiar toda la carpeta backup-export al pendrive.
2. Ejecutar:
   shasum -a 256 -c $(basename "${CHECKSUM_PATH}")
3. Probar que el bundle clona:
   git clone $(basename "${BUNDLE_PATH}") prueba-restauracion
4. Probar que el codigo compila:
   npm install
   npm run build
   npm run test:security

IMPORTANTE:
- Esta exportacion NO incluye secretos reales.
- Las variables de entorno deben recuperarse desde Vercel o desde tu gestor de contrasenas.
- No guardes secretos en texto plano dentro de esta carpeta.
EOF

shasum -a 256 "${TAR_PATH}" "${ZIP_PATH}" "${BUNDLE_PATH}" "${MANIFEST_PATH}" > "${CHECKSUM_PATH}"

echo
echo "Copia de seguridad generada correctamente en:"
echo "  ${OUTPUT_DIR}"
echo
echo "Archivos:"
echo "  ${TAR_PATH}"
echo "  ${ZIP_PATH}"
echo "  ${BUNDLE_PATH}"
echo "  ${MANIFEST_PATH}"
echo "  ${CHECKSUM_PATH}"
