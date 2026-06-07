# README BACKUP

## Que es esta copia

Este repositorio incluye una estrategia de copia de seguridad pensada para sobrevivir a un desastre real:

- perdida total del ordenador
- borrado accidental de carpetas locales
- necesidad de volver a levantar la web desde cero
- necesidad de recuperar el contexto tecnico exacto dentro de meses

La copia se apoya en tres capas:

- GitHub como copia remota versionada
- una rama de backup claramente identificada
- una exportacion offline para pendrive generada desde el propio repo

## Que contiene

Esta copia protege:

- codigo fuente
- configuracion de Vercel
- logica del formulario
- endurecimiento de seguridad
- pruebas de seguridad
- documentacion operativa y de recuperacion

No contiene secretos reales en texto plano.

## Elementos clave de la copia

- Rama de backup: `backup/copia-de-seguridad-completa-2026-04-01`
- Tag de backup: `copia-seguridad-2026-04-01`
- Script de exportacion offline: [scripts/create-backup.sh](/Users/antonio/Documents/nexo-base-official-worktree/scripts/create-backup.sh)

## Documentos que hay que leer

- [RECUPERACION_TOTAL.md](/Users/antonio/Documents/nexo-base-official-worktree/RECUPERACION_TOTAL.md)
- [CAMBIOS_DE_SEGURIDAD.md](/Users/antonio/Documents/nexo-base-official-worktree/CAMBIOS_DE_SEGURIDAD.md)
- [MANUAL_PARA_CODEX.md](/Users/antonio/Documents/nexo-base-official-worktree/MANUAL_PARA_CODEX.md)
- [BACKUP_PENDRIVE.md](/Users/antonio/Documents/nexo-base-official-worktree/BACKUP_PENDRIVE.md)
- [VARIABLES_Y_SECRETOS.md](/Users/antonio/Documents/nexo-base-official-worktree/VARIABLES_Y_SECRETOS.md)
- [CHECKLIST_DESASTRE.md](/Users/antonio/Documents/nexo-base-official-worktree/CHECKLIST_DESASTRE.md)

## Uso rapido

### Crear una copia offline para pendrive

```bash
cd "/Users/antonio/Documents/nexo-base-official-worktree"
./scripts/create-backup.sh
```

El script genera en `backup-export/`:

- un `tar.gz` limpio
- un `zip` limpio
- un `bundle` Git portable
- un manifiesto
- checksums SHA-256

### Recuperar desde GitHub

```bash
git clone https://github.com/sadeg3n-ops/nexon-base.git
cd nexon-base
git checkout copia-seguridad-2026-04-01
```

### Recuperar desde pendrive

```bash
git clone /ruta/al/pendrive/nexobase-copia-seguridad-AAAA-MM-DD_HH-MM-SS.bundle nexon-base-restaurado
cd nexon-base-restaurado
```

## Como evitar que esta copia se toque por accidente

En GitHub:

1. Ve a `Settings -> Rules -> Rulesets`.
2. Crea una regla para ramas `backup/*`.
3. Desactiva `Allow force pushes`.
4. Desactiva `Allow deletions`.
5. Restringe los pushes si quieres una capa extra.

Para el tag:

1. En `Rulesets`, crea una regla para tags `copia-seguridad-*`.
2. Bloquea actualizaciones y borrados.

## Release opcional

Si mas adelante quieres un release formal en GitHub, puedes hacerlo desde la web usando el tag `copia-seguridad-2026-04-01`.

Si algun dia tienes `gh` instalado y autenticado:

```bash
gh release create copia-seguridad-2026-04-01 \
  --title "Copia de seguridad 2026-04-01" \
  --notes-file README_BACKUP.md
```

## Regla de oro

El codigo puede estar en GitHub.
Los secretos reales no.

Los secretos deben vivir en:

- Vercel Environment Variables
- gestor de contrasenas
- o archivo cifrado fuera del repositorio
