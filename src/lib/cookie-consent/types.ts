export const COOKIE_CATEGORIES = ['necessary', 'analytics', 'preferences', 'marketing'] as const;
export const OPTIONAL_COOKIE_CATEGORIES = COOKIE_CATEGORIES.filter(
  (category) => category !== 'necessary'
) as OptionalCookieCategory[];

export type CookieCategory = (typeof COOKIE_CATEGORIES)[number];
export type OptionalCookieCategory = Exclude<CookieCategory, 'necessary'>;
export type ConsentSource = 'accept_all' | 'reject_all' | 'custom' | 'implicit_technical_only';

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

export interface StoredConsentDecision {
  version: string;
  timestamp: string;
  expiresAt: string;
  source: ConsentSource;
  preferences: ConsentPreferences;
}

export interface StoredConsentState {
  decision: StoredConsentDecision | null;
  renewalDue: boolean;
}

export interface ConsentSnapshot {
  decision: StoredConsentDecision | null;
  preferences: ConsentPreferences;
  policyUrl: string;
  technicalOnlyMode: boolean;
  shouldShowBanner: boolean;
  shouldShowFloatingButton: boolean;
  isConsentRequired: boolean;
  isRenewalDue: boolean;
  version: string;
}

export interface ConsentChangeContext {
  source: ConsentSource | 'hydrate' | 'reset';
  previous: StoredConsentDecision | null;
  current: StoredConsentDecision | null;
}

export type ConsentListener = (
  snapshot: ConsentSnapshot,
  context: ConsentChangeContext
) => void;

export interface ConsentManagerOptions {
  version: string;
  policyUrl: string;
  storageKey?: string;
  renewalDays?: number;
  technicalOnlyMode?: boolean;
  enableGoogleConsentMode?: boolean;
  onChange?: ConsentListener;
}

export interface CookieConsentApi {
  hasConsent: (category: CookieCategory) => boolean;
  acceptAll: () => StoredConsentDecision;
  rejectAll: () => StoredConsentDecision;
  savePreferences: (
    preferences: Partial<Record<OptionalCookieCategory, boolean>>
  ) => StoredConsentDecision;
  resetConsent: () => void;
  getSnapshot: () => ConsentSnapshot;
  subscribe: (listener: ConsentListener) => () => void;
  openPreferences: () => void;
  closePreferences: () => void;
}

export const COOKIE_CONSENT_CHANGE_EVENT = 'cookie-consent:change';
export const COOKIE_CONSENT_OPEN_EVENT = 'cookie-consent:open-preferences';
export const COOKIE_CONSENT_CLOSE_EVENT = 'cookie-consent:close-preferences';
export const COOKIE_SERVICE_ENABLED_EVENT = 'cookie-consent:service-enabled';
export const COOKIE_SERVICE_DISABLED_EVENT = 'cookie-consent:service-disabled';
