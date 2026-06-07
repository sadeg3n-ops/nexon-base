import { applyDomConsent } from './dom-gate';
import { applyDefaultGoogleConsentMode, updateGoogleConsentMode } from './google-consent-mode';
import {
  clearStoredConsent,
  createDefaultPreferences,
  createStoredConsentDecision,
  persistConsent,
  readStoredConsent,
} from './storage';
import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_CLOSE_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
} from './types';
import type {
  ConsentChangeContext,
  ConsentListener,
  ConsentManagerOptions,
  ConsentPreferences,
  ConsentSnapshot,
  CookieConsentApi,
  CookieCategory,
  OptionalCookieCategory,
  StoredConsentDecision,
} from './types';

const DEFAULT_STORAGE_KEY = 'nexo-base-cookie-consent';
const DEFAULT_RENEWAL_DAYS = 730;

export class CookieConsentManager {
  private readonly listeners = new Set<ConsentListener>();
  private readonly options: Required<
    Pick<
      ConsentManagerOptions,
      'policyUrl' | 'version' | 'storageKey' | 'renewalDays' | 'technicalOnlyMode' | 'enableGoogleConsentMode'
    >
  > &
    Pick<ConsentManagerOptions, 'onChange'>;

  private decision: StoredConsentDecision | null = null;
  private preferences = createDefaultPreferences();
  private renewalDue = false;
  private initialized = false;
  private observer: MutationObserver | null = null;
  private snapshot: ConsentSnapshot;

  constructor(options: ConsentManagerOptions) {
    this.options = {
      policyUrl: options.policyUrl,
      version: options.version,
      storageKey: options.storageKey ?? DEFAULT_STORAGE_KEY,
      renewalDays: options.renewalDays ?? DEFAULT_RENEWAL_DAYS,
      technicalOnlyMode: options.technicalOnlyMode ?? false,
      enableGoogleConsentMode: options.enableGoogleConsentMode ?? true,
      onChange: options.onChange,
    };

    this.snapshot = this.buildSnapshot();
  }

  init() {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    const stored = readStoredConsent(this.options.storageKey, this.options.version);
    this.decision = stored.decision;
    this.preferences = stored.decision?.preferences ?? createDefaultPreferences();
    this.renewalDue = stored.renewalDue;
    this.snapshot = this.buildSnapshot();

    if (this.options.enableGoogleConsentMode) {
      applyDefaultGoogleConsentMode();

      if (this.decision) {
        updateGoogleConsentMode(this.preferences);
      }
    }

    applyDomConsent(this.preferences);
    this.observeDom();
    this.exposeApi();
    this.notify('hydrate', null);
  }

  subscribe = (listener: ConsentListener) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): ConsentSnapshot => {
    return this.snapshot;
  };

  hasConsent = (category: CookieCategory) => {
    return this.preferences[category];
  };

  acceptAll = () => {
    return this.commit(
      createDefaultPreferences({
        analytics: true,
        preferences: true,
        marketing: true,
      }),
      'accept_all'
    );
  };

  rejectAll = () => {
    return this.commit(createDefaultPreferences(), 'reject_all');
  };

  savePreferences = (
    preferences: Partial<Record<OptionalCookieCategory, boolean>>
  ): StoredConsentDecision => {
    return this.commit(createDefaultPreferences(preferences), 'custom');
  };

  resetConsent = () => {
    const previous = this.decision;

    clearStoredConsent(this.options.storageKey);
    this.decision = null;
    this.preferences = createDefaultPreferences();
    this.renewalDue = false;
    this.snapshot = this.buildSnapshot();

    if (this.options.enableGoogleConsentMode) {
      applyDefaultGoogleConsentMode();
    }

    applyDomConsent(this.preferences);
    this.notify('reset', previous);
  };

  openPreferences = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_OPEN_EVENT));
  };

  closePreferences = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CLOSE_EVENT));
  };

  private commit(preferences: ConsentPreferences, source: ConsentChangeContext['source']) {
    const previous = this.decision;
    const decision = createStoredConsentDecision(
      this.options.version,
      preferences,
      source === 'reset' || source === 'hydrate' ? 'custom' : source
    );

    this.decision = decision;
    this.preferences = decision.preferences;
    this.renewalDue = false;
    this.snapshot = this.buildSnapshot();

    persistConsent(this.options.storageKey, decision);

    if (this.options.enableGoogleConsentMode) {
      updateGoogleConsentMode(this.preferences);
    }

    applyDomConsent(this.preferences);
    this.notify(source, previous);

    return decision;
  }

  private notify(source: ConsentChangeContext['source'], previous: StoredConsentDecision | null) {
    const context: ConsentChangeContext = {
      source,
      previous,
      current: this.decision,
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(COOKIE_CONSENT_CHANGE_EVENT, {
          detail: { snapshot: this.snapshot, context },
        })
      );
    }

    this.options.onChange?.(this.snapshot, context);
    this.listeners.forEach((listener) => listener(this.snapshot, context));
  }

  private exposeApi() {
    if (typeof window === 'undefined') {
      return;
    }

    const api: CookieConsentApi = {
      hasConsent: this.hasConsent,
      acceptAll: this.acceptAll,
      rejectAll: this.rejectAll,
      savePreferences: this.savePreferences,
      resetConsent: this.resetConsent,
      getSnapshot: this.getSnapshot,
      subscribe: this.subscribe,
      openPreferences: this.openPreferences,
      closePreferences: this.closePreferences,
    };

    window.CookieConsent = api;
  }

  private observeDom() {
    if (typeof window === 'undefined' || typeof document === 'undefined' || this.observer) {
      return;
    }

    let rafId: number | null = null;

    this.observer = new MutationObserver(() => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }

      rafId = window.requestAnimationFrame(() => {
        applyDomConsent(this.preferences);
      });
    });

    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-cookie-category', 'data-cookie-src', 'src'],
    });
  }

  private buildSnapshot(): ConsentSnapshot {
    const isConsentRequired = !this.options.technicalOnlyMode;
    const shouldShowBanner = isConsentRequired && !this.decision;
    const shouldShowFloatingButton = this.options.technicalOnlyMode || Boolean(this.decision);

    return {
      decision: this.decision,
      preferences: { ...this.preferences },
      policyUrl: this.options.policyUrl,
      technicalOnlyMode: this.options.technicalOnlyMode,
      shouldShowBanner,
      shouldShowFloatingButton,
      isConsentRequired,
      isRenewalDue: this.renewalDue,
      version: this.options.version,
    };
  }
}
