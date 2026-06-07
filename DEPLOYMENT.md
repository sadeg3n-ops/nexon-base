# Final free production setup

This repository already contains the code-side hardening for the contact flow on Vercel Hobby:

- `GET /api/contact` issues a signed form token and a `SameSite=Strict` `HttpOnly` cookie.
- `GET /api/contact` is rate-limited in code for Hobby.
- `POST /api/contact` enforces origin checks, signed-token validation, replay protection, duplicate suppression, moderation, and generic public errors.
- Turnstile server-side verification is enforced automatically once both Turnstile env vars exist.
- `drop` returns `202 {"ok":true}` and sends no email.
- `review` routes only to `CONTACT_QUARANTINE_TO_EMAIL`.
- `allow` routes only to `CONTACT_TO_EMAIL`.

Only the following dashboard actions remain manual.

## Switching nameservers to Cloudflare

Before changing the nameservers, recreate the Vercel-facing DNS records in Cloudflare.

Recommended records to add in Cloudflare:

- Apex `@`
  - Type: `CNAME`
  - Target: `c410c4249a5be747.vercel-dns-017.com`
  - Proxy: `Proxied`
- `www`
  - Type: `CNAME`
  - Target: `cname.vercel-dns.com`
  - Proxy: `Proxied`

Notes:

- No extra MX, SPF, DKIM, DMARC, or TXT records are currently published for `nexobase.dev`.
- The repository does not require custom subdomains beyond apex and `www`.
- The only API route in this project is `/api/contact`.
- Preview deployments do not depend on the public `nexobase.dev` zone because they resolve through Vercel preview domains.

Exact nameserver switch steps:

1. Disable DNSSEC before switching nameservers.
2. In the registrar panel, remove:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. Replace them with:
   - `nola.ns.cloudflare.com`
   - `uriah.ns.cloudflare.com`
4. Wait for propagation.
5. Verify propagation:

```bash
dig ns nexobase.dev @1.1.1.1
nslookup nexobase.dev
```

Expected result:

- authoritative nameservers are Cloudflare
- apex and `www` still resolve to the Vercel project

## 1. Create the Cloudflare Turnstile widget

Turnstile can be activated before Cloudflare nameservers are live.
It is enough that the widget is created for the final hostnames and that the Vercel project has the matching env vars.

1. Open Cloudflare Turnstile.
2. Create one widget for:
   - `nexobase.dev`
   - `www.nexobase.dev`
3. Copy:
   - the secret key
   - the site key

## 2. Add Turnstile keys in Vercel

In the Vercel project, add:

- `TURNSTILE_SECRET_KEY`
- `VITE_TURNSTILE_SITE_KEY`

Save them for `Production` and `Preview`.

Expected result after redeploy:

- `GET /api/contact` returns `"challengeRequired": true`
- `POST /api/contact` rejects submissions without a valid Turnstile token

Quick verification:

```bash
curl -i https://nexobase.dev/api/contact
```

Confirm the JSON response includes:

- `"challengeRequired": true`

## 3. Publish one native WAF rate-limit rule for `POST /api/contact`

Hobby only gives one native rate-limit rule, so use it on `POST /api/contact`.

In Vercel Firewall:

1. Create one rule for `POST /api/contact`
2. Use the same rate-limit ID as `CONTACT_RATE_LIMIT_ID`
3. Publish the rule

Notes:

- Prioritize `POST /api/contact`
- `GET /api/contact` is already rate-limited in code as the Hobby fallback path

## 4. Switch Bot Protection from Log to Challenge

In Vercel Firewall managed rules:

1. Open Bot Protection
2. Change action from `Log` to `Challenge`
3. Publish the Firewall changes

## 5. Connect GitHub repo in Project Settings -> Git

In the Vercel project:

1. Open `Project Settings -> Git`
2. Connect the repository
3. Confirm the repository is the canonical one for this site

## 6. Ensure `main` is the production branch

In Vercel project Git settings:

1. Set `main` as the production branch
2. Confirm future pushes to `main` publish to `nexobase.dev`

## 7. Enable Require Verified Commits

In GitHub repository settings:

1. Open branch protection for `main`
2. Enable `Require verified commits`

## 8. Redeploy

After completing the dashboard steps above, redeploy production.

## 9. Run final curl verification

Run these checks against production:

```bash
curl -I https://nexobase.dev
curl -i https://nexobase.dev/api/contact
curl -i -X POST https://nexobase.dev/api/contact \
  -H 'Origin: https://evil.example' \
  -H 'Content-Type: application/json' \
  -d '{}'
curl -i https://nexobase.dev
```

Final verification matrix:

- `curl -I https://nexobase.dev` returns `HTTP 200`
- `GET /api/contact` returns `200`
- `GET /api/contact` returns JSON
- `GET /api/contact` returns `Cache-Control: no-store`
- `GET /api/contact` sets the signed cookie with `HttpOnly` and `SameSite=Strict`
- `GET /api/contact` returns `"challengeRequired": true` once Turnstile keys exist
- hostile `Origin` is rejected
- an abusive `drop` phrase returns `202 {"ok":true}` and sends no email
- a `review` phrase routes only to `CONTACT_QUARANTINE_TO_EMAIL`
- a legitimate submission reaches `CONTACT_TO_EMAIL`
- `/` still returns CSP and HSTS with `includeSubDomains`
- pushes to `main` publish to `nexobase.dev`

## Cloudflare WAF readiness

For Cloudflare Free, configure one rate-limit rule with this priority:

- Method: `POST`
- Path: `/api/contact`
- Threshold: `5 requests`
- Period: `10 minutes`
- Scope: `per IP`
- Action: `Managed Challenge` or `Block`, depending on your tolerance for false positives

Keep Cloudflare Bot protection and Turnstile enabled on top of this.
The repository already assumes:

- native Cloudflare Turnstile verification on the server once env vars exist
- `allow / review / drop` moderation
- generic public errors
- `Cache-Control: no-store`
- safe HTML/text email composition
- replay protection
- strict origin enforcement
