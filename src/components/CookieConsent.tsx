import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { Cookie, ExternalLink, Settings2, ShieldCheck, X } from 'lucide-react';
import { cookieConsentManager } from '../lib/cookie-consent';
import {
  COOKIE_CONSENT_CLOSE_EVENT,
  COOKIE_CONSENT_OPEN_EVENT,
} from '../lib/cookie-consent';
import type {
  ConsentPreferences,
  OptionalCookieCategory,
} from '../lib/cookie-consent';

const CATEGORY_COPY: Record<
  keyof ConsentPreferences,
  { title: string; description: string; note: string }
> = {
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
};

function pickOptionalPreferences(preferences: ConsentPreferences) {
  return {
    analytics: preferences.analytics,
    preferences: preferences.preferences,
    marketing: preferences.marketing,
  };
}

function useDialogFocusTrap(
  isOpen: boolean,
  dialogRef: RefObject<HTMLDivElement>,
  onClose: () => void
) {
  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return;
    }

    const dialog = dialogRef.current;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusableElements = Array.from(dialog.querySelectorAll<HTMLElement>(selector));
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    document.body.classList.add('cc-scroll-lock');
    firstFocusableElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || focusableElements.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault();
        lastFocusableElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusableElement) {
        event.preventDefault();
        firstFocusableElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('cc-scroll-lock');
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [dialogRef, isOpen, onClose]);
}

function useConsentSnapshot() {
  return useSyncExternalStore(
    cookieConsentManager.subscribe,
    cookieConsentManager.getSnapshot,
    cookieConsentManager.getSnapshot
  );
}

export function CookieConsent() {
  const snapshot = useConsentSnapshot();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [draftPreferences, setDraftPreferences] = useState(() =>
    pickOptionalPreferences(snapshot.preferences)
  );
  const dialogRef = useRef<HTMLDivElement>(null);

  const legalCopy =
    'Usamos cookies propias y de terceros para fines técnicos, analíticos y, en su caso, de personalización y marketing. Puedes aceptar, rechazar o configurar tus preferencias. Las cookies no necesarias permanecerán bloqueadas hasta que elijas.';
  const preferencesIntro =
    'Activa solo las categorías opcionales que quieras. Las no necesarias seguirán bloqueadas hasta que decidas.';

  useEffect(() => {
    if (!isPreferencesOpen) {
      setDraftPreferences(pickOptionalPreferences(snapshot.preferences));
    }
  }, [isPreferencesOpen, snapshot.preferences]);

  useEffect(() => {
    const openHandler = () => setIsPreferencesOpen(true);
    const closeHandler = () => setIsPreferencesOpen(false);

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, openHandler);
    window.addEventListener(COOKIE_CONSENT_CLOSE_EVENT, closeHandler);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, openHandler);
      window.removeEventListener(COOKIE_CONSENT_CLOSE_EVENT, closeHandler);
    };
  }, []);

  useDialogFocusTrap(isPreferencesOpen, dialogRef, () => setIsPreferencesOpen(false));

  const showBanner = snapshot.shouldShowBanner && !snapshot.technicalOnlyMode;
  const showFloatingButton = snapshot.shouldShowFloatingButton && !isPreferencesOpen;
  const technicalOnlyMessage = useMemo(() => {
    if (!snapshot.technicalOnlyMode) {
      return null;
    }

    return 'Solo usamos cookies técnicas mientras no actives categorías opcionales.';
  }, [snapshot.technicalOnlyMode]);

  const handleToggleCategory = (category: OptionalCookieCategory) => {
    setDraftPreferences((current) => ({
      ...current,
      [category]: !current[category],
    }));
  };

  const handleSavePreferences = () => {
    cookieConsentManager.savePreferences(draftPreferences);
    setIsPreferencesOpen(false);
  };

  const handleClosePreferences = () => {
    setIsPreferencesOpen(false);
  };

  return (
    <>
      {showBanner ? (
        <section
          aria-label="Preferencias de cookies"
          className="fixed inset-x-3 bottom-3 z-[70] md:left-1/2 md:w-[min(52rem,calc(100vw-2rem))] md:-translate-x-1/2"
        >
          <div className="rounded-[2rem] border border-white/10 bg-[rgba(12,14,18,0.82)] p-5 shadow-[0_28px_80px_-40px_rgba(0,0,0,0.75)] backdrop-blur-2xl md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3 text-sm text-white/85">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90">
                    <ShieldCheck size={18} aria-hidden="true" />
                  </span>
                  <span className="font-medium tracking-[0.02em]">Preferencias de cookies</span>
                </div>
                <p className="text-sm leading-6 text-white/72 md:text-[0.95rem]">{legalCopy}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/55">
                  <a
                    href={snapshot.policyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 transition-colors hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                  >
                    Política de cookies
                    <ExternalLink size={14} aria-hidden="true" />
                  </a>
                  {snapshot.isRenewalDue ? <span>Hemos renovado este panel para revisar tu consentimiento.</span> : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:min-w-[22rem]">
                <button
                  type="button"
                  onClick={() => cookieConsentManager.acceptAll()}
                  aria-label="Aceptar cookies analíticas, de preferencias y marketing"
                  className="cc-consent-button"
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  onClick={() => cookieConsentManager.rejectAll()}
                  aria-label="Rechazar todas las cookies no necesarias"
                  className="cc-consent-button"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreferencesOpen(true)}
                  aria-label="Configurar preferencias de cookies"
                  className="cc-consent-button"
                >
                  Configurar
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showFloatingButton ? (
        <div className="fixed bottom-4 right-3 z-[65] flex flex-col items-end gap-3 md:bottom-5 md:right-5">
          {technicalOnlyMessage ? (
            <div className="max-w-[18rem] rounded-2xl border border-white/10 bg-[rgba(12,14,18,0.74)] px-4 py-3 text-xs leading-5 text-white/65 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              {technicalOnlyMessage}
            </div>
          ) : null}
          <div className="group relative">
            <div className="pointer-events-none absolute right-[3.25rem] top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-[rgba(12,14,18,0.82)] px-3 py-1.5 text-[0.72rem] font-medium tracking-[0.02em] text-white/58 opacity-0 shadow-[0_18px_40px_-34px_rgba(0,0,0,0.95)] backdrop-blur-xl transition duration-200 group-hover:translate-x-[-0.2rem] group-hover:opacity-100 group-focus-within:translate-x-[-0.2rem] group-focus-within:opacity-100 md:block">
              Cookies
            </div>
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              aria-label="Abrir preferencias de cookies"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-[rgba(12,14,18,0.78)] text-white/74 shadow-[0_18px_48px_-34px_rgba(0,0,0,0.88)] backdrop-blur-xl transition duration-200 hover:-translate-x-2 hover:border-white/18 hover:text-white focus-visible:-translate-x-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 motion-reduce:transition-none"
            >
              <Cookie size={15} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      {isPreferencesOpen ? (
        <div
          className="fixed inset-0 z-[80] bg-[rgba(5,7,10,0.58)] backdrop-blur-md"
          aria-hidden="true"
          onClick={() => setIsPreferencesOpen(false)}
        />
      ) : null}

      {isPreferencesOpen ? (
        <div className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-3 md:inset-0 md:flex md:items-center md:justify-center md:p-6">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className="flex h-[84dvh] w-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(11,13,17,0.92)] shadow-[0_40px_120px_-55px_rgba(0,0,0,0.9)] backdrop-blur-2xl md:h-auto md:max-h-[min(88vh,46rem)] md:w-[min(46rem,100%)] motion-safe:animate-[ccFadeUp_280ms_cubic-bezier(.22,1,.36,1)] motion-reduce:animate-none"
          >
            <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/8 px-4 py-4 md:px-7 md:py-5">
              <div>
                <div className="mb-2 flex items-center gap-3 text-sm text-white/72">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/90">
                    <Settings2 size={18} aria-hidden="true" />
                  </span>
                  <span className="font-medium tracking-[0.02em]">Configurar cookies</span>
                </div>
                <h2 id="cookie-preferences-title" className="text-lg font-semibold text-white md:text-2xl">
                  Elige qué categorías quieres activar
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/68 sm:hidden">{preferencesIntro}</p>
                <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-white/68 sm:block">
                  {legalCopy}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClosePreferences}
                aria-label="Cerrar preferencias de cookies"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/72 transition hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="cc-consent-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-7 md:py-5">
              <div className="space-y-4">
                {(Object.keys(CATEGORY_COPY) as Array<keyof ConsentPreferences>).map((category) => {
                  const categoryConfig = CATEGORY_COPY[category];
                  const isNecessaryCategory = category === 'necessary';
                  const isEnabled = isNecessaryCategory ? true : draftPreferences[category];

                  return (
                    <section
                      key={category}
                      className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-4 md:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold text-white">{categoryConfig.title}</h3>
                            {isNecessaryCategory ? (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em] text-white/55">
                                Siempre activas
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-white/68">{categoryConfig.description}</p>
                          <p className="mt-3 text-xs leading-5 text-white/45">{categoryConfig.note}</p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={isEnabled}
                          aria-label={`Activar ${categoryConfig.title}`}
                          disabled={isNecessaryCategory}
                          onClick={() =>
                            !isNecessaryCategory
                              ? handleToggleCategory(category as OptionalCookieCategory)
                              : undefined
                          }
                          className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60 ${
                            isEnabled
                              ? 'border-white/25 bg-white/14'
                              : 'border-white/10 bg-black/25'
                          } ${isNecessaryCategory ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`ml-1 inline-block h-6 w-6 rounded-full bg-white shadow-[0_8px_18px_-12px_rgba(255,255,255,0.95)] transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-[rgba(255,255,255,0.03)] p-4 text-sm leading-6 text-white/62">
                <p>
                  Puedes retirar o modificar tu consentimiento cuando quieras desde el botón flotante{' '}
                  <strong className="font-medium text-white/80">Cookies</strong>. Los servicios no esenciales se
                  mantendrán bloqueados hasta tu elección.
                </p>
                <a
                  href={snapshot.policyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-white/78 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                >
                  Abrir Política de cookies
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="shrink-0 border-t border-white/8 px-4 py-3 md:px-7 md:py-4">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={handleClosePreferences}
                  className="cc-consent-secondary-button cc-consent-secondary-button-compact col-span-2 sm:col-span-1"
                  aria-label="Cerrar panel de preferencias de cookies"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="cc-consent-button cc-consent-button-compact col-span-2 sm:col-span-1"
                  aria-label="Guardar selección de cookies"
                >
                  Guardar selección
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cookieConsentManager.rejectAll();
                    setIsPreferencesOpen(false);
                  }}
                  className="cc-consent-button cc-consent-button-compact"
                  aria-label="Rechazar todas las cookies no necesarias"
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cookieConsentManager.acceptAll();
                    setIsPreferencesOpen(false);
                  }}
                  className="cc-consent-button cc-consent-button-compact"
                  aria-label="Aceptar todas las cookies"
                >
                  Aceptar todo
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
