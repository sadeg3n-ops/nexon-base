import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'es' | 'en';

const COOKIE_KEY = 'nexo-base-language';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const siteCopy = {
  es: {
    metadata: {
      htmlLang: 'es',
      title: 'Nexo Base | Webs y sistemas de captación para negocios',
      description:
        'Tu web debería captar. Diseñamos una base clara para captar mejor hoy y ampliar después sin rehacerlo todo.',
      ogLocale: 'es_ES',
      ogTitle: 'Nexo Base | Webs y sistemas de captación para negocios',
      ogDescription:
        'Tu web debería captar. Diseñamos una base clara para captar mejor hoy y ampliar después sin rehacerlo todo.',
      imageAlt: 'Logo de Nexo Base sobre fondo negro',
    },
    nav: {
      system: 'Sistema',
      howItWorks: 'Cómo funciona',
      services: 'Servicios',
      faq: 'FAQ',
      mobileCta: 'Diagnóstico',
      desktopCta: 'Solicitar diagnóstico gratuito',
      languageAria: 'Cambiar idioma',
    },
    languageGate: {
      eyebrow: 'Nexo Base',
      title: 'Elige tu idioma',
      description:
        'Puedes cambiarlo cuando quieras desde la parte superior. Dejamos guardada tu elección en este dispositivo.',
      spanish: 'Español',
      english: 'English',
      helper: 'Una entrada limpia, clara y elegante desde el primer momento.',
    },
    legalLinks: {
      notice: { label: 'Aviso legal', href: '/es/aviso-legal/' },
      privacy: { label: 'Política de privacidad', href: '/es/politica-privacidad/' },
      cookies: { label: 'Política de cookies', href: '/es/politica-cookies/' },
      terms: { label: 'Condiciones', href: '/es/condiciones/' },
    },
    hero: {
      eyebrow: 'Web y sistema de captación para negocios',
      title: 'Tu web debería captar.',
      highlight: 'Tu sistema debería evitar que se escapen oportunidades.',
      description:
        'Empieza con una base clara para captar mejor hoy y ampliar después sin rehacerlo todo.',
      cta: 'Solicitar diagnóstico gratuito',
      supportPrimary: 'Respuesta en 24h',
      supportSecondary: 'Te diremos por dónde empezaríamos',
      visualTitle: 'Sistema por capas',
      visualFooter: 'Empieza por la base. Amplía sin rehacerlo todo.',
      cards: [
        {
          title: 'Web de captación',
          copy: 'Página clara para que contactar sea fácil.',
        },
        {
          title: 'Seguimiento de oportunidades',
          copy: 'Visibilidad sobre cada contacto y el siguiente paso.',
        },
        {
          title: 'Reservas online',
          copy: 'Reservas más fáciles, más tiempo para el equipo.',
        },
        {
          title: 'Posicionamiento SEO',
          copy: 'Atrae visitas de clientes con intención de compra.',
        },
        {
          title: 'Automatizaciones y pagos',
          copy: 'Recordatorios, confirmaciones y cobros sin caos.',
        },
      ],
    },
    whoItsFor: {
      title: 'Te entran contactos, pero el sistema no acompaña',
      description:
        'Si captación, seguimiento y reservas no están conectados, el contacto se enfría y se pierden oportunidades que ya habías generado.',
      positiveTitle: 'Esto es para ti si',
      positive: [
        'Tu web actual no está pensada para convertir',
        'Te entran contactos por varios canales y es difícil tener una visión clara',
        'El seguimiento depende demasiado de WhatsApp o procesos manuales',
        'Quieres una base seria para crecer sin improvisar',
      ],
      negativeTitle: 'Esto no es para ti si',
      negative: [
        'Solo buscas una web bonita',
        'No quieres revisar procesos ni cambiar sistemas',
        'Tu negocio aún no tiene un flujo real de oportunidades',
        'Esperas resultados sin cambios',
      ],
    },
    systemLayers: {
      title: 'Empieza por la base. Amplía cuando de verdad tenga sentido.',
      description:
        'Montamos primero lo que más impacto tiene. Lo demás se añade cuando el negocio lo necesita.',
      addOnsTitle: 'Ampliaciones cuando tenga sentido',
      addOns: ['Emails automáticos', 'Pagos online', 'Área de clientes'],
      layers: [
        {
          title: 'Web de captación',
          text: 'Página clara para que el cliente contacte fácil y tu equipo reciba mejor cada oportunidad.',
        },
        {
          title: 'Seguimiento de oportunidades',
          text: 'Visibilidad sobre cada contacto, su estado y el siguiente paso.',
        },
        {
          title: 'Reservas online',
          text: 'Menos fricción al reservar, más tiempo para el equipo.',
        },
        {
          title: 'Posicionamiento SEO',
          text: 'Atrae visitas de clientes que ya buscan tus servicios de forma activa.',
        },
        {
          title: 'Automatizaciones',
          text: 'Recordatorios y tareas repetitivas que dejan de depender del equipo.',
        },
      ],
    },
    howItWorks: {
      title: 'Cómo trabajamos',
      steps: [
        {
          num: '01',
          title: 'Detectamos dónde se rompe',
          text: 'Revisamos captación, seguimiento y atascos reales.',
        },
        {
          num: '02',
          title: 'Priorizamos impacto',
          text: 'Empezamos por lo que más mejora orden, respuesta y conversión.',
        },
        {
          num: '03',
          title: 'Construimos lo necesario',
          text: 'Diseñamos la web y los módulos que sí tienen sentido.',
        },
        {
          num: '04',
          title: 'Lanzamos y ampliamos',
          text: 'Empiezas por lo esencial y amplías sin rehacerlo todo.',
        },
      ],
    },
    pricing: {
      title: 'Nuestros Servicios',
      description: 'Diferentes puntos de partida, pensados para resolver problemas concretos.',
      availability: 'Consultar disponibilidad',
      note: 'También puedes empezar por la web y añadir lo demás más adelante.',
      modulesTitle: 'Módulos opcionales',
      askUs: 'Consultar',
      maintenanceTitle: 'Mantenimiento y soporte',
      maintenanceDescription:
        'Para que el sistema siga funcionando sin que tengas que ocuparte de la parte técnica.',
      maintenanceFeatures: [
        'Seguridad y soporte',
        'Copias de seguridad',
        'Mantenimiento del sistema',
        'Integraciones y pequeños cambios',
      ],
      packs: [
        {
          name: 'Web de captación',
          price: 'Consultar',
          text: 'La base para captar mejor y responder mejor.',
          includes: [
            'Página enfocada a captación',
            'Formulario claro',
            'Botón de WhatsApp',
            'Estructura pensada para convertir',
          ],
        },
        {
          name: 'Sistema de captación',
          price: 'A medida',
          text: 'Para negocios que necesitan más orden, seguimiento, reservas y SEO.',
          includes: [
            'Web de captación',
            'Seguimiento de oportunidades',
            'Reservas online',
            'Posicionamiento SEO básico'
          ],
        },
        {
          name: 'Sistema completo',
          price: 'A medida',
          text: 'La opción más completa para captar, ordenar, posicionar y automatizar.',
          includes: [
            'Web de captación',
            'Seguimiento de oportunidades',
            'Reservas online',
            'Posicionamiento SEO avanzado',
            'Emails automáticos y pagos online',
          ],
        },
      ],
      modules: [
        'Seguimiento de oportunidades',
        'Reservas online',
        'Posicionamiento SEO',
        'Emails automáticos',
        'Pagos online',
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Tengo que montar todo desde el principio?',
          a: 'No. Muchas veces lo más lógico es empezar por la web de captación y añadir lo demás cuando el negocio lo pide.',
        },
        {
          q: '¿Puedo empezar solo por la web?',
          a: 'Sí. Es la base más lógica si ahora mismo lo que necesitas es mejorar cómo entran los contactos.',
        },
        {
          q: '¿Y si ya tengo web o CRM?',
          a: 'Se revisa. Si algo de lo que ya tienes sirve, se aprovecha. La idea no es rehacer por rehacer.',
        },
        {
          q: '¿Esto sirve para cualquier tipo de negocio?',
          a: 'Sí. Encaja en negocios que necesitan captar mejor, hacer seguimiento y reducir el caos manual en su operativa comercial.',
        },
        {
          q: '¿Cuánto tarda en estar listo?',
          a: 'Depende del alcance. Una web de captación simple no requiere el mismo tiempo que un sistema completo. Eso se define en el diagnóstico.',
        },
        {
          q: '¿Qué incluye el mantenimiento mensual?',
          a: 'Incluye soporte, seguridad, copias, mantenimiento del sistema y pequeños cambios para que todo siga funcionando sin fricciones.',
        },
        {
          q: '¿El diagnóstico es una venta encubierta?',
          a: 'No. El objetivo es decirte qué tiene sentido montar ahora y qué no.',
        },
      ],
    },
    diagnostic: {
      title: 'Solicita un diagnóstico gratuito',
      description: 'Cuéntame cómo entra hoy un cliente y te diré por dónde empezaría.',
      checklist: [
        'Revisión rápida de tu sistema actual',
        'Detección de bloqueos',
        'Recomendación clara de por dónde empezar',
        'Sin presión comercial',
      ],
      steps: [
        'Revisamos tu caso',
        'Te decimos qué montaría primero',
        'Tú decides si tiene sentido avanzar',
      ],
      successTitle: 'Solicitud recibida',
      successDescription: 'Gracias. Revisaré tu caso y te responderé en un día laborable.',
      resend: 'Enviar otra solicitud',
      fields: {
        nameLabel: 'Nombre',
        namePlaceholder: 'Tu nombre',
        emailLabel: 'Email',
        emailPlaceholder: 'tu@email.com',
        companyLabel: 'Empresa',
        companyPlaceholder: 'Nombre de tu empresa',
        messageLabel: '¿Qué está fallando ahora mismo en tu captación o seguimiento?',
        messagePlaceholder: 'Cuéntame qué está fallando o dónde se está perdiendo tiempo',
      },
      privacyPrefix: 'He leído y acepto la',
      privacyLink: 'Política de privacidad',
      submit: 'Solicitar diagnóstico gratuito',
      legalNote: 'Nada de spam. Solo usaremos tus datos para responder a tu solicitud.',
      errors: {
        generic: 'Ha ocurrido un error. Vuelve a intentarlo en unos segundos.',
        unavailable: 'El formulario no está disponible ahora mismo. Vuelve a intentarlo más tarde.',
        preparing: 'El formulario se está preparando. Espera unos segundos y vuelve a intentarlo.',
        antiSpam: 'Completa la verificación antispam antes de enviar la solicitud.',
        misconfigured: 'Falta configurar la protección antispam del formulario.',
        sendFailed: 'No se pudo enviar tu solicitud.',
      },
    },
    cookies: {
      bannerTitle: 'Preferencias de cookies',
      legalCopy:
        'Usamos cookies propias y de terceros para fines técnicos, analíticos y, en su caso, de personalización y marketing. Puedes aceptar, rechazar o configurar tus preferencias. Las cookies no necesarias permanecerán bloqueadas hasta que elijas.',
      policyLinkLabel: 'Política de cookies',
      renewalMessage: 'Hemos renovado este panel para revisar tu consentimiento.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      configure: 'Configurar',
      floatingLabel: 'Cookies',
      technicalOnlyMessage: 'Solo usamos cookies técnicas mientras no actives categorías opcionales.',
      dialogTitle: 'Configurar cookies',
      dialogHeading: 'Elige qué categorías quieres activar',
      preferencesIntro:
        'Activa solo las categorías opcionales que quieras. Las no necesarias seguirán bloqueadas hasta que decidas.',
      openAria: 'Abrir preferencias de cookies',
      closeAria: 'Cerrar preferencias de cookies',
      close: 'Cerrar',
      save: 'Guardar selección',
      acceptAll: 'Aceptar todo',
      rejectAll: 'Rechazar',
      openPolicy: 'Abrir Política de cookies',
      withdrawText:
        'Puedes retirar o modificar tu consentimiento cuando quieras desde el botón flotante Cookies. Los servicios no esenciales se mantendrán bloqueados hasta tu elección.',
      categories: {
        necessary: {
          title: 'Necesarias',
          description:
            'Permiten funciones básicas como la seguridad, la navegación y la gestión de tus preferencias de consentimiento.',
          note: 'Siempre activas',
        },
        analytics: {
          title: 'Analíticas',
          description:
            'Nos ayudan a entender cómo se usa la web para mejorar rendimiento, contenidos y experiencia.',
          note: 'Desactivadas por defecto hasta tu consentimiento',
        },
        preferences: {
          title: 'Preferencias',
          description:
            'Guardan elecciones no esenciales, como personalización básica o ajustes de experiencia.',
          note: 'Desactivadas por defecto hasta tu consentimiento',
        },
        marketing: {
          title: 'Marketing',
          description:
            'Permiten medir campañas, personalizar anuncios o activar herramientas de seguimiento comercial.',
          note: 'Desactivadas por defecto hasta tu consentimiento',
        },
      },
    },
    footer: {
      copyright: '© 2026 Nexo Base. Webs y sistemas de captación para negocios.',
    },
    finalCta: {
      title: 'Si hoy entran contactos pero el sistema no acompaña, estás perdiendo parte del trabajo.',
      highlight: '',
      description: 'Cuéntame cómo funciona hoy tu captación y te diré por dónde empezaría.',
      button: 'Solicitar diagnóstico gratuito',
      note: 'Respuesta en 24h. Sin presión.',
    },
  },
  en: {
    metadata: {
      htmlLang: 'en',
      title: 'Nexo Base | Websites and lead systems for businesses',
      description:
        'Your website should capture leads. We design a clear base to capture better today and expand later without rebuilding everything.',
      ogLocale: 'en_US',
      ogTitle: 'Nexo Base | Websites and lead systems for businesses',
      ogDescription:
        'Your website should capture leads. We design a clear base to capture better today and expand later without rebuilding everything.',
      imageAlt: 'Nexo Base logo on a black background',
    },
    nav: {
      system: 'System',
      howItWorks: 'How it works',
      services: 'Services',
      faq: 'FAQ',
      mobileCta: 'Diagnostic',
      desktopCta: 'Request a free diagnostic',
      languageAria: 'Change language',
    },
    languageGate: {
      eyebrow: 'Nexo Base',
      title: 'Choose your language',
      description:
        'You can switch anytime from the top bar. We will remember your choice on this device.',
      spanish: 'Español',
      english: 'English',
      helper: 'A clean, premium entry point from the very first second.',
    },
    legalLinks: {
      notice: { label: 'Legal notice', href: '/aviso-legal/' },
      privacy: { label: 'Privacy policy', href: '/politica-privacidad/' },
      cookies: { label: 'Cookie policy', href: '/politica-cookies/' },
      terms: { label: 'Terms', href: '/condiciones/' },
    },
    hero: {
      eyebrow: 'Website and lead system for businesses',
      title: 'Your website should capture leads.',
      highlight: 'Your system should stop opportunities from slipping away.',
      description:
        'Start with a clear base to capture better today and expand later without rebuilding everything.',
      cta: 'Request a free diagnostic',
      supportPrimary: 'Reply within 24h',
      supportSecondary: 'We will tell you where we would start',
      visualTitle: 'Layered system',
      visualFooter: 'Start with the base. Expand without rebuilding everything.',
      cards: [
        {
          title: 'Lead website',
          copy: 'A clear page that makes it easy to get in touch.',
        },
        {
          title: 'Opportunity tracking',
          copy: 'Visibility into every contact and the next step.',
        },
        {
          title: 'Online bookings',
          copy: 'Easier bookings, more time for the team.',
        },
        {
          title: 'SEO Optimization',
          copy: 'Attract visits from customers with buying intent.',
        },
        {
          title: 'Automations and payments',
          copy: 'Reminders, confirmations and payments without chaos.',
        },
      ],
    },
    whoItsFor: {
      title: 'Contacts are coming in, but the system is not keeping up',
      description:
        'If lead capture, follow-up and bookings are not connected, the lead cools off and opportunities you had already generated get lost.',
      positiveTitle: 'This is for you if',
      positive: [
        'Your current website is not designed to convert',
        'Contacts come in through several channels and it is hard to keep a clear view',
        'Follow-up depends too much on WhatsApp or manual processes',
        'You want a serious base to grow without improvising',
      ],
      negativeTitle: 'This is not for you if',
      negative: [
        'You only want a pretty website',
        'You do not want to review processes or change systems',
        'Your business still does not have a real flow of opportunities',
        'You expect results without changes',
      ],
    },
    systemLayers: {
      title: 'Start with the base. Expand when it truly makes sense.',
      description:
        'We build what has the biggest impact first. Everything else gets added when the business actually needs it.',
      addOnsTitle: 'Add-ons when they make sense',
      addOns: ['Automated emails', 'Online payments', 'Client portal'],
      layers: [
        {
          title: 'Lead website',
          text: 'A clear page so the client can get in touch easily and your team can receive each opportunity better.',
        },
        {
          title: 'Opportunity tracking',
          text: 'Visibility into every contact, their status and the next step.',
        },
        {
          title: 'Online bookings',
          text: 'Less friction when booking, more time for the team.',
        },
        {
          title: 'SEO Optimization',
          text: 'Attract traffic from customers actively searching for your services.',
        },
        {
          title: 'Automations',
          text: 'Reminders and repetitive tasks that stop depending on the team.',
        },
      ],
    },
    howItWorks: {
      title: 'How we work',
      steps: [
        {
          num: '01',
          title: 'We spot where it breaks',
          text: 'We review lead capture, follow-up and real bottlenecks.',
        },
        {
          num: '02',
          title: 'We prioritize impact',
          text: 'We start with what improves order, response and conversion the most.',
        },
        {
          num: '03',
          title: 'We build what is needed',
          text: 'We design the website and the modules that actually make sense.',
        },
        {
          num: '04',
          title: 'We launch and expand',
          text: 'You start with the essentials and expand without rebuilding everything.',
        },
      ],
    },
    pricing: {
      title: 'Our Services',
      description: 'Different starting points designed to solve specific problems.',
      availability: 'Check availability',
      note: 'You can also start with the website and add the rest later.',
      modulesTitle: 'Optional modules',
      askUs: 'Ask us',
      maintenanceTitle: 'Maintenance and support',
      maintenanceDescription:
        'So the system keeps working without you having to deal with the technical side.',
      maintenanceFeatures: [
        'Security and support',
        'Backups',
        'System maintenance',
        'Integrations and small changes',
      ],
      packs: [
        {
          name: 'Lead website',
          price: 'Ask us',
          text: 'The base to capture better and respond better.',
          includes: [
            'Lead-focused page',
            'Clear form',
            'WhatsApp button',
            'Conversion-focused structure',
          ],
        },
        {
          name: 'Lead system',
          price: 'Custom',
          text: 'For businesses that need more order, follow-up, bookings and SEO.',
          includes: [
            'Lead website',
            'Opportunity tracking',
            'Online bookings',
            'Basic SEO optimization'
          ],
        },
        {
          name: 'Full system',
          price: 'Custom',
          text: 'The most complete option to capture, organize, rank and automate.',
          includes: [
            'Lead website',
            'Opportunity tracking',
            'Online bookings',
            'Advanced SEO optimization',
            'Automated emails and online payments',
          ],
        },
      ],
      modules: [
        'Opportunity tracking',
        'Online bookings',
        'SEO Optimization',
        'Automated emails',
        'Online payments',
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Do I need to build everything from the start?',
          a: 'No. Very often the smartest move is to start with the lead website and add the rest when the business actually asks for it.',
        },
        {
          q: 'Can I start with just the website?',
          a: 'Yes. It is the most logical base if what you need right now is to improve how contacts come in.',
        },
        {
          q: 'What if I already have a website or a CRM?',
          a: 'We review it. If something you already have is useful, we keep it. The idea is not to rebuild just for the sake of it.',
        },
        {
          q: 'Does this work for any kind of business?',
          a: 'Yes. It fits businesses that need to capture better, follow up properly and reduce manual chaos in their commercial operation.',
        },
        {
          q: 'How long does it take to be ready?',
          a: 'It depends on the scope. A simple lead website does not take the same time as a full system. We define that in the diagnostic.',
        },
        {
          q: 'What does the monthly maintenance include?',
          a: 'It includes support, security, backups, system maintenance and small changes so everything keeps working without friction.',
        },
        {
          q: 'Is the diagnostic a disguised sales call?',
          a: 'No. The goal is to tell you what makes sense to build now and what does not.',
        },
      ],
    },
    diagnostic: {
      title: 'Request a free diagnostic',
      description: 'Tell me how a client comes in today and I will tell you where I would start.',
      checklist: [
        'Quick review of your current setup',
        'Bottleneck detection',
        'Clear recommendation on where to start',
        'No sales pressure',
      ],
      steps: [
        'We review your case',
        'We tell you what we would build first',
        'You decide whether it makes sense to move forward',
      ],
      successTitle: 'Request received',
      successDescription: 'Thanks. I will review your case and reply within one business day.',
      resend: 'Send another request',
      fields: {
        nameLabel: 'Name',
        namePlaceholder: 'Your name',
        emailLabel: 'Email',
        emailPlaceholder: 'your@email.com',
        companyLabel: 'Company',
        companyPlaceholder: 'Your company name',
        messageLabel: 'What is failing right now in your lead capture or follow-up?',
        messagePlaceholder: 'Tell me what is failing or where time is being lost',
      },
      privacyPrefix: 'I have read and accept the',
      privacyLink: 'Privacy policy',
      submit: 'Request a free diagnostic',
      legalNote: 'No spam. We will only use your data to reply to your request.',
      errors: {
        generic: 'An error occurred. Try again in a few seconds.',
        unavailable: 'The form is not available right now. Try again later.',
        preparing: 'The form is still being prepared. Wait a few seconds and try again.',
        antiSpam: 'Complete the anti-spam check before sending your request.',
        misconfigured: 'The form anti-spam protection is not configured yet.',
        sendFailed: 'Your request could not be sent.',
      },
    },
    cookies: {
      bannerTitle: 'Cookie preferences',
      legalCopy:
        'We use first-party and third-party cookies for technical, analytics and, where relevant, personalization and marketing purposes. You can accept, reject or configure your preferences. Non-essential cookies will remain blocked until you choose.',
      policyLinkLabel: 'Cookie policy',
      renewalMessage: 'We have refreshed this panel to review your consent.',
      accept: 'Accept',
      reject: 'Reject',
      configure: 'Configure',
      floatingLabel: 'Cookies',
      technicalOnlyMessage: 'We only use technical cookies until you enable optional categories.',
      dialogTitle: 'Configure cookies',
      dialogHeading: 'Choose which categories you want to enable',
      preferencesIntro:
        'Enable only the optional categories you want. Non-essential ones will stay blocked until you decide.',
      openAria: 'Open cookie preferences',
      closeAria: 'Close cookie preferences',
      close: 'Close',
      save: 'Save selection',
      acceptAll: 'Accept all',
      rejectAll: 'Reject',
      openPolicy: 'Open cookie policy',
      withdrawText:
        'You can withdraw or change your consent at any time from the floating Cookies button. Non-essential services will remain blocked until you choose.',
      categories: {
        necessary: {
          title: 'Necessary',
          description:
            'They enable basic functions such as security, navigation and consent preference management.',
          note: 'Always active',
        },
        analytics: {
          title: 'Analytics',
          description:
            'They help us understand how the website is used so we can improve performance, content and experience.',
          note: 'Disabled by default until you consent',
        },
        preferences: {
          title: 'Preferences',
          description:
            'They store non-essential choices such as basic personalization or experience settings.',
          note: 'Disabled by default until you consent',
        },
        marketing: {
          title: 'Marketing',
          description:
            'They allow campaign measurement, ad personalization or commercial tracking tools.',
          note: 'Disabled by default until you consent',
        },
      },
    },
    footer: {
      copyright: '© 2026 Nexo Base. Websites and lead systems for businesses.',
    },
    finalCta: {
      title: 'If contacts are coming in today but the system is not keeping up, you are losing part of the work.',
      highlight: '',
      description: 'Tell me how your lead flow works today and I will tell you where I would start.',
      button: 'Request a free diagnostic',
      note: 'Reply within 24h. No pressure.',
    },
  },
} as const;

type SiteCopy = (typeof siteCopy)[Language];

interface LanguageContextValue {
  language: Language;
  copy: SiteCopy;
  showSelector: boolean;
  setLanguage: (language: Language) => void;
  openSelector: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readLanguageCookie(): Language | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookieValue = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${COOKIE_KEY}=`))
    ?.split('=')
    .slice(1)
    .join('=');

  if (cookieValue === 'es' || cookieValue === 'en') {
    return cookieValue;
  }

  return null;
}

function writeLanguageCookie(language: Language) {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_KEY}=${language}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
}

function detectInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'es';
  }

  const stored = readLanguageCookie();

  if (stored) {
    return stored;
  }

  return window.navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

function updateMetaTag(selector: string, value: string) {
  const element = document.querySelector<HTMLMetaElement>(selector);

  if (element) {
    element.content = value;
  }
}

function applyMetadata(copy: SiteCopy) {
  document.documentElement.lang = copy.metadata.htmlLang;
  document.title = copy.metadata.title;
  updateMetaTag('meta[name="description"]', copy.metadata.description);
  updateMetaTag('meta[property="og:locale"]', copy.metadata.ogLocale);
  updateMetaTag('meta[property="og:title"]', copy.metadata.ogTitle);
  updateMetaTag('meta[property="og:description"]', copy.metadata.ogDescription);
  updateMetaTag('meta[property="og:image:alt"]', copy.metadata.imageAlt);
  updateMetaTag('meta[name="twitter:title"]', copy.metadata.ogTitle);
  updateMetaTag('meta[name="twitter:description"]', copy.metadata.ogDescription);
  updateMetaTag('meta[name="twitter:image:alt"]', copy.metadata.imageAlt);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => detectInitialLanguage());
  const [showSelector, setShowSelector] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return !readLanguageCookie();
  });

  const copy = useMemo(() => siteCopy[language], [language]);

  useEffect(() => {
    applyMetadata(copy);
  }, [copy]);

  useEffect(() => {
    document.body.classList.toggle('language-gate-lock', showSelector);

    return () => {
      document.body.classList.remove('language-gate-lock');
    };
  }, [showSelector]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    writeLanguageCookie(nextLanguage);
    setShowSelector(false);
  };

  const openSelector = () => {
    setShowSelector(true);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        copy,
        showSelector,
        setLanguage,
        openSelector,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
