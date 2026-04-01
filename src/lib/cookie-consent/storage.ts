import type {
  ConsentPreferences,
  ConsentSource,
  StoredConsentDecision,
  StoredConsentState,
} from './types';

const DEFAULT_RENEWAL_DAYS = 730;

function getSafeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createDefaultPreferences(
  overrides: Partial<Omit<ConsentPreferences, 'necessary'>> = {}
): ConsentPreferences {
  return {
    necessary: true,
    analytics: overrides.analytics ?? false,
    preferences: overrides.preferences ?? false,
    marketing: overrides.marketing ?? false,
  };
}

function isConsentPreferences(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const preferences = value as ConsentPreferences;

  return (
    preferences.necessary === true &&
    typeof preferences.analytics === 'boolean' &&
    typeof preferences.preferences === 'boolean' &&
    typeof preferences.marketing === 'boolean'
  );
}

function isStoredConsentDecision(value: unknown): value is StoredConsentDecision {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const decision = value as StoredConsentDecision;

  return (
    typeof decision.version === 'string' &&
    typeof decision.timestamp === 'string' &&
    typeof decision.expiresAt === 'string' &&
    typeof decision.source === 'string' &&
    isConsentPreferences(decision.preferences)
  );
}

export function createStoredConsentDecision(
  version: string,
  preferences: ConsentPreferences,
  source: ConsentSource,
  renewalDays = DEFAULT_RENEWAL_DAYS
): StoredConsentDecision {
  const now = new Date();
  const expiresAt = new Date(now);

  expiresAt.setDate(expiresAt.getDate() + renewalDays);

  return {
    version,
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    source,
    preferences,
  };
}

export function readStoredConsent(
  storageKey: string,
  expectedVersion: string
): StoredConsentState {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return { decision: null, renewalDue: false };
  }

  const rawValue = storage.getItem(storageKey);

  if (!rawValue) {
    return { decision: null, renewalDue: false };
  }

  try {
    const parsed = JSON.parse(rawValue);

    if (!isStoredConsentDecision(parsed)) {
      storage.removeItem(storageKey);
      return { decision: null, renewalDue: false };
    }

    const isExpired = new Date(parsed.expiresAt).getTime() <= Date.now();
    const isVersionMismatch = parsed.version !== expectedVersion;

    if (isExpired || isVersionMismatch) {
      return { decision: null, renewalDue: true };
    }

    return { decision: parsed, renewalDue: false };
  } catch {
    storage.removeItem(storageKey);
    return { decision: null, renewalDue: false };
  }
}

export function persistConsent(storageKey: string, decision: StoredConsentDecision) {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(decision));
  } catch {
    // If storage is blocked or quota-limited, we keep the site functional
    // and fall back to in-memory consent during the current session.
  }
}

export function clearStoredConsent(storageKey: string) {
  const storage = getSafeLocalStorage();

  if (!storage) {
    return;
  }

  try {
    storage.removeItem(storageKey);
  } catch {
    // Ignore storage removal failures so consent reset never breaks the UI.
  }
}
