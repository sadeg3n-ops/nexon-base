import crypto from 'node:crypto';
import nodemailer from 'nodemailer';

const DEFAULT_TO_EMAIL = 'work.tonyg@gmail.com';
const DEFAULT_ALLOWED_ORIGINS = ['https://nexobase.dev', 'https://www.nexobase.dev'];
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
const PROFANITY_TERMS = [
  'puta',
  'puto',
  'mierda',
  'gilipollas',
  'imbecil',
  'imbécil',
  'idiota',
  'cabron',
  'cabrón',
  'fuck',
  'shit',
  'bitch',
  'scam',
  'estafa',
];

const contactStores = globalThis.__nexobaseContactStores || {
  rateLimit: new Map(),
  duplicates: new Map(),
  usedTokens: new Map(),
};
globalThis.__nexobaseContactStores = contactStores;

function isProductionEnvironment(env = process.env) {
  return env.VERCEL_ENV === 'production' || env.NODE_ENV === 'production';
}

function json(res, statusCode, payload, extraHeaders = {}) {
  res.status(statusCode);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
  }
  res.send(JSON.stringify(payload));
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

function normalizeForAbuseChecks(value) {
  return normalizeMultiline(value).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
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

function getOriginCandidates(env = process.env) {
  const configuredOrigins = normalizeSingleLine(env.CONTACT_ALLOWED_ORIGINS)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

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

function getTrustedSource(req, env = process.env) {
  const originHeader = normalizeSingleLine(req.headers.origin);
  if (isAllowedOrigin(originHeader, env)) {
    return originHeader;
  }

  const refererHeader = normalizeSingleLine(req.headers.referer);
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

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }

  return req.socket?.remoteAddress || 'unknown';
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

function getRequestBodySize(req, body) {
  const contentLengthHeader = req.headers['content-length'];
  if (typeof contentLengthHeader === 'string' && /^\d+$/.test(contentLengthHeader)) {
    return Number(contentLengthHeader);
  }

  if (typeof body === 'string') {
    return Buffer.byteLength(body);
  }

  try {
    return Buffer.byteLength(JSON.stringify(body || {}));
  } catch {
    return Number.MAX_SAFE_INTEGER;
  }
}

function parseJsonBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }

  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    return req.body;
  }

  return null;
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

export function scoreSubmissionForAbuse(submission) {
  const combinedText = [submission.name, submission.company, submission.message].join('\n');
  const compactText = normalizeForAbuseChecks(combinedText);
  const lowerText = normalizeMultiline(combinedText).toLowerCase();
  const repeatedCharacters = /(.)\1{6,}/u.test(lowerText);
  const linkMatches = lowerText.match(/(?:https?:\/\/|www\.)/g) || [];
  const hasMixedScripts = hasMixedScriptSpoofing(combinedText);
  const hasProfanity = PROFANITY_TERMS.some((term) => compactText.includes(normalizeForAbuseChecks(term)));
  const uppercaseRatio = (() => {
    const lettersOnly = submission.message.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
    if (lettersOnly.length < 12) {
      return 0;
    }

    const uppercaseLetters = lettersOnly.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '');
    return uppercaseLetters.length / lettersOnly.length;
  })();

  let score = 0;
  const reasons = [];

  if (linkMatches.length >= 1) {
    score += 1;
    reasons.push('contains_link');
  }

  if (linkMatches.length >= 2) {
    score += 3;
    reasons.push('multiple_links');
  }

  if (repeatedCharacters) {
    score += 2;
    reasons.push('repeated_characters');
  }

  if (hasProfanity) {
    score += 3;
    reasons.push('profanity');
  }

  if (hasMixedScripts) {
    score += 2;
    reasons.push('mixed_scripts');
  }

  if (uppercaseRatio > 0.65) {
    score += 1;
    reasons.push('excessive_uppercase');
  }

  const verdict =
    score >= 7 || (hasProfanity && linkMatches.length >= 1) ? 'drop' : score >= 4 ? 'review' : 'allow';

  return {
    score,
    reasons,
    verdict,
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

function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
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

async function verifyTurnstileToken(token, ip, env = process.env) {
  const secret = env.TURNSTILE_SECRET_KEY;
  const siteKey = env.VITE_TURNSTILE_SITE_KEY;
  if (!secret || !siteKey) {
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
      secret,
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

function isJsonRequest(req) {
  const contentType = normalizeSingleLine(req.headers['content-type'] || '');
  return contentType.toLowerCase().startsWith('application/json');
}

function getPublicMailTarget(verdict) {
  if (verdict === 'review') {
    return (
      process.env.CONTACT_QUARANTINE_TO_EMAIL ||
      process.env.CONTACT_TO_EMAIL ||
      DEFAULT_TO_EMAIL
    );
  }

  return process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
}

function shouldRequireTurnstile(env = process.env) {
  return Boolean(env.TURNSTILE_SECRET_KEY && env.VITE_TURNSTILE_SITE_KEY);
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { token } = createFormSession(Date.now(), process.env);
      res.setHeader('Set-Cookie', buildFormCookie(token, process.env));
      return json(res, 200, {
        formToken: token,
        minSubmitDelayMs: MIN_SUBMIT_DELAY_MS,
        challengeRequired: shouldRequireTurnstile(process.env),
      });
    } catch (error) {
      console.error('Contact form session bootstrap failed.', {
        code: 'contact_form_secret_missing',
        message: error instanceof Error ? error.message : 'unknown',
      });
      return json(res, 503, { error: PUBLIC_RETRY_MESSAGE });
    }
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { error: PUBLIC_INVALID_MESSAGE });
  }

  res.setHeader('Set-Cookie', buildExpiredFormCookie(process.env));

  if (!isJsonRequest(req)) {
    return json(res, 415, { error: PUBLIC_INVALID_MESSAGE });
  }

  const requestBodySize = getRequestBodySize(req, req.body);
  if (!Number.isFinite(requestBodySize) || requestBodySize > MAX_BODY_BYTES) {
    return json(res, 413, { error: PUBLIC_INVALID_MESSAGE });
  }

  const requestOrigin = normalizeSingleLine(req.headers.origin);
  if (!isAllowedOrigin(requestOrigin, process.env)) {
    return json(res, 403, { error: PUBLIC_RETRY_MESSAGE });
  }

  const parsedBody = parseJsonBody(req);
  const validation = validateSubmission(parsedBody);
  if (!validation.ok) {
    return json(res, 400, { error: PUBLIC_INVALID_MESSAGE });
  }

  const cookies = parseCookies(req.headers.cookie);
  const sessionVerification = verifyFormSession(
    {
      bodyToken: validation.data.formToken,
      cookieToken: cookies[FORM_COOKIE_NAME],
      now: Date.now(),
      env: process.env,
    },
    contactStores.usedTokens
  );
  if (!sessionVerification.ok) {
    if (sessionVerification.reason === 'token_replayed') {
      return json(res, 202, { ok: true });
    }
    return json(res, 400, { error: PUBLIC_INVALID_MESSAGE });
  }

  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp, Date.now(), contactStores.rateLimit);
  if (!rateLimit.ok) {
    return json(
      res,
      429,
      { error: PUBLIC_RETRY_MESSAGE },
      { 'Retry-After': String(rateLimit.retryAfterSeconds) }
    );
  }

  const turnstileVerification = await verifyTurnstileToken(
    validation.data.turnstileToken,
    clientIp,
    process.env
  );
  if (!turnstileVerification.ok) {
    return json(res, 403, { error: PUBLIC_RETRY_MESSAGE });
  }

  const duplicateCheck = checkDuplicateSubmission(
    validation.data,
    clientIp,
    Date.now(),
    contactStores.duplicates
  );
  if (!duplicateCheck.ok) {
    rememberUsedToken(sessionVerification.payload.nonce);
    return json(res, 202, { ok: true });
  }

  const abuseScore = scoreSubmissionForAbuse(validation.data);
  const ipHash = hashForLogs(clientIp, process.env);
  const trustedSource = getTrustedSource(req, process.env);

  if (abuseScore.verdict === 'drop') {
    rememberUsedToken(sessionVerification.payload.nonce);
    console.warn('Contact submission dropped by abuse controls.', {
      code: 'submission_dropped',
      reasons: abuseScore.reasons,
      ipHash,
    });
    return json(res, 202, { ok: true });
  }

  try {
    const transport = createTransport();
    const submittedAt = new Date().toISOString();
    const { subject, text, html } = createEmailContent({
      submission: validation.data,
      source: trustedSource,
      submittedAt,
      spamVerdict: abuseScore.verdict,
      spamReasons: abuseScore.reasons,
      ipHash,
    });

    await transport.sendMail({
      from: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER,
      to: getPublicMailTarget(abuseScore.verdict),
      replyTo: validation.data.email,
      subject,
      text,
      html,
    });

    rememberUsedToken(sessionVerification.payload.nonce);
    return json(res, 200, { ok: true });
  } catch (error) {
    contactStores.duplicates.delete(duplicateCheck.fingerprint);
    console.error('Contact form delivery failed.', {
      code: 'mail_delivery_failed',
      message: error instanceof Error ? error.message : 'unknown',
      ipHash,
    });
    return json(res, 503, { error: PUBLIC_RETRY_MESSAGE });
  }
}
