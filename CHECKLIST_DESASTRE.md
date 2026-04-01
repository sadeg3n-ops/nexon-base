# CHECKLIST DESASTRE

## Orden exacto de recuperacion

1. Clonar el repo
2. Instalar Node.js
3. Ejecutar `npm install`
4. Restaurar variables de entorno
5. Ejecutar `npm run build`
6. Ejecutar `npm run test:security`
7. Desplegar en Vercel
8. Comprobar Turnstile
9. Comprobar formulario
10. Comprobar correo
11. Comprobar headers y seguridad

## Comandos minimos

```bash
git clone https://github.com/sadeg3n-ops/nexon-base.git
cd nexon-base
git checkout copia-seguridad-2026-04-01
npm install
npm run build
npm run test:security
npx -y vercel@latest deploy --prod --yes --scope somosexpertosenia-6096s-projects
curl -I https://nexobase.dev
curl -i https://nexobase.dev/api/contact
```
