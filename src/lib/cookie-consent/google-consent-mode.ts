import type { ConsentPreferences } from './types';

type GoogleConsentState = 'granted' | 'denied';

interface GoogleConsentPayload {
  analytics_storage: GoogleConsentState;
  ad_storage: GoogleConsentState;
  ad_user_data: GoogleConsentState;
  ad_personalization: GoogleConsentState;
  functionality_storage: GoogleConsentState;
  personalization_storage: GoogleConsentState;
  security_storage: GoogleConsentState;
}

function ensureGoogleConsentScaffold() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
}

export function getDefaultGoogleConsentPayload(): GoogleConsentPayload {
  return {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
  };
}

export function getGoogleConsentPayload(preferences: ConsentPreferences): GoogleConsentPayload {
  return {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
    functionality_storage: preferences.preferences ? 'granted' : 'denied',
    personalization_storage: preferences.preferences ? 'granted' : 'denied',
    security_storage: 'granted',
  };
}

export function applyDefaultGoogleConsentMode() {
  if (typeof window === 'undefined') {
    return;
  }

  ensureGoogleConsentScaffold();
  window.gtag?.('consent', 'default', getDefaultGoogleConsentPayload());
}

export function updateGoogleConsentMode(preferences: ConsentPreferences) {
  if (typeof window === 'undefined') {
    return;
  }

  ensureGoogleConsentScaffold();
  window.gtag?.('consent', 'update', getGoogleConsentPayload(preferences));
}
