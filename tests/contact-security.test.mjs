import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkDuplicateSubmission,
  checkRateLimit,
  classifyAbusiveLanguage,
  createContactStores,
  createEmailContent,
  createFormSession,
  handleContactPost,
  isAllowedOrigin,
  scoreSubmissionForAbuse,
  validateSubmission,
  verifyFormSession,
} from '../api/contact.js';

const baseSubmission = {
  name: 'Antonio Gasco',
  email: 'antonio@example.com',
  company: 'Nexo Base',
  message: 'Quiero entender dónde se están perdiendo oportunidades y cómo priorizar la mejora.',
  privacyAccepted: true,
  website: '',
  formToken: 'placeholder-token',
  turnstileToken: 'challenge-token',
};

function createTestEnv(overrides = {}) {
  return {
    NODE_ENV: 'test',
    CONTACT_FORM_SECRET: 'test-secret',
    CONTACT_TO_EMAIL: 'inbox@example.com',
    CONTACT_QUARANTINE_TO_EMAIL: 'review@example.com',
    CONTACT_FROM_EMAIL: 'mailer@example.com',
    SMTP_USER: 'mailer@example.com',
    ...overrides,
  };
}

function createSignedPostRequest(payload, env, now, origin = 'https://nexobase.dev') {
  const { token } = createFormSession(now - 5000, env);

  return new Request('https://nexobase.dev/api/contact', {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      Cookie: `nexo_contact_session=${token}`,
      'X-Forwarded-For': '203.0.113.9',
      'X-Real-Ip': '203.0.113.9',
    },
    body: JSON.stringify({
      ...baseSubmission,
      ...payload,
      formToken: token,
    }),
  });
}

test('validateSubmission normalizes text and rejects unexpected fields', () => {
  const valid = validateSubmission({
    ...baseSubmission,
    name: ' Antonio\u200b ',
    company: 'Nexo\u00A0Base',
  });

  assert.equal(valid.ok, true);
  assert.equal(valid.data.name, 'Antonio');
  assert.equal(valid.data.company, 'Nexo Base');

  const invalid = validateSubmission({
    ...baseSubmission,
    rogue: true,
  });

  assert.equal(invalid.ok, false);
  assert.equal(invalid.reason, 'unexpected_fields');
});

test('createEmailContent escapes user-controlled HTML and keeps a fixed subject', () => {
  const email = createEmailContent({
    submission: {
      name: '<img src=x onerror=alert(1)>',
      email: 'antonio@example.com',
      company: '<b>Nexo</b>',
      message: 'Hola <script>alert(1)</script>',
    },
    source: 'https://nexobase.dev',
    submittedAt: '2026-04-01T11:00:00.000Z',
    spamVerdict: 'allow',
    spamReasons: [],
    ipHash: 'abc123',
  });

  assert.equal(email.subject, 'Nueva solicitud de diagnóstico');
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(email.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(email.html, /<script>alert\(1\)<\/script>/);
});

test('classifyAbusiveLanguage drops spaced and punctuated insults', () => {
  const abuse = classifyAbusiveLanguage(
    {
      ...baseSubmission,
      message: 'Eres un h.i.j.o    d e   p.u.t.a y no vuelvo.',
    },
    createTestEnv()
  );

  assert.equal(abuse.verdict, 'drop');
  assert.equal(abuse.match, 'hijo de puta');
});

test('classifyAbusiveLanguage reviews leetspeak accusations', () => {
  const abuse = classifyAbusiveLanguage(
    {
      ...baseSubmission,
      message: 'Tu servicio es una e$taf4 y eres un t1mador.',
    },
    createTestEnv()
  );

  assert.equal(abuse.verdict, 'review');
  assert.ok(['estafa', 'timador'].includes(abuse.match));
});

test('classifyAbusiveLanguage respects allowlisted phrases to avoid false positives', () => {
  const abuse = classifyAbusiveLanguage(
    {
      ...baseSubmission,
      message: 'Necesito una landing anti-estafa para proteger a mis clientes.',
    },
    createTestEnv({
      PROFANITY_ALLOWLIST_TERMS: 'anti estafa',
    })
  );

  assert.equal(abuse.verdict, 'allow');
});

test('scoreSubmissionForAbuse routes allow, review, and drop correctly', () => {
  assert.equal(
    scoreSubmissionForAbuse(baseSubmission, createTestEnv()).verdict,
    'allow'
  );

  assert.equal(
    scoreSubmissionForAbuse(
      {
        ...baseSubmission,
        message: 'Si no respondes, os voy a denunciar y hablaré con mi abogado.',
      },
      createTestEnv()
    ).verdict,
    'review'
  );

  assert.equal(
    scoreSubmissionForAbuse(
      {
        ...baseSubmission,
        message: 'FREE TRAFFIC NOW!!!!! visit https://spam.example and https://spam-two.example hijo de puta',
      },
      createTestEnv()
    ).verdict,
    'drop'
  );
});

test('form sessions require matching cookie/body tokens and a minimum dwell time', () => {
  const env = createTestEnv();
  const now = Date.UTC(2026, 3, 1, 11, 0, 0);
  const { token } = createFormSession(now, env);
  const usedTokens = new Map();

  const tooFast = verifyFormSession(
    {
      bodyToken: token,
      cookieToken: token,
      now: now + 1000,
      env,
    },
    usedTokens
  );
  assert.equal(tooFast.ok, false);
  assert.equal(tooFast.reason, 'submitted_too_fast');

  const accepted = verifyFormSession(
    {
      bodyToken: token,
      cookieToken: token,
      now: now + 5000,
      env,
    },
    usedTokens
  );
  assert.equal(accepted.ok, true);

  usedTokens.set(accepted.payload.nonce, now + 5000);
  const replay = verifyFormSession(
    {
      bodyToken: token,
      cookieToken: token,
      now: now + 6000,
      env,
    },
    usedTokens
  );
  assert.equal(replay.ok, false);
  assert.equal(replay.reason, 'token_replayed');
});

test('rate limit and duplicate checks trip on bursts and identical replays', () => {
  const now = Date.UTC(2026, 3, 1, 11, 0, 0);
  const rateStore = new Map();

  assert.equal(checkRateLimit('203.0.113.9', now, rateStore).ok, true);
  assert.equal(checkRateLimit('203.0.113.9', now + 10, rateStore).ok, true);
  assert.equal(checkRateLimit('203.0.113.9', now + 20, rateStore).ok, false);

  const duplicateStore = new Map();
  assert.equal(
    checkDuplicateSubmission(baseSubmission, '203.0.113.9', now, duplicateStore).ok,
    true
  );
  assert.equal(
    checkDuplicateSubmission(baseSubmission, '203.0.113.9', now + 1000, duplicateStore).ok,
    false
  );
});

test('origin allowlist accepts expected hosts and rejects hostile origins', () => {
  const env = {
    NODE_ENV: 'production',
    CONTACT_ALLOWED_ORIGINS: 'https://nexobase.dev,https://preview.nexobase.dev',
  };

  assert.equal(isAllowedOrigin('https://nexobase.dev', env), true);
  assert.equal(isAllowedOrigin('https://preview.nexobase.dev', env), true);
  assert.equal(isAllowedOrigin('https://evil.example', env), false);
});

test('handleContactPost silently absorbs dropped abuse without sending email', async () => {
  const env = createTestEnv();
  const stores = createContactStores();
  const now = Date.UTC(2026, 3, 1, 11, 0, 0);
  const request = createSignedPostRequest(
    {
      message: 'Eres un h.i.j.o d.e p.u.t.a',
    },
    env,
    now
  );
  const deliveries = [];

  const response = await handleContactPost(request, {
    env,
    now,
    stores,
    firewallRateLimiter: async () => ({ rateLimited: false }),
    turnstileVerifier: async () => ({ ok: true }),
    mailSender: async (message) => {
      deliveries.push(message);
    },
  });

  assert.equal(response.status, 202);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(deliveries.length, 0);
});

test('handleContactPost routes review traffic to quarantine instead of the main inbox', async () => {
  const env = createTestEnv();
  const stores = createContactStores();
  const now = Date.UTC(2026, 3, 1, 11, 0, 0);
  const request = createSignedPostRequest(
    {
      message: 'Tu servicio es una estafa y os voy a denunciar.',
    },
    env,
    now
  );
  const deliveries = [];

  const response = await handleContactPost(request, {
    env,
    now,
    stores,
    firewallRateLimiter: async () => ({ rateLimited: false }),
    turnstileVerifier: async () => ({ ok: true }),
    mailSender: async (message) => {
      deliveries.push(message);
    },
  });

  assert.equal(response.status, 200);
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].to, 'review@example.com');
  assert.equal(deliveries[0].subject, 'Revisión manual: solicitud de diagnóstico');
});

test('handleContactPost returns 429 when the firewall rate limiter blocks the request', async () => {
  const env = createTestEnv({ NODE_ENV: 'production' });
  const stores = createContactStores();
  const now = Date.UTC(2026, 3, 1, 11, 0, 0);
  const request = createSignedPostRequest({}, env, now);
  let sendAttempted = false;

  const response = await handleContactPost(request, {
    env,
    now,
    stores,
    firewallRateLimiter: async () => ({ rateLimited: true }),
    turnstileVerifier: async () => ({ ok: true }),
    mailSender: async () => {
      sendAttempted = true;
    },
  });

  assert.equal(response.status, 429);
  assert.equal(sendAttempted, false);
  assert.deepEqual(await response.json(), {
    error: 'No se pudo enviar la solicitud ahora mismo. Inténtalo de nuevo en unos minutos.',
  });
});
