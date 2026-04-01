# Deployment checklist

## 1. Set Vercel environment variables

Add these variables in both `Preview` and `Production`, then redeploy:

- `CONTACT_TO_EMAIL`
- `CONTACT_QUARANTINE_TO_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_ALLOWED_ORIGINS`
- `CONTACT_FORM_SECRET`
- `CONTACT_RATE_LIMIT_ID`
- `PROFANITY_ALLOWLIST_TERMS`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SECRET_KEY`
- `VITE_TURNSTILE_SITE_KEY`

Notes:

- Keep `TURNSTILE_SECRET_KEY`, `SMTP_PASS`, and `CONTACT_FORM_SECRET` server-only.
- Only `VITE_TURNSTILE_SITE_KEY` belongs in a `VITE_*` variable.
- `CONTACT_ALLOWED_ORIGINS` should include the exact public origins for the deployment.

## 2. Configure Cloudflare Turnstile

1. Create a Turnstile widget for `nexobase.dev` and `www.nexobase.dev`.
2. Copy the site key to `VITE_TURNSTILE_SITE_KEY`.
3. Copy the secret key to `TURNSTILE_SECRET_KEY`.
4. Redeploy after saving both values.

## 3. Configure Vercel Firewall / Rate Limiting

Create a Firewall rule in the Vercel dashboard that matches the SDK rate-limit ID:

1. Open the Vercel project.
2. Go to `Firewall`.
3. Select `Configure`.
4. Create a new rule:
   - Name: `Contact form rate limit`
   - First condition: `@vercel/firewall`
   - Rate limit ID: use the same value as `CONTACT_RATE_LIMIT_ID` (default `contact-form`)
   - Keep the default rate-limit settings or tune them to your traffic profile
5. Save the rule.
6. Publish the Firewall changes.

Important:

- If the Firewall rule is missing or the rate-limit ID does not match `CONTACT_RATE_LIMIT_ID`, the route falls back to the local in-memory limiter. That fallback is intentional for safety, but it is only best-effort on serverless.

Recommended extra dashboard rules:

- `POST /api/contact`
  - Action: Rate limit
  - Window: `10 minutes`
  - Limit: `5`
- `GET /api/contact`
  - Action: Rate limit
  - Window: `10 minutes`
  - Limit: `20`
- Bot Protection managed ruleset
  - Start in `Log`
  - Switch to `Challenge` after confirming no legitimate flow breaks

## 4. Redeploy

After saving env vars and Firewall changes:

```bash
npm run build
npx vercel --prod
```

## 5. Verification curl matrix

Use the production domain after redeploy:

```bash
curl -i https://nexobase.dev/api/contact
curl -i -X POST https://nexobase.dev/api/contact -H 'Content-Type: application/json' -d '{}'
curl -i -X POST https://nexobase.dev/api/contact -H 'Origin: https://evil.example' -H 'Content-Type: application/json' -d '{}'
curl -i https://nexobase.dev
```

What to verify:

- `GET /api/contact` returns `200`, `Cache-Control: no-store`, and a `SameSite=Strict` cookie.
- Wrong or incomplete JSON returns generic errors, not rule-specific detail.
- Hostile origins do not succeed.
- The homepage returns CSP, HSTS with `includeSubDomains`, and the other security headers.
- Review traffic goes only to `CONTACT_QUARANTINE_TO_EMAIL`.
- Obvious insults and threats return `202 {"ok":true}` and never reach email delivery.
