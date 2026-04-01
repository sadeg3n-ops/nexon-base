import test from 'node:test';
import assert from 'node:assert/strict';

import {
  checkDuplicateSubmission,
  checkRateLimit,
  createEmailContent,
  createFormSession,
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

test('scoreSubmissionForAbuse flags obvious spam and unicode spoofing', () => {
  const spam = scoreSubmissionForAbuse({
    name: 'рromo team',
    email: 'antonio@example.com',
    company: 'Acme',
    message: 'FREE TRAFFIC NOW!!!!! visit https://spam.example and https://spam-two.example puta',
  });

  assert.equal(spam.verdict, 'drop');
  assert.ok(spam.reasons.includes('multiple_links'));
  assert.ok(spam.reasons.includes('profanity'));
  assert.ok(spam.reasons.includes('mixed_scripts'));
});

test('form sessions require matching cookie/body tokens and a minimum dwell time', () => {
  const env = { NODE_ENV: 'test', CONTACT_FORM_SECRET: 'test-secret' };
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
