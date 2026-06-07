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
      eyebrow: 'Web y sistema de captación para negocios en España',
      title: 'Tu web debería atraer clientes.',
      highlight: 'Tu sistema debería evitar que se pierdan.',
      description:
        'Diseñamos webs de captación y sistemas de seguimiento para pequeñas y medianas empresas que quieren captar más clientes, responder mejor y crecer de forma estructurada.',
      cta: 'Solicitar diagnóstico gratuito',
      supportPrimary: 'Respuesta en 24h',
      supportSecondary: 'Te diremos por dónde empezaríamos',
      visualTitle: 'Sistema por capas',
      visualFooter: 'Empieza por la base. Amplía sin rehacerlo todo.',
      cards: [
        {
          title: 'Web de captación',
          copy: 'Página visual y enfocada en conversión',
        },
        {
          title: 'Posicionamiento SEO',
          copy: 'Atrae visitas de clientes con intención de compra.',
        },
        {
          title: 'Seguimiento de oportunidades',
          copy: 'Control sobre cada contacto y su siguiente paso.',
        },
        {
          title: 'Reservas online',
          copy: 'Sistema de reservas más rápidas, más tiempo para el equipo.',
        },
        {
          title: 'Automatizaciones y pagos',
          copy: 'Recordatorios, confirmaciones y cobros organizados.',
        },
      ],
    },
    whoItsFor: {
      title: 'Captas contactos, pero se pierden antes de convertirse en clientes',
      description:
        'Muchos negocios en España tienen tráfico web y contactos entrantes, pero sin un sistema que conecte captación, seguimiento y reservas, las oportunidades se enfrían. No es un problema de volumen: es un problema de orden y procesos.',
      positiveTitle: 'Esto es para ti si',
      positive: [
        'Tu web no está diseñada para convertir visitas en clientes',
        'Recibes consultas por varios canales (web, WhatsApp, redes) y pierdes el hilo',
        'El seguimiento de clientes depende de memoria, excel, hojas de calculo o mensajes de WhatsApp',
        'Quieres un sistema de captación profesional para crecer de forma organizada.',
      ],
      negativeTitle: 'Esto no es para ti si',
      negative: [
        'Solo quieres una web informacional sin objetivo de vender',
        'No estás dispuesto a revisar cómo entran y se gestionan tus clientes potenciales',
        'Tu negocio todavía no tiene un flujo estable de contactos o clientes potenciales',
        'Buscas resultados sin tocar procesos',
      ],
    },
    systemLayers: {
      title: 'Empieza por prioritario. Amplía cuando el negocio lo pida.',
      description:
        'No hace falta montarlo todo a la vez. Construimos primero la web y el sistema de captación que más resultado tiene para tu negocio, y añadimos el resto cuando de verdad tiene sentido.',
      addOnsTitle: 'Ampliaciones disponibles cuando tenga sentido',
      addOns: [
        'Emails automáticos para nutrir y recuperar contactos',
        'Pagos online integrados en el proceso de reserva o captación',
        'Área privada de clientes',
      ],
      layers: [
        {
          title: 'Web de captación',
          text: 'Diseño web orientado a conversión: página visual y moderna, pensada para que el cliente potencial contacte fácil y tu equipo reciba oportunidades ya filtradas.',
        },
        {
          title: 'Posicionamiento SEO',
          text: 'Atrae tráfico cualificado de clientes que ya buscan tus servicios en Google. Sin depender solo de recomendaciones o redes sociales.',
        },
        {
          title: 'Seguimiento de oportunidades',
          text: 'Gestión de contactos centralizada: visibilidad sobre cada cliente potencial, en qué punto está y cuál es el siguiente paso.',
        },
        {
          title: 'Reservas online',
          text: 'Sistema de reservas integrado en tu web. Más rápido para el cliente, menos gestión manual para tu equipo.',
        },
        {
          title: 'Automatizaciones',
          text: 'Recordatorios, confirmaciones y tareas repetitivas que se ejecutan solas. Tu equipo deja de cargar con el sistema.',
        },
      ],
    },
    howItWorks: {
      title: 'Cómo trabajamos',
      description: 'Un proceso de cuatro pasos para montar el sistema de captación que tu negocio necesita, sin pagar por lo que no tiene sentido todavía.',
      steps: [
        {
          num: '01',
          title: 'Analizamos dónde se pierden oportunidades',
          text: 'Revisamos cómo entra un cliente hoy: web, canales de contacto, seguimiento y puntos donde puede estar fallando el proceso.',
        },
        {
          num: '02',
          title: 'Priorizamos lo que más impacto tiene',
          text: 'Identificamos los cambios que mejoran más la captación, la respuesta y la conversión de contactos en clientes.',
        },
        {
          num: '03',
          title: 'Construimos lo necesario',
          text: 'Diseñamos la web y montamos la estructura que resuelve los problemas cotidianos de tu negocio, sin añadir complejidad innecesaria.',
        },
        {
          num: '04',
          title: 'Lanzamos y ampliamos sin rehacerlo todo',
          text: 'Empiezas con una base sólida. Cada ampliación se añade encima sin tirar lo anterior.',
        },
      ],
    },
    pricing: {
      title: 'Nuestros Servicios',
      description: 'Tres puntos de partida para negocios en España que quieren captar mejor, gestionar más oportunidades y crecer con un sistema optimizado.',
      availability: 'Consultar disponibilidad',
      note: 'También puedes empezar por la web y añadir lo demás más adelante.',
      modulesTitle: 'Módulos opcionales',
      modulesDescription: 'Añade solo lo que tu negocio necesita, cuando lo necesita. Cada módulo se integra sobre la base sin rehacerlo todo.',
      askUs: 'Consultar',
      maintenanceTitle: 'Mantenimiento y soporte técnico',
      maintenanceDescription:
        'Para que el sistema siga funcionando sin que tengas que ocuparte de la parte técnica.',
      maintenanceFeatures: [
        'Seguridad web y soporte continuo',
        'Copias de seguridad automáticas',
        'Mantenimiento y actualizaciones del sistema',
        'Integraciones y ajustes sobre lo ya construido',
      ],
      packs: [
        {
          name: 'Web de captación',
          price: 'Consultar',
          text: 'La base para que tu web deje de ser solo un escaparate y empiece a atraer nuevos contactos.',
          includes: [
            'Diseño web orientado a conversión',
            'Formulario de contacto optimizado',
            'Botón de WhatsApp integrado',
            'Estructura pensada para convertir visitas en clientes potenciales',
          ],
        },
        {
          name: 'Sistema de captación',
          price: 'A medida',
          text: 'Para negocios que necesitan posicionamiento, seguimiento de clientes y presencia en Google.',
          includes: [
            'Web de captación incluida',
            'Posicionamiento SEO local y nacional',
            'Gestión y seguimiento de oportunidades',
            'Sistema de reservas online',
          ],
        },
        {
          name: 'Sistema completo',
          price: 'A medida',
          text: 'La solución más completa para captar, posicionar, automatizar y escalar.',
          includes: [
            'Web de captación incluida',
            'Posicionamiento SEO avanzado',
            'Gestión y seguimiento de oportunidades',
            'Sistema de reservas online',
            'Email marketing automatizado y pagos online integrados',
          ],
        },
      ],
      modules: [
        'Posicionamiento SEO — Atrae clientes desde Google con una estrategia de SEO local o nacional',
        'Seguimiento de oportunidades — Gestión de contactos y clientes potenciales en un solo lugar',
        'Reservas online — Sistema de reservas integrado en tu web, sin gestión manual',
        'Email marketing automatizado — Secuencias automáticas para nutrir contactos y recuperar oportunidades',
        'Pagos online — Cobros integrados en el proceso de reserva o captación',
      ],
    },
    faq: {
      title: 'Preguntas frecuentes',
      items: [
        {
          q: '¿Tengo que montar todo desde el principio?',
          a: 'No. Lo más habitual es empezar por la web de captación y añadir módulos según lo que el negocio vaya necesitando. Cada pieza se construye sobre la anterior, así que no hay que rehacer nada cuando decides ampliar. Muchos negocios en España empiezan solo por la web y en pocas semanas ya tienen claro qué necesitan añadir.',
        },
        {
          q: '¿Puedo empezar solo por la web?',
          a: 'Sí, y muchas veces es lo más lógico. Si tu problema principal es que tu web actual no convierte visitas en contactos, empezamos por ahí. El resto del sistema de captación se puede añadir después, cuando tenga sentido, sin tocar lo que ya está funcionando.',
        },
        {
          q: '¿Y si ya tengo web o CRM?',
          a: 'Depende de lo que tengas y de cómo esté funcionando. Si tu web actual ya capta bien, no la tocamos. Si tienes un CRM pero no lo estás usando de forma efectiva, revisamos si tiene sentido integrarlo o simplificarlo. El objetivo no es vender herramientas nuevas, sino que el sistema funcione.',
        },
        {
          q: '¿Esto sirve para cualquier tipo de negocio?',
          a: 'Está pensado para pequeñas y medianas empresas en España que ya tienen un flujo de clientes potenciales pero pierden oportunidades por falta de sistema. Funciona bien en sectores de servicios: clínicas, asesorías, inmobiliarias, academias, centros de bienestar, empresas B2B y negocios locales con ticket medio o alto.',
        },
        {
          q: '¿Cuánto tarda en estar listo?',
          a: 'Una web de captación básica suele estar lista en dos o tres semanas. Un sistema de captación completo, con SEO, seguimiento y reservas, entre cuatro y seis semanas dependiendo del negocio. Te damos un plazo claro antes de empezar, sin sorpresas.',
        },
        {
          q: '¿Qué incluye el mantenimiento mensual?',
          a: 'Seguridad web, copias de seguridad automáticas, actualizaciones del sistema y soporte para ajustes e integraciones menores. El objetivo es que el sistema siga funcionando sin que tengas que ocuparte de la parte técnica ni depender de un desarrollador para cada pequeño cambio.',
        },
        {
          q: '¿El diagnóstico es una venta encubierta?',
          a: 'No. El diagnóstico es una revisión real de cómo está entrando hoy un cliente en tu negocio: qué está funcionando, dónde se pierden oportunidades y por dónde tendría más sentido empezar. Si después de eso decides que no quieres avanzar, no pasa nada. No hay presión ni seguimiento comercial agresivo.',
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
      eyebrow: 'Website and lead system for businesses in Spain',
      title: 'Your website should attract clients.',
      highlight: 'Your system should stop them from slipping away.',
      description:
        'We design lead websites and tracking systems for small and medium-sized businesses that want to capture more clients, respond better and grow in a structured way.',
      cta: 'Request a free diagnostic',
      supportPrimary: 'Reply within 24h',
      supportSecondary: 'We will tell you where we would start',
      visualTitle: 'Layered system',
      visualFooter: 'Start with the base. Expand without rebuilding everything.',
      cards: [
        {
          title: 'Lead website',
          copy: 'Visual page focused on conversion',
        },
        {
          title: 'SEO Optimization',
          copy: 'Attract visits from customers with buying intent.',
        },
        {
          title: 'Opportunity tracking',
          copy: 'Control over each contact and their next step.',
        },
        {
          title: 'Online bookings',
          copy: 'Faster booking system, more time for the team.',
        },
        {
          title: 'Automations and payments',
          copy: 'Organized reminders, confirmations and payments.',
        },
      ],
    },
    whoItsFor: {
      title: 'You capture leads, but they get lost before converting into clients',
      description:
        "Many businesses in Spain have web traffic and incoming contacts, but without a system that connects lead capture, follow-up and bookings, opportunities cool down. It's not a volume problem: it's an order and process problem.",
      positiveTitle: 'This is for you if',
      positive: [
        'Your website is not designed to convert visits into clients',
        'You receive inquiries through multiple channels (web, WhatsApp, social media) and lose track',
        'Client follow-up depends on memory, Excel, spreadsheets or WhatsApp messages',
        'You want a professional capture system to grow in an organized way.',
      ],
      negativeTitle: 'This is not for you if',
      negative: [
        'You only want an informational website with no goal of selling',
        'You are not willing to review how your potential clients are captured and managed',
        'Your business doesn\'t have a stable flow of contacts or potential clients yet',
        'You are looking for results without changing processes',
      ],
    },
    systemLayers: {
      title: 'Start with what matters most. Expand when the business demands it.',
      description:
        'No need to build everything at once. We start with the website and lead system that delivers the most impact for your business, and add the rest when it truly makes sense.',
      addOnsTitle: 'Available add-ons when they make sense',
      addOns: [
        'Automated emails to nurture and recover contacts',
        'Online payments integrated into the booking or lead capture process',
        'Private client portal',
      ],
      layers: [
        {
          title: 'Lead website',
          text: 'Conversion-focused web design: a visual and modern page, built so potential clients can get in touch easily and your team receives pre-filtered opportunities.',
        },
        {
          title: 'SEO Optimization',
          text: 'Attract qualified traffic from clients already searching for your services on Google. Without relying only on referrals or social media.',
        },
        {
          title: 'Opportunity tracking',
          text: 'Centralised contact management: visibility into each potential client, where they are in the process and what the next step is.',
        },
        {
          title: 'Online bookings',
          text: 'Booking system integrated into your website. Faster for the client, less manual management for your team.',
        },
        {
          title: 'Automations',
          text: 'Reminders, confirmations and repetitive tasks that run on their own. Your team stops carrying the system.',
        },
      ],
    },
    howItWorks: {
      title: 'How we work',
      description: 'A four-step process to build the lead capture system your business needs, without paying for what does not make sense yet.',
      steps: [
        {
          num: '01',
          title: 'We analyse where opportunities are being lost',
          text: 'We review how a client finds you today: website, contact channels, follow-up and the points where the process may be failing.',
        },
        {
          num: '02',
          title: 'We prioritise what has the most impact',
          text: 'We identify the changes that most improve lead capture, response time and the conversion of contacts into clients.',
        },
        {
          num: '03',
          title: 'We build what is needed',
          text: 'We design the website and set up the structure that solves your day-to-day business problems, without adding unnecessary complexity.',
        },
        {
          num: '04',
          title: 'We launch and expand without rebuilding everything',
          text: 'You start with a solid foundation. Each addition is built on top without throwing away what came before.',
        },
      ],
    },
    pricing: {
      title: 'Our Services',
      description: 'Three starting points for businesses in Spain that want to capture more leads, manage more opportunities and grow with an optimised system.',
      availability: 'Check availability',
      note: 'You can also start with the website and add the rest later.',
      modulesTitle: 'Optional modules',
      modulesDescription: 'Add only what your business needs, when it needs it. Each module integrates on top of the base without rebuilding everything.',
      askUs: 'Ask us',
      maintenanceTitle: 'Maintenance and technical support',
      maintenanceDescription:
        'So the system keeps working without you having to deal with the technical side.',
      maintenanceFeatures: [
        'Web security and ongoing support',
        'Automatic backups',
        'System maintenance and updates',
        'Integrations and adjustments on what is already built',
      ],
      packs: [
        {
          name: 'Lead website',
          price: 'Ask us',
          text: 'The base to stop your website being just a shop window and start attracting new contacts.',
          includes: [
            'Conversion-focused web design',
            'Optimised contact form',
            'Integrated WhatsApp button',
            'Structure built to convert visits into potential clients',
          ],
        },
        {
          name: 'Lead system',
          price: 'Custom',
          text: 'For businesses that need SEO, client follow-up and a presence on Google.',
          includes: [
            'Lead website included',
            'Local and national SEO positioning',
            'Opportunity management and tracking',
            'Online booking system',
          ],
        },
        {
          name: 'Full system',
          price: 'Custom',
          text: 'The most complete solution to capture, rank, automate and scale.',
          includes: [
            'Lead website included',
            'Advanced SEO positioning',
            'Opportunity management and tracking',
            'Online booking system',
            'Automated email marketing and integrated online payments',
          ],
        },
      ],
      modules: [
        'SEO Optimization — Attract clients from Google with a local or national SEO strategy',
        'Opportunity tracking — Contact and lead management in one place',
        'Online bookings — Booking system integrated into your website, no manual management',
        'Automated email marketing — Automatic sequences to nurture contacts and recover opportunities',
        'Online payments — Payments integrated into the booking or lead capture process',
      ],
    },
    faq: {
      title: 'Frequently asked questions',
      items: [
        {
          q: 'Do I need to build everything from the start?',
          a: 'No. The most common approach is to start with the lead website and add modules as the business needs them. Each piece builds on the previous one, so nothing needs to be rebuilt when you decide to expand. Many businesses in Spain start with just the website and within a few weeks they already know what they need to add.',
        },
        {
          q: 'Can I start with just the website?',
          a: 'Yes, and it is often the most logical move. If your main problem is that your current website does not convert visits into contacts, we start there. The rest of the lead system can be added later, when it makes sense, without touching what is already working.',
        },
        {
          q: 'What if I already have a website or a CRM?',
          a: 'It depends on what you have and how it is working. If your current website already captures leads well, we leave it alone. If you have a CRM but are not using it effectively, we review whether it makes sense to integrate or simplify it. The goal is not to sell new tools, but to make the system work.',
        },
        {
          q: 'Does this work for any kind of business?',
          a: 'It is designed for small and medium-sized businesses in Spain that already have a flow of potential clients but are losing opportunities due to lack of system. It works well in service sectors: clinics, advisory firms, estate agencies, academies, wellness centres, B2B companies and local businesses with a medium or high ticket.',
        },
        {
          q: 'How long does it take to be ready?',
          a: 'A basic lead website is usually ready in two to three weeks. A full lead system, with SEO, tracking and bookings, takes between four and six weeks depending on the business. We give you a clear timeline before starting, no surprises.',
        },
        {
          q: 'What does the monthly maintenance include?',
          a: 'Web security, automatic backups, system updates and support for minor adjustments and integrations. The goal is to keep the system running without you having to deal with the technical side or depend on a developer for every small change.',
        },
        {
          q: 'Is the diagnostic a disguised sales call?',
          a: 'No. The diagnostic is a real review of how a client is entering your business today: what is working, where opportunities are being lost and where it would make most sense to start. If after that you decide you do not want to move forward, that is fine. There is no pressure or aggressive commercial follow-up.',
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

  return 'es';
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
  const [showSelector, setShowSelector] = useState(false);

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
