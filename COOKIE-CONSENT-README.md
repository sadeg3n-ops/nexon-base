# Cookie Consent System

## Qué incluye

- Gestor modular de consentimiento con almacenamiento en `localStorage`
- Banner inicial con `Aceptar`, `Rechazar` y `Configurar` con la misma jerarquía visual
- Panel de preferencias accesible y responsive
- Botón flotante permanente `Cookies`
- Bloqueo por categorías con `data-cookie-category`
- Soporte opcional para Google Consent Mode v2
- Renovación automática del consentimiento a los 24 meses
- Modo `technical-only` para webs sin cookies no necesarias activas

## Arquitectura

La implementación se divide en cuatro capas:

1. `src/lib/cookie-consent/storage.ts`
   Guarda y recupera la decisión del usuario con versión, fecha, expiración y categorías.

2. `src/lib/cookie-consent/manager.ts`
   Expone la API principal:
   - `hasConsent(category)`
   - `acceptAll()`
   - `rejectAll()`
   - `savePreferences()`
   - `resetConsent()`
   - `openPreferences()`

3. `src/lib/cookie-consent/dom-gate.ts`
   Activa o mantiene bloqueados scripts, iframes e imágenes marcados con `data-cookie-category`.

4. `src/components/CookieConsent.tsx`
   Renderiza la UI del banner, el panel de configuración y el botón flotante.

## Cómo funciona

1. En `src/main.tsx` se ejecuta `cookieConsentManager.init()`.
2. El gestor aplica estado por defecto:
   - `necessary: true`
   - resto de categorías: `false`
3. Si existe un consentimiento válido y vigente, lo hidrata.
4. Si no existe o está caducado, muestra el banner.
5. Cada cambio:
   - actualiza almacenamiento
   - emite eventos
   - aplica bloqueo/desbloqueo DOM
   - actualiza Google Consent Mode si está activo

## Configuración principal

El punto de entrada está en:

`src/lib/cookie-consent/index.ts`

```ts
export const cookieConsentManager = new CookieConsentManager({
  version: '2026-04-cookie-consent-v1',
  policyUrl: '/politica-cookies/',
  technicalOnlyMode: false,
  renewalDays: 730,
  enableGoogleConsentMode: true,
});
```

### Technical-only mode

Si en producción no usas ninguna cookie no necesaria, activa:

```ts
technicalOnlyMode: true
```

Con eso no aparecerá el banner intrusivo. El sistema mantendrá solo cookies técnicas y dejará un mecanismo discreto para información y reapertura.

## Cómo añadir servicios por categoría

### Scripts inline bloqueados hasta consentimiento

```html
<script type="text/plain" data-cookie-category="analytics">
  console.log('Solo se ejecuta con consentimiento analítico');
</script>
```

### Scripts externos bloqueados hasta consentimiento

```html
<script
  type="text/plain"
  data-cookie-category="marketing"
  data-cookie-src="https://example.com/pixel.js"
></script>
```

### Iframes bloqueados hasta consentimiento

```html
<iframe
  title="Mapa"
  data-cookie-category="preferences"
  data-cookie-src="https://www.google.com/maps/embed?pb=..."
  loading="lazy"
></iframe>
```

### Imágenes o pixels con `src` diferido

```html
<img
  alt=""
  width="1"
  height="1"
  data-cookie-category="marketing"
  data-cookie-src="https://example.com/pixel?id=123"
/>
```

## Hooks y eventos

### API global

```js
window.CookieConsent.hasConsent('analytics');
window.CookieConsent.acceptAll();
window.CookieConsent.rejectAll();
window.CookieConsent.savePreferences({ analytics: true, preferences: false, marketing: false });
window.CookieConsent.resetConsent();
window.CookieConsent.openPreferences();
```

### Evento global de cambios

```js
window.addEventListener('cookie-consent:change', (event) => {
  console.log(event.detail.snapshot);
  console.log(event.detail.context);
});
```

### Suscripción directa

```js
const unsubscribe = window.CookieConsent.subscribe((snapshot, context) => {
  console.log(snapshot.preferences, context.source);
});
```

## Google Consent Mode v2

El sistema prepara soporte opcional sin cargar GA o GTM antes del consentimiento.

### Estado inicial por defecto

- `analytics_storage: denied`
- `ad_storage: denied`
- `ad_user_data: denied`
- `ad_personalization: denied`
- `security_storage: granted`

### Qué hace la integración

- crea `dataLayer` y `gtag()` si aún no existen
- envía `consent default` al iniciar
- envía `consent update` cuando cambian preferencias

## Ejemplos de integración

### Google Analytics 4

Mantén el script bloqueado hasta consentimiento:

```html
<script
  type="text/plain"
  data-cookie-category="analytics"
  data-cookie-src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>

<script type="text/plain" data-cookie-category="analytics">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
</script>
```

### Meta Pixel

```html
<script type="text/plain" data-cookie-category="marketing">
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### HubSpot tracking

```html
<script
  type="text/plain"
  data-cookie-category="marketing"
  data-cookie-src="https://js.hs-scripts.com/YOUR_PORTAL_ID.js"
  async
  defer
></script>
```

## Cómo retirar consentimiento o resetear pruebas

### Desde consola del navegador

```js
window.CookieConsent.resetConsent();
```

### Desde DevTools

1. Abre DevTools
2. Ve a `Application` > `Local Storage`
3. Elimina la clave `nexo-base-cookie-consent`

## Cómo probar cumplimiento manualmente

### 1. Estado inicial

- Abre la web en modo incógnito
- Comprueba que aparece el banner
- Verifica que no se cargan tags no necesarias antes de elegir

### 2. Rechazar

- Pulsa `Rechazar`
- Comprueba que solo siguen activas las necesarias
- Verifica que el botón flotante `Cookies` sigue visible

### 3. Configuración granular

- Abre `Configurar`
- Activa solo `Analíticas`
- Guarda
- Comprueba que solo se habilitan recursos marcados como `analytics`

### 4. Retirada de consentimiento

- Reabre desde `Cookies`
- Rechaza todas
- Comprueba que iframes/imágenes gestionadas vuelven a quedar bloqueadas

### 5. Accesibilidad

- Navega solo con teclado
- Verifica foco visible
- Abre/cierra el panel con teclado
- Comprueba `Escape` y trapping de foco en el modal

### 6. Reduced motion

- Activa `prefers-reduced-motion` en tu sistema
- Revisa que las transiciones se suavizan o se desactivan

## Nota legal práctica

La implementación está alineada con los requisitos funcionales pedidos para un sitio en España / UE, pero la política y la lista exacta de proveedores deben revisarse siempre contra los servicios realmente activos en producción y, si procede, con revisión legal final.
