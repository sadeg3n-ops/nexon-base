import { CookieConsentManager } from './manager';

export * from './types';

export const cookieConsentManager = new CookieConsentManager({
  version: '2026-04-cookie-consent-v2',
  policyUrl: '/politica-cookies/',
  technicalOnlyMode: false,
  renewalDays: 730,
  enableGoogleConsentMode: true,
});
