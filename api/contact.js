import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { unstable_checkRateLimit as checkFirewallRateLimit } from '@vercel/firewall';

const DEFAULT_ALLOWED_ORIGINS = ['https://nexobase.dev', 'https://www.nexobase.dev'];
const DEFAULT_RATE_LIMIT_ID = 'contact-form';
const FORM_COOKIE_NAME = 'nexo_contact_session';
const MIN_SUBMIT_DELAY_MS = 4000;
const FORM_TOKEN_TTL_MS = 60 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 6 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const BURST_WINDOW_MS = 60 * 1000;
const BURST_LIMIT_MAX = 2;
const MAX_BODY_BYTES = 12 * 1024;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;
const MIN_COMPANY_LENGTH = 2;
const MAX_COMPANY_LENGTH = 120;
const MIN_MESSAGE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 2000;
const PUBLIC_RETRY_MESSAGE =
  'No se pudo enviar la solicitud ahora mismo. Inténtalo de nuevo en unos minutos.';
const PUBLIC_INVALID_MESSAGE =
  'No se pudo enviar la solicitud. Revisa los campos e inténtalo otra vez.';
const EMAIL_REGEX =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;
const BASE_RESPONSE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
};
const ALLOWED_FIELDS = new Set([
  'name',
  'email',
  'company',
  'message',
  'privacyAccepted',
  'website',
  'formToken',
  'turnstileToken',
]);
const MODERATION_CHAR_MAP = {
  '@': 'a',
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '$': 's',
  '!': 'i',
  '+': 't',
  '€': 'e',
  '|': 'i',
  '¡': 'i',
  'а': 'a',
  'е': 'e',
  'о': 'o',
  'р': 'p',
  'с': 'c',
  'у': 'y',
  'х': 'x',
  'і': 'i',
  'ј': 'j',
  'ѕ': 's',
  'ԁ': 'd',
  'һ': 'h',
  'κ': 'k',
  'ν': 'v',
  'τ': 't',
  'μ': 'm',
};
const DROP_ABUSE_PATTERNS = [
  { value: 'hijo de puta', reason: 'abusive_phrase', type: 'phrase' },
  { value: 'hija de puta', reason: 'abusive_phrase', type: 'phrase' },
  { value: 'vete a la mierda', reason: 'abusive_phrase', type: 'phrase' },
  { value: 'me cago en tu madre', reason: 'abusive_phrase', type: 'phrase' },
  { value: 'te voy a matar', reason: 'violent_threat', type: 'phrase' },
  { value: 'os voy a matar', reason: 'violent_threat', type: 'phrase' },
  { value: 'te voy a reventar', reason: 'violent_threat', type: 'phrase' },
  { value: 'os voy a reventar', reason: 'violent_threat', type: 'phrase' },
  { value: 'gilipollas', reason: 'abusive_token', type: 'token' },
  { value: 'subnormal', reason: 'abusive_token', type: 'token' },
  { value: 'imbecil', reason: 'abusive_token', type: 'token' },
  { value: 'idiota', reason: 'abusive_token', type: 'token' },
  { value: 'cabron', reason: 'abusive_token', type: 'token' },
  { value: 'mierda', reason: 'abusive_token', type: 'token' },
  { value: 'puta', reason: 'abusive_token', type: 'token' },
  { value: 'puto', reason: 'abusive_token', type: 'token' },
  { value: 'zorra', reason: 'abusive_token', type: 'token' },
  { value: 'fuck', reason: 'abusive_token', type: 'token' },
  { value: 'shit', reason: 'abusive_token', type: 'token' },
  { value: 'bitch', reason: 'abusive_token', type: 'token' },
];
const REVIEW_ABUSE_PATTERNS = [
  { value: 'estafador', reason: 'hostile_accusation', type: 'token' },
  { value: 'estafadores', reason: 'hostile_accusation', type: 'token' },
  { value: 'timador', reason: 'hostile_accusation', type: 'token' },
  { value: 'timadores', reason: 'hostile_accusation', type: 'token' },
  { value: 'estafa', reason: 'hostile_accusation', type: 'token' },
  { value: 'ladron', reason: 'hostile_accusation', type: 'token' },
  { value: 'ladrones', reason: 'hostile_accusation', type: 'token' },
  { value: 'es un fraude', reason: 'hostile_accusation', type: 'phrase' },
  { value: 'sois un fraude', reason: 'hostile_accusation', type: 'phrase' },
  { value: 'fraude total', reason: 'hostile_accusation', type: 'phrase' },
  { value: 'os voy a denunciar', reason: 'legal_threat', type: 'phrase' },
  { value: 'voy a denunciaros', reason: 'legal_threat', type: 'phrase' },
  { value: 'te voy a denunciar', reason: 'legal_threat', type: 'phrase' },
  { value: 'voy a demandaros', reason: 'legal_threat', type: 'phrase' },
  { value: 'te voy a demandar', reason: 'legal_threat', type: 'phrase' },
  { value: 'os voy a demandar', reason: 'legal_threat', type: 'phrase' },
  { value: 'interponer una demanda', reason: 'legal_threat', type: 'phrase' },
  { value: 'presentar una demanda', reason: 'legal_threat', type: 'phrase' },
  { value: 'poner una denuncia', reason: 'legal_threat', type: 'phrase' },
  { value: 'presentar una denuncia', reason: 'legal_threat', type: 'phrase' },
  { value: 'me habeis robado', reason: 'hostile_accusation', type: 'phrase' },
  { value: 'hablare con mi abogado', reason: 'legal_threat', type: 'phrase' },
  { value: 'mi abogado', reason: 'legal_threat', type: 'phrase' },
  { value: 'mis abogados', reason: 'legal_threat', type: 'phrase' },
];

const contactStores = globalThis.__nexobaseContactStores || createContactStores();
globalThis.__nexobaseContactStores = contactStores;

export const runtime = 'nodejs';

export function createContactStores() {
  return {
    rateLimit: new Map(),
    duplicates: new Map(),
    usedTokens: new Map(),
  };
}

function isProductionEnvironment(env = process.env) {
  return env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
}

function jsonResponse(statusCode, payload, { headers = {}, cookies = [] } = {}) {
  const responseHeaders = new Headers(BASE_RESPONSE_HEADERS);

  for (const [key, value] of Object.entries(headers)) {
    responseHeaders.set(key, value);
  }

  for (const cookie of cookies) {
    responseHeaders.append('Set-Cookie', cookie);
  }

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: responseHeaders,
  });
}

function normalizeSingleLine(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFKC')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeMultiline(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeHtmlWithBreaks(value) {
  return escapeHtml(value).replace(/\n/g, '<br />');
}

function hasMixedScriptSpoofing(value) {
  const hasLatin = /\p{Script=Latin}/u.test(value);
  const hasCyrillic = /\p{Script=Cyrillic}/u.test(value);
  const hasGreek = /\p{Script=Greek}/u.test(value);
  return hasLatin && (hasCyrillic || hasGreek);
}

function pruneStore(map, ttlMs, now) {
  for (const [key, value] of map.entries()) {
    if (typeof value === 'number' && now - value > ttlMs) {
      map.delete(key);
      continue;
    }

    if (Array.isArray(value)) {
      const freshTimestamps = value.filter((timestamp) => now - timestamp <= ttlMs);
      if (freshTimestamps.length === 0) {
        map.delete(key);
      } else {
        map.set(key, freshTimestamps);
      }
    }
  }
}

function parseCsvList(value) {
  return normalizeSingleLine(value)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getOriginCandidates(env = process.env) {
  const configuredOrigins = parseCsvList(env.CONTACT_ALLOWED_ORIGINS);
  const previewOrigins = [
    env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '',
    env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '',
    env.VERCEL_BRANCH_URL ? `https://${env.VERCEL_BRANCH_URL}` : '',
  ].filter(Boolean);

  const localOrigins = isProductionEnvironment(env)
    ? []
    : [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:4010',
        'http://127.0.0.1:4010',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];

  return [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...configuredOrigins, ...previewOrigins, ...localOrigins])];
}

export function isAllowedOrigin(origin, env = process.env) {
  if (!origin) {
    return !isProductionEnvironment(env);
  }

  return getOriginCandidates(env).includes(origin);
}

function getTrustedSource(request, env = process.env) {
  const originHeader = normalizeSingleLine(request.headers.get('origin'));
  if (isAllowedOrigin(originHeader, env)) {
    return originHeader;
  }

  const refererHeader = normalizeSingleLine(request.headers.get('referer'));
  if (!refererHeader) {
    return 'direct-request';
  }

  try {
    const refererUrl = new URL(refererHeader);
    return isAllowedOrigin(refererUrl.origin, env) ? refererUrl.origin : 'direct-request';
  } catch {
    return 'direct-request';
  }
}

function getClientIp(request) {
  const forwarded = normalizeSingleLine(request.headers.get('x-forwarded-for'));
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = normalizeSingleLine(request.headers.get('x-real-ip'));
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

function getSecretOrNull(env = process.env) {
  if (env.CONTACT_FORM_SECRET) {
    return env.CONTACT_FORM_SECRET;
  }

  if (!isProductionEnvironment(env)) {
    return 'nexobase-local-dev-contact-secret';
  }

  return null;
}

function signValue(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSignedToken(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${signValue(encodedPayload, secret)}`;
}

function parseSignedToken(token, secret) {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signValue(encodedPayload, secret);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (
      typeof payload?.nonce !== 'string' ||
      payload.nonce.length < 10 ||
      typeof payload?.issuedAt !== 'number'
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function createFormSession(now = Date.now(), env = process.env) {
  const secret = getSecretOrNull(env);
  if (!secret) {
    throw new Error('CONTACT_FORM_SECRET is required in production.');
  }

  const payload = {
    nonce: crypto.randomUUID(),
    issuedAt: now,
  };

  return {
    token: createSignedToken(payload, secret),
    payload,
  };
}

function buildFormCookie(token, env = process.env) {
  const secureFlag = isProductionEnvironment(env) ? '; Secure' : '';
  return `${FORM_COOKIE_NAME}=${token}; Max-Age=${Math.floor(
    FORM_TOKEN_TTL_MS / 1000
  )}; Path=/api/contact; HttpOnly; SameSite=Strict${secureFlag}`;
}

function buildExpiredFormCookie(env = process.env) {
  const secureFlag = isProductionEnvironment(env) ? '; Secure' : '';
  return `${FORM_COOKIE_NAME}=; Max-Age=0; Path=/api/contact; HttpOnly; SameSite=Strict${secureFlag}`;
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || '')
    .split(';')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce((cookies, pair) => {
      const separatorIndex = pair.indexOf('=');
      if (separatorIndex === -1) {
        return cookies;
      }

      const key = pair.slice(0, separatorIndex);
      const value = pair.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

export function verifyFormSession(
  { bodyToken, cookieToken, now = Date.now(), env = process.env },
  usedTokenStore = contactStores.usedTokens
) {
  const secret = getSecretOrNull(env);
  if (!secret) {
    return { ok: false, reason: 'config_missing' };
  }

  if (!bodyToken || !cookieToken || bodyToken !== cookieToken) {
    return { ok: false, reason: 'token_mismatch' };
  }

  const payload = parseSignedToken(bodyToken, secret);
  if (!payload) {
    return { ok: false, reason: 'token_invalid' };
  }

  if (now - payload.issuedAt < MIN_SUBMIT_DELAY_MS) {
    return { ok: false, reason: 'submitted_too_fast' };
  }

  if (now - payload.issuedAt > FORM_TOKEN_TTL_MS) {
    return { ok: false, reason: 'token_expired' };
  }

  pruneStore(usedTokenStore, FORM_TOKEN_TTL_MS, now);
  if (usedTokenStore.has(payload.nonce)) {
    return { ok: false, reason: 'token_replayed' };
  }

  return { ok: true, payload };
}

function rememberUsedToken(nonce, now = Date.now(), usedTokenStore = contactStores.usedTokens) {
  pruneStore(usedTokenStore, FORM_TOKEN_TTL_MS, now);
  usedTokenStore.set(nonce, now);
}

async function parseJsonBody(request) {
  const contentLengthHeader = normalizeSingleLine(request.headers.get('content-length'));
  if (contentLengthHeader && /^\d+$/.test(contentLengthHeader) && Number(contentLengthHeader) > MAX_BODY_BYTES) {
    return { ok: false, reason: 'body_too_large' };
  }

  let rawBody;
  try {
    rawBody = await request.text();
  } catch {
    return { ok: false, reason: 'invalid_body' };
  }

  if (Buffer.byteLength(rawBody) > MAX_BODY_BYTES) {
    return { ok: false, reason: 'body_too_large' };
  }

  try {
    const parsed = JSON.parse(rawBody);
    return { ok: true, body: parsed };
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
}

export function validateSubmission(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, reason: 'invalid_body' };
  }

  const unexpectedFields = Object.keys(body).filter((key) => !ALLOWED_FIELDS.has(key));
  if (unexpectedFields.length > 0) {
    return { ok: false, reason: 'unexpected_fields' };
  }

  const name = normalizeSingleLine(body.name);
  const email = normalizeSingleLine(body.email).toLowerCase();
  const company = normalizeSingleLine(body.company);
  const message = normalizeMultiline(body.message);
  const website = normalizeSingleLine(body.website);
  const formToken = normalizeSingleLine(body.formToken);
  const turnstileToken = normalizeSingleLine(body.turnstileToken);
  const privacyAccepted = body.privacyAccepted === true;

  if (website) {
    return { ok: false, reason: 'honeypot_triggered' };
  }

  if (!privacyAccepted) {
    return { ok: false, reason: 'privacy_required' };
  }

  if (!formToken) {
    return { ok: false, reason: 'form_token_missing' };
  }

  if (
    name.length < MIN_NAME_LENGTH ||
    name.length > MAX_NAME_LENGTH ||
    company.length < MIN_COMPANY_LENGTH ||
    company.length > MAX_COMPANY_LENGTH ||
    message.length < MIN_MESSAGE_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return { ok: false, reason: 'length_constraints_failed' };
  }

  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    return { ok: false, reason: 'email_invalid' };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      company,
      message,
      formToken,
      turnstileToken,
    },
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeForModeration(value) {
  const decomposed = normalizeMultiline(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  const canonical = Array.from(decomposed)
    .map((char) => {
      const lowerChar = char.toLowerCase();
      return MODERATION_CHAR_MAP[lowerChar] || lowerChar;
    })
    .join('')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const squashedBoundaryText = canonical.replace(/([a-z0-9])\1+/g, '$1');
  const spaced = canonical.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const squashedSpaced = squashedBoundaryText.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

  return {
    boundaryText: canonical,
    squashedBoundaryText,
    spaced,
    squashedSpaced,
  };
}

function getAllowlistTerms(env = process.env) {
  return parseCsvList(env.PROFANITY_ALLOWLIST_TERMS);
}

function buildObfuscatedRegex(term, { global = false } = {}) {
  const profile = normalizeForModeration(term);
  const compactTerm = profile.spaced.replace(/ /g, '');
  if (!compactTerm) {
    return null;
  }

  const pattern = compactTerm
    .split('')
    .map((character) => escapeRegex(character))
    .join('[^a-z0-9]*');

  return new RegExp(`(?:^|[^a-z0-9])${pattern}(?:$|[^a-z0-9])`, global ? 'gu' : 'u');
}

function rebuildModerationProfile(boundaryText, squashedBoundaryText) {
  return {
    boundaryText: boundaryText.replace(/\s+/g, ' ').trim(),
    squashedBoundaryText: squashedBoundaryText.replace(/\s+/g, ' ').trim(),
    spaced: boundaryText.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(),
    squashedSpaced: squashedBoundaryText.replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(),
  };
}

function stripAllowlistedSegments(profile, allowlistTerms) {
  let nextProfile = { ...profile };

  for (const term of allowlistTerms) {
    const regex = buildObfuscatedRegex(term, { global: true });
    if (!regex) {
      continue;
    }

    nextProfile = rebuildModerationProfile(
      nextProfile.boundaryText.replace(regex, ' '),
      nextProfile.squashedBoundaryText.replace(regex, ' ')
    );
  }

  return nextProfile;
}

function matchesAbusePattern(profile, pattern) {
  const normalizedPattern = normalizeForModeration(pattern.value);
  const paddedSpacedText = ` ${profile.spaced} `;
  const paddedSquashedText = ` ${profile.squashedSpaced} `;
  const spacedPattern = ` ${normalizedPattern.spaced} `;
  const squashedPattern = ` ${normalizedPattern.squashedSpaced} `;

  if (normalizedPattern.spaced && paddedSpacedText.includes(spacedPattern)) {
    return true;
  }

  if (normalizedPattern.squashedSpaced && paddedSquashedText.includes(squashedPattern)) {
    return true;
  }

  const regex = buildObfuscatedRegex(pattern.value);
  return Boolean(
    regex &&
      (regex.test(profile.boundaryText) || regex.test(profile.squashedBoundaryText))
  );
}

export function classifyAbusiveLanguage(submission, env = process.env) {
  const combinedText = [submission.name, submission.company, submission.message].join('\n');
  const allowlistTerms = getAllowlistTerms(env);
  const profile = stripAllowlistedSegments(normalizeForModeration(combinedText), allowlistTerms);
  const dropMatch = DROP_ABUSE_PATTERNS.find((pattern) => matchesAbusePattern(profile, pattern));

  if (dropMatch) {
    return {
      verdict: 'drop',
      reasons: [dropMatch.reason],
      match: dropMatch.value,
    };
  }

  const reviewMatch = REVIEW_ABUSE_PATTERNS.find((pattern) => matchesAbusePattern(profile, pattern));
  if (reviewMatch) {
    return {
      verdict: 'review',
      reasons: [reviewMatch.reason],
      match: reviewMatch.value,
    };
  }

  return {
    verdict: 'allow',
    reasons: [],
    match: null,
  };
}

export function scoreSubmissionForAbuse(submission, env = process.env) {
  const combinedText = [submission.name, submission.company, submission.message].join('\n');
  const lowerText = normalizeMultiline(combinedText).toLowerCase();
  const repeatedCharacters = /(.)\1{6,}/u.test(lowerText);
  const linkMatches = lowerText.match(/(?:https?:\/\/|www\.)/g) || [];
  const hasMixedScripts = hasMixedScriptSpoofing(combinedText);
  const uppercaseRatio = (() => {
    const lettersOnly = submission.message.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
    if (lettersOnly.length < 12) {
      return 0;
    }

    const uppercaseLetters = lettersOnly.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
    return uppercaseLetters.length / lettersOnly.length;
  })();
  const languageAbuse = classifyAbusiveLanguage(submission, env);
  const reasons = new Set(languageAbuse.reasons);
  let score = 0;

  if (languageAbuse.verdict === 'review') {
    score += 4;
  }

  if (languageAbuse.verdict === 'drop') {
    score += 7;
  }

  if (linkMatches.length >= 1) {
    score += 1;
    reasons.add('contains_link');
  }

  if (linkMatches.length >= 2) {
    score += 3;
    reasons.add('multiple_links');
  }

  if (repeatedCharacters) {
    score += 2;
    reasons.add('repeated_characters');
  }

  if (hasMixedScripts) {
    score += 2;
    reasons.add('mixed_scripts');
  }

  if (uppercaseRatio > 0.65) {
    score += 1;
    reasons.add('excessive_uppercase');
  }

  let verdict = languageAbuse.verdict;
  if (verdict !== 'drop') {
    if (score >= 7) {
      verdict = 'drop';
    } else if (score >= 4) {
      verdict = 'review';
    }
  }

  return {
    score,
    reasons: [...reasons],
    verdict,
    match: languageAbuse.match,
  };
}

export function checkRateLimit(ip, now = Date.now(), rateLimitStore = contactStores.rateLimit) {
  const key = ip || 'unknown';
  pruneStore(rateLimitStore, RATE_LIMIT_WINDOW_MS, now);
  const timestamps = rateLimitStore.get(key) || [];
  const recentBurst = timestamps.filter((timestamp) => now - timestamp <= BURST_WINDOW_MS);

  if (recentBurst.length >= BURST_LIMIT_MAX || timestamps.length >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterSeconds: 60 };
  }

  rateLimitStore.set(key, [...timestamps, now]);
  return { ok: true };
}

async function applyRateLimit(request, { env = process.env, ip, now = Date.now(), stores = contactStores, firewallRateLimiter = checkFirewallRateLimit } = {}) {
  const rateLimitId = normalizeSingleLine(env.CONTACT_RATE_LIMIT_ID) || DEFAULT_RATE_LIMIT_ID;
  const shouldUseFirewall =
    isProductionEnvironment(env) || normalizeSingleLine(env.VERCEL_URL) || normalizeSingleLine(env.VERCEL_ENV) === 'preview';

  if (shouldUseFirewall) {
    try {
      const result = await firewallRateLimiter(rateLimitId, {
        request,
        rateLimitKey: ip || 'unknown',
      });

      if (result.rateLimited) {
        return {
          ok: false,
          retryAfterSeconds: 60,
          source: result.error || 'firewall',
        };
      }

      if (result.error === 'not-found') {
        throw new Error('firewall rule not configured');
      }
    } catch (error) {
      console.warn('Firewall rate limit check failed, falling back to local limiter.', {
        code: 'firewall_rate_limit_failed',
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }

  return {
    ...checkRateLimit(ip, now, stores.rateLimit),
    source: 'memory',
  };
}

export function checkDuplicateSubmission(
  submission,
  ip,
  now = Date.now(),
  duplicateStore = contactStores.duplicates
) {
  pruneStore(duplicateStore, DUPLICATE_WINDOW_MS, now);
  const fingerprint = crypto
    .createHash('sha256')
    .update(
      JSON.stringify([ip || 'unknown', submission.name, submission.email, submission.company, submission.message])
    )
    .digest('hex');

  if (duplicateStore.has(fingerprint)) {
    return { ok: false, fingerprint };
  }

  duplicateStore.set(fingerprint, now);
  return { ok: true, fingerprint };
}

function hashForLogs(value, env = process.env) {
  const secret = getSecretOrNull(env) || 'nexobase-log-secret';
  return crypto.createHmac('sha256', secret).update(value).digest('hex').slice(0, 12);
}

function createTransport(env = process.env) {
  const host = normalizeSingleLine(env.SMTP_HOST);
  const port = Number(env.SMTP_PORT || 465);
  const user = normalizeSingleLine(env.SMTP_USER);
  const pass = env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are missing.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

function getMailboxRoute(verdict, env = process.env) {
  const primaryTo = normalizeSingleLine(env.CONTACT_TO_EMAIL);
  const quarantineTo = normalizeSingleLine(env.CONTACT_QUARANTINE_TO_EMAIL);

  if (verdict === 'drop') {
    return { route: 'drop', to: null };
  }

  if (verdict === 'review') {
    return quarantineTo
      ? { route: 'quarantine', to: quarantineTo }
      : { route: 'review_without_quarantine', to: null };
  }

  return primaryTo ? { route: 'main', to: primaryTo } : { route: 'misconfigured', to: null };
}

export function createEmailContent({ submission, source, submittedAt, spamVerdict, spamReasons, ipHash }) {
  const escapedMessage = escapeHtmlWithBreaks(submission.message);
  const escapedName = escapeHtml(submission.name);
  const escapedEmail = escapeHtml(submission.email);
  const escapedCompany = escapeHtml(submission.company);
  const escapedSource = escapeHtml(source);
  const escapedVerdict = escapeHtml(spamVerdict);
  const escapedReasons = escapeHtml(spamReasons.length ? spamReasons.join(', ') : 'none');
  const escapedIpHash = escapeHtml(ipHash);
  const escapedSubmittedAt = escapeHtml(submittedAt);

  return {
    subject:
      spamVerdict === 'review'
        ? 'Revisión manual: solicitud de diagnóstico'
        : 'Nueva solicitud de diagnóstico',
    text: [
      'Nueva solicitud de diagnóstico',
      '',
      `Estado: ${spamVerdict}`,
      `Señales: ${spamReasons.length ? spamReasons.join(', ') : 'none'}`,
      `IP (hash): ${ipHash}`,
      `Fecha: ${submittedAt}`,
      `Origen: ${source}`,
      '',
      `Nombre: ${submission.name}`,
      `Email: ${submission.email}`,
      `Empresa: ${submission.company}`,
      '',
      'Mensaje:',
      submission.message,
    ].join('\n'),
    html: `
      <div style="font-family: Inter, Arial, sans-serif; background:#0b0d11; color:#f4f4f5; padding:32px;">
        <div style="max-width:640px; margin:0 auto; border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:28px; background:rgba(255,255,255,0.03);">
          <p style="margin:0 0 12px; font-size:12px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.55);">Nexo Base</p>
          <h1 style="margin:0 0 18px; font-size:28px; line-height:1.15;">Nueva solicitud de diagnóstico</h1>
          <table style="width:100%; border-collapse:collapse; margin:0 0 20px;">
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6); width:140px;">Estado</td><td style="padding:8px 0;">${escapedVerdict}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Señales</td><td style="padding:8px 0;">${escapedReasons}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">IP (hash)</td><td style="padding:8px 0;">${escapedIpHash}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Origen</td><td style="padding:8px 0;">${escapedSource}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Fecha</td><td style="padding:8px 0;">${escapedSubmittedAt}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Nombre</td><td style="padding:8px 0;">${escapedName}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Email</td><td style="padding:8px 0;">${escapedEmail}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6);">Empresa</td><td style="padding:8px 0;">${escapedCompany}</td></tr>
            <tr><td style="padding:8px 0; color:rgba(255,255,255,0.6); vertical-align:top;">Mensaje</td><td style="padding:8px 0; line-height:1.7;">${escapedMessage}</td></tr>
          </table>
        </div>
      </div>
    `,
  };
}

function getTurnstileConfiguration(env = process.env) {
  const secret = normalizeSingleLine(env.TURNSTILE_SECRET_KEY);
  const siteKey = normalizeSingleLine(env.VITE_TURNSTILE_SITE_KEY);

  if (secret && siteKey) {
    return { enabled: true, misconfigured: false };
  }

  if (secret || siteKey) {
    return {
      enabled: false,
      misconfigured: isProductionEnvironment(env),
    };
  }

  return { enabled: false, misconfigured: false };
}

async function verifyTurnstileToken(token, ip, env = process.env) {
  const turnstileConfig = getTurnstileConfiguration(env);
  if (turnstileConfig.misconfigured) {
    return { ok: false, reason: 'turnstile_misconfigured' };
  }

  if (!turnstileConfig.enabled) {
    return { ok: true, reason: 'turnstile_not_configured' };
  }

  if (!token) {
    return { ok: false, reason: 'turnstile_missing' };
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: ip || '',
    }),
  });

  if (!response.ok) {
    return { ok: false, reason: 'turnstile_http_error' };
  }

  const result = await response.json();
  if (!result?.success) {
    return {
      ok: false,
      reason: Array.isArray(result?.['error-codes'])
        ? result['error-codes'].join(',')
        : 'turnstile_failed',
    };
  }

  return { ok: true, reason: 'turnstile_verified' };
}

function isJsonRequest(request) {
  const contentType = normalizeSingleLine(request.headers.get('content-type'));
  return contentType.toLowerCase().startsWith('application/json');
}

function createSubmissionRequest(url, { method, body, headers = {} } = {}) {
  return new Request(url, {
    method,
    headers,
    body,
  });
}

async function sendSubmissionEmail(message, env = process.env, transportFactory = createTransport) {
  const transport = transportFactory(env);
  await transport.sendMail(message);
}

function buildMailMessage({ submission, source, spamVerdict, spamReasons, ipHash, env = process.env, submittedAt = new Date().toISOString() }) {
  const mailboxRoute = getMailboxRoute(spamVerdict, env);
  const from = normalizeSingleLine(env.CONTACT_FROM_EMAIL || env.SMTP_USER);

  if (!mailboxRoute.to || !from) {
    return {
      ok: false,
      route: mailboxRoute.route,
      reason: 'mailbox_not_configured',
    };
  }

  const { subject, text, html } = createEmailContent({
    submission,
    source,
    submittedAt,
    spamVerdict,
    spamReasons,
    ipHash,
  });

  return {
    ok: true,
    route: mailboxRoute.route,
    message: {
      from,
      to: mailboxRoute.to,
      replyTo: submission.email,
      subject,
      text,
      html,
    },
  };
}

export async function handleContactGet(request, { env = process.env, now = Date.now() } = {}) {
  const turnstileConfig = getTurnstileConfiguration(env);

  if (turnstileConfig.misconfigured) {
    return jsonResponse(503, { error: PUBLIC_RETRY_MESSAGE });
  }

  try {
    const { token } = createFormSession(now, env);
    return jsonResponse(
      200,
      {
        formToken: token,
        minSubmitDelayMs: MIN_SUBMIT_DELAY_MS,
        challengeRequired: turnstileConfig.enabled,
      },
      {
        cookies: [buildFormCookie(token, env)],
      }
    );
  } catch (error) {
    console.error('Contact form session bootstrap failed.', {
      code: 'contact_form_secret_missing',
      message: error instanceof Error ? error.message : 'unknown',
    });
    return jsonResponse(503, { error: PUBLIC_RETRY_MESSAGE });
  }
}

export async function handleContactPost(
  request,
  {
    env = process.env,
    now = Date.now(),
    stores = contactStores,
    firewallRateLimiter = checkFirewallRateLimit,
    turnstileVerifier = verifyTurnstileToken,
    mailSender = sendSubmissionEmail,
  } = {}
) {
  const expiredCookie = buildExpiredFormCookie(env);
  const turnstileConfig = getTurnstileConfiguration(env);
  if (turnstileConfig.misconfigured) {
    return jsonResponse(503, { error: PUBLIC_RETRY_MESSAGE }, { cookies: [expiredCookie] });
  }

  if (!isJsonRequest(request)) {
    return jsonResponse(415, { error: PUBLIC_INVALID_MESSAGE }, { cookies: [expiredCookie] });
  }

  const requestOrigin = normalizeSingleLine(request.headers.get('origin'));
  if (!isAllowedOrigin(requestOrigin, env)) {
    return jsonResponse(403, { error: PUBLIC_RETRY_MESSAGE }, { cookies: [expiredCookie] });
  }

  const parsedBody = await parseJsonBody(request);
  if (!parsedBody.ok) {
    return jsonResponse(
      parsedBody.reason === 'body_too_large' ? 413 : 400,
      { error: PUBLIC_INVALID_MESSAGE },
      { cookies: [expiredCookie] }
    );
  }

  const validation = validateSubmission(parsedBody.body);
  if (!validation.ok) {
    return jsonResponse(400, { error: PUBLIC_INVALID_MESSAGE }, { cookies: [expiredCookie] });
  }

  const cookies = parseCookies(request.headers.get('cookie'));
  const sessionVerification = verifyFormSession(
    {
      bodyToken: validation.data.formToken,
      cookieToken: cookies[FORM_COOKIE_NAME],
      now,
      env,
    },
    stores.usedTokens
  );
  if (!sessionVerification.ok) {
    if (sessionVerification.reason === 'token_replayed') {
      return jsonResponse(202, { ok: true }, { cookies: [expiredCookie] });
    }
    return jsonResponse(400, { error: PUBLIC_INVALID_MESSAGE }, { cookies: [expiredCookie] });
  }

  const clientIp = getClientIp(request);
  const rateLimit = await applyRateLimit(request, {
    env,
    ip: clientIp,
    now,
    stores,
    firewallRateLimiter,
  });
  if (!rateLimit.ok) {
    return jsonResponse(
      429,
      { error: PUBLIC_RETRY_MESSAGE },
      {
        cookies: [expiredCookie],
        headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const turnstileVerification = await turnstileVerifier(
    validation.data.turnstileToken,
    clientIp,
    env
  );
  if (!turnstileVerification.ok) {
    return jsonResponse(403, { error: PUBLIC_RETRY_MESSAGE }, { cookies: [expiredCookie] });
  }

  const duplicateCheck = checkDuplicateSubmission(validation.data, clientIp, now, stores.duplicates);
  if (!duplicateCheck.ok) {
    rememberUsedToken(sessionVerification.payload.nonce, now, stores.usedTokens);
    return jsonResponse(202, { ok: true }, { cookies: [expiredCookie] });
  }

  const abuseScore = scoreSubmissionForAbuse(validation.data, env);
  const ipHash = hashForLogs(clientIp, env);
  const trustedSource = getTrustedSource(request, env);

  if (abuseScore.verdict === 'drop') {
    rememberUsedToken(sessionVerification.payload.nonce, now, stores.usedTokens);
    console.warn('Contact submission dropped by abuse controls.', {
      code: 'submission_dropped',
      reasons: abuseScore.reasons,
      ipHash,
    });
    return jsonResponse(202, { ok: true }, { cookies: [expiredCookie] });
  }

  const mailBuild = buildMailMessage({
    submission: validation.data,
    source: trustedSource,
    spamVerdict: abuseScore.verdict,
    spamReasons: abuseScore.reasons,
    ipHash,
    env,
  });

  if (!mailBuild.ok && abuseScore.verdict === 'review') {
    rememberUsedToken(sessionVerification.payload.nonce, now, stores.usedTokens);
    console.warn('Contact submission quarantined without mailbox target.', {
      code: 'review_without_quarantine',
      reasons: abuseScore.reasons,
      ipHash,
    });
    return jsonResponse(202, { ok: true }, { cookies: [expiredCookie] });
  }

  if (!mailBuild.ok) {
    stores.duplicates.delete(duplicateCheck.fingerprint);
    console.error('Contact form delivery failed.', {
      code: 'mailbox_not_configured',
      ipHash,
    });
    return jsonResponse(503, { error: PUBLIC_RETRY_MESSAGE }, { cookies: [expiredCookie] });
  }

  try {
    await mailSender(mailBuild.message, env);
    rememberUsedToken(sessionVerification.payload.nonce, now, stores.usedTokens);
    return jsonResponse(200, { ok: true }, { cookies: [expiredCookie] });
  } catch (error) {
    stores.duplicates.delete(duplicateCheck.fingerprint);
    console.error('Contact form delivery failed.', {
      code: 'mail_delivery_failed',
      message: error instanceof Error ? error.message : 'unknown',
      ipHash,
    });
    return jsonResponse(503, { error: PUBLIC_RETRY_MESSAGE }, { cookies: [expiredCookie] });
  }
}

export async function GET(request) {
  return handleContactGet(request);
}

export async function POST(request) {
  return handleContactPost(request);
}

export { createSubmissionRequest };
