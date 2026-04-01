/// <reference types="vite/client" />

import type { CookieConsentApi } from './lib/cookie-consent';

declare global {
  interface Window {
    CookieConsent?: CookieConsentApi;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => string | number;
      reset: (widgetId?: string | number) => void;
    };
  }
}

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
