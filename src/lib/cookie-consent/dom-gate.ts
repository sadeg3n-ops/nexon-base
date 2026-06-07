import {
  COOKIE_CATEGORIES,
  COOKIE_SERVICE_DISABLED_EVENT,
  COOKIE_SERVICE_ENABLED_EVENT,
} from './types';
import type { ConsentPreferences, CookieCategory } from './types';

function isCookieCategory(value: string): value is CookieCategory {
  return COOKIE_CATEGORIES.includes(value as CookieCategory);
}

function emitServiceEvent(eventName: string, detail: { category: CookieCategory; element: Element }) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

function activateScript(scriptElement: HTMLScriptElement, category: CookieCategory) {
  if (
    scriptElement.dataset.cookieExecuted === 'true' ||
    scriptElement.dataset.cookieRuntime === 'true'
  ) {
    return;
  }

  const runtimeScript = document.createElement('script');
  const runtimeId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `cookie-script-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  for (const attribute of Array.from(scriptElement.attributes)) {
    const shouldSkip = ['type', 'src', 'data-cookie-category', 'data-cookie-src'].includes(
      attribute.name
    );

    if (!shouldSkip) {
      runtimeScript.setAttribute(attribute.name, attribute.value);
    }
  }

  runtimeScript.type = 'text/javascript';

  if (scriptElement.dataset.cookieSrc) {
    runtimeScript.src = scriptElement.dataset.cookieSrc;
  }

  if (scriptElement.textContent?.trim()) {
    runtimeScript.text = scriptElement.textContent;
  }

  runtimeScript.dataset.cookieRuntimeId = runtimeId;
  runtimeScript.dataset.cookieRuntime = 'true';

  scriptElement.dataset.cookieExecuted = 'true';
  scriptElement.dataset.cookieRuntimeId = runtimeId;
  scriptElement.after(runtimeScript);

  emitServiceEvent(COOKIE_SERVICE_ENABLED_EVENT, { category, element: scriptElement });
}

function deactivateScript(scriptElement: HTMLScriptElement, category: CookieCategory) {
  const runtimeId = scriptElement.dataset.cookieRuntimeId;

  if (!runtimeId) {
    return;
  }

  document
    .querySelectorAll(`[data-cookie-runtime-id="${runtimeId}"]`)
    .forEach((runtimeElement) => runtimeElement.remove());

  delete scriptElement.dataset.cookieExecuted;
  delete scriptElement.dataset.cookieRuntimeId;

  emitServiceEvent(COOKIE_SERVICE_DISABLED_EVENT, { category, element: scriptElement });
}

function activateMediaElement(element: HTMLIFrameElement | HTMLImageElement, category: CookieCategory) {
  const source = element.dataset.cookieSrc || element.getAttribute('src');

  if (!source) {
    return;
  }

  element.dataset.cookieSrc = source;
  element.setAttribute('src', source);
  element.dataset.cookieExecuted = 'true';

  emitServiceEvent(COOKIE_SERVICE_ENABLED_EVENT, { category, element });
}

function deactivateMediaElement(
  element: HTMLIFrameElement | HTMLImageElement,
  category: CookieCategory
) {
  const source = element.getAttribute('src');

  if (source) {
    element.dataset.cookieSrc = source;
  }

  element.removeAttribute('src');
  delete element.dataset.cookieExecuted;

  emitServiceEvent(COOKIE_SERVICE_DISABLED_EVENT, { category, element });
}

// This layer keeps non-essential placeholders inert until consent unlocks them.
export function applyDomConsent(preferences: ConsentPreferences) {
  if (typeof document === 'undefined') {
    return;
  }

  document.querySelectorAll<HTMLElement>('[data-cookie-category]').forEach((element) => {
    const categoryName = element.dataset.cookieCategory;

    if (!categoryName || !isCookieCategory(categoryName)) {
      return;
    }

    const isAllowed = preferences[categoryName];

    if (element instanceof HTMLScriptElement) {
      if (isAllowed) {
        activateScript(element, categoryName);
      } else {
        deactivateScript(element, categoryName);
      }
      return;
    }

    if (element instanceof HTMLIFrameElement || element instanceof HTMLImageElement) {
      if (isAllowed) {
        activateMediaElement(element, categoryName);
      } else {
        deactivateMediaElement(element, categoryName);
      }
    }
  });
}
