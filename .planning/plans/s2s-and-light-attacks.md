# Plan — Add service-to-service auth, make attacks light, trim familiar slides

Decisions (user, 2026-11-01):
- Attacks: SQLi / XSS / CSRF become **one slide** of cards with a one-line "what" + one-line fix + links for self-study. RBAC, hidden button, IDOR stay (they are authorization).
- New section **service-to-service**: core + alternatives (~7 content slides + 1–2 "Your turn"). It becomes **section 04**; permissions & attacks moves to **05**.
- Trim sections 1–2 so the talk stays ~45–48 min.
Source: `spartan-khanhdo/auth-security-lecture/.planning/contents/lecture-4-service-to-service.md` (+ speaker notes), simplified for interns.

## Real-world examples (added 2026-11-01, user request)

The user wants real OAuth / OIDC examples instead of invented ones.

### Section 03 · Claude replaces CalApp as the running example
- **3.1** "Claude never asks for your Google password": the bad version is a chat box asking for your Gmail password; the real version is the **Connect** button on Claude's Google Workspace connector.
- **3.2** four roles = **You** (resource owner) · **Claude** (client) · **accounts.google.com** (authorization server) · **Gmail / Calendar / Drive APIs** (resource server). Valet-key line stays.
- **3.3** the flow is the real "Connect" path: Claude redirects to Google → you log in + read the consent screen (it lists what Claude asks for) → back to Claude with a code → Claude's backend trades it for tokens → Claude calls the Calendar API. "Claude only sees what your Google account can see."
- **NEW 3.4 "Same flow, every connector"**: Claude's connectors for Notion, Slack, GitHub, Atlassian… and any remote MCP server use the same OAuth dance. Facts from the MCP authorization spec (2025-06-18): OAuth 2.1, **PKCE required**, the token is requested for one specific server (`resource=https://mcp.notion.com/…`) and the server **must reject tokens made for anyone else** → foreshadows `aud` in section 04. Revoke per app: Google account → connections, Notion → settings, or disconnect in Claude.
- **NEW 3.5 "OAuth has a few grant types: pick by who is asking"** (user, 2026-11-01: definitions only, not deep). One table/card grid, one line each + a real example; no flows, no parameters. Definitions follow auth0.com/intro-to-iam/what-is-oauth-2:
  | Grant | One-line definition | You've seen it |
  |---|---|---|
  | Authorization Code | user logs in at the provider, app gets a one-time code and trades it for tokens on its backend | Claude's Google connector (3.3) |
  | Authorization Code + PKCE | same, plus a one-time proof instead of a secret, for apps that can't keep one | SPAs, mobile apps, every MCP client (3.4) |
  | Client Credentials | a service logs in as itself, no user involved | Orders → Payments (section 04) |
  | Device Authorization | a device with no keyboard shows a code, you approve on your phone | YouTube on a smart TV, `gh auth login` |
  | Refresh Token | trade a refresh token for a new access token, no login again | staying logged in for weeks |
  - A dimmed "legacy, avoid" row: **Implicit** (token comes back in the URL; deprecated) · **Resource Owner Password** (the app collects your password itself, the 3.1 anti-pattern; dropped in OAuth 2.1).
  - Footer link: auth0.com/intro-to-iam/what-is-oauth-2. Section 04's Client Credentials slide refers back here.
- **3.6** (was 3.4) **"Login with Google" = OIDC + OAuth** (user, 2026-11-01). Same Claude, two buttons:
  - *Connect Google Calendar* inside Claude = **OAuth only** → `access_token`: Claude may read your calendar; it says nothing about who you are.
  - *Continue with Google* on claude.ai's login page = **OIDC on top of OAuth** → same Authorization Code flow + `scope=openid email profile` → Google returns an **`id_token`** (JWT: `iss`, `sub`, `email`, `aud` = Claude's client_id, `exp`) next to the `access_token`. The `id_token` is what logs you in.
  - Layout: two columns (Connector · Sign-in) with the scope, what comes back, and what it proves; the decoded `id_token` under the sign-in column. Keep the "verify iss / aud / exp, key users by `sub`" line.
  - Section 03 title/divider stays "Login with Google" but the lead says "OAuth lets an app act for you; OIDC adds who you are on top."
  - One line: "OIDC also works without a human — see GitHub → AWS in section 04."
- 3.7 MFA, 3.8 Do/Don't: rows say Claude / your app instead of CalApp. PKCE stays a one-liner (now with a real reason: "every MCP client must use it").
- Sources: support.claude.com/en/articles/10166901 (Google Workspace connectors), modelcontextprotocol.io/specification/2025-06-18/basic/authorization. Don't claim whether Claude can send email (help-center versions disagree); stick to "reads what your account can read; you approve; you revoke".

### Section 04 · GitHub Actions → AWS as the real service-to-service example
- **NEW 4.6 "GitHub deploys to AWS without a stored key"** (before alternatives), stepped flow:
  1. the workflow asks GitHub for an **OIDC token** (`permissions: id-token: write`) — issuer `https://token.actions.githubusercontent.com`, `aud: sts.amazonaws.com`, `sub: repo:spartan/shop:ref:refs/heads/main`;
  2. `aws-actions/configure-aws-credentials` sends it to AWS STS (`AssumeRoleWithWebIdentity`, `role-to-assume: arn:aws:iam::…:role/deploy`);
  3. AWS checks the trust policy (issuer + `aud` + `sub` = this repo, this branch) → **temporary credentials (~1 h)**;
  4. deploy. No `AWS_ACCESS_KEY_ID` in GitHub secrets, nothing to leak or rotate.
  Show the 6-line workflow YAML and the 2 trust-policy conditions. Link: GitHub docs "Configuring OpenID Connect in Amazon Web Services".
- **NEW "Your turn" before it** (open): "Your GitHub Action deploys to AWS. Where do you keep the AWS keys?" → answer: nowhere — GitHub proves who the workflow is with OIDC, AWS hands out 1-hour credentials.
- Do/Don't gets a row: KEYS IN CI (`AWS_ACCESS_KEY_ID` in repo secrets → OIDC role per repo/branch).
- Kahoot: one of the two new S2S questions becomes the GitHub → AWS one.

**Slide count update:** 51 + 1 (3.4 connectors) + 1 (3.5 grant types) + 2 (4.6 + its question) = **55**, ≈ **52 min**. If that's too long, the first cut candidates are 3.7 MFA (familiar) and 4.2 API key table.

**Pending flow-animation plan:** its 3.3 OAuth lanes must use Claude / Google / Calendar API, and the S2S 4.3 and 4.6 flows are natural candidates for the same lane component — refresh that plan after this one lands.

## New order

```
00 Introduction · 01 Passwords · 02 Staying logged in · 03 Login with Google
04 Service-to-service  (NEW)
05 Permissions & attacks  (was 04)
99 Thanks + Kahoot
```

## 04 · Service-to-service (new file `sections/04-service-to-service.html`)

Running example: **Orders service** calls **Payments service** — no user, no browser.

| # | Slide | Content |
|---|---|---|
| divider | Service-to-service | "No user, no browser, no login form. Services still have to prove who they are." |
| 4.1 | Inside the cluster, any pod can call Payments | Diagram: Frontend → Orders → Inventory / Payments; a compromised pod → Payments with "no identity check". Why section 2 doesn't apply: no cookie, no password typed, nobody to click "Allow". |
| ? | **Your turn** (open) | "Orders calls Payments, no user involved. How does Payments know the caller is really Orders?" → answer: give Orders its own identity, trade it for a short-lived token. |
| 4.2 | A shared API key works until it leaks | Table: static API key (`X-Api-Key: sk_live…` — never expires, same key everywhere, no scopes) vs **Client Credentials** (client_id + secret → short-lived, scoped JWT from an auth server). |
| 4.3 | Orders logs in as itself and gets a 5-minute token | Stepped flow (→): Orders → Auth server `POST /oauth/token` (`grant_type=client_credentials`, `client_id`, `client_secret`, `scope=payments.charge`) → `{access_token, expires_in: 300}` → Payments with `Authorization: Bearer …`. Request/response shown as code. Callout: same OAuth from section 3, minus the user. |
| 4.4 | The token says who is calling, for whom, and what it may do | Decoded payload: `iss` auth server, `sub: "orders-service"`, `aud: "payments-service"`, `scope: "payments.charge"`, `exp`. "Same JWT as section 2." |
| ? | **Your turn** (A/B) | "Payments gets a correctly signed token, but `aud` is `inventory-service`. Accept it?" A yes, the signature is valid · **B no** → it was made for someone else; a token stolen from Inventory must not work on Payments. |
| 4.5 | Payments checks the token, then the scope | Two steps: **validate** (signature with the auth server's public key, `iss`, `aud`, `exp` → else 401) then **authorize** (scope → endpoint: `payments.charge` → `POST /charges`, `payments.read` → `GET /charges/*` → else 403). Callback to 0.3 (401 vs 403). |
| 4.6 | Other ways services prove who they are | 3 concept cards: **mTLS** (both sides show a certificate; identity at the connection), **service mesh** (Istio / Linkerd sidecars do mTLS for you), **API keys** (fine for simple third-party APIs). Mental model line: OAuth = how you get the token · JWT = what it looks like · Payments' policy = what you may do. No handshake demo. |
| 4.7 | Do / Don't (paired rows, same component as 1.6) | SECRET (secret in code/git → secret manager, rotate) · LIFETIME (API key forever → 5–15 min token, cached until expiry) · AUDIENCE (accept any valid token → `aud` must be me) · SCOPE (one `admin` scope → `payments.charge`, `payments.read`) · IDENTITY (all services share one client → one `client_id` per service, log it). |

## 05 · Permissions & attacks (was 04)

- Keep: 5.1 RBAC, Your turn (hidden button), 5.2 hidden button, 5.3 IDOR — renumbered from 4.x.
- **Remove**: 4.4 SQLi, 4.5 XSS, 4.6 CSRF and the SQLi "Your turn" slide.
- **Add 5.4 "Four attacks to study on your own"** — 2×2 cards: SQL injection · XSS · CSRF · brute force & credential stuffing. Each card: what it is (1 line), the fix (1 line, code where useful: `?` placeholders, framework escaping, `SameSite` + CSRF token, rate limit + MFA), and 2 links:
  - SQLi: portswigger.net/web-security/sql-injection · OWASP SQL Injection Prevention Cheat Sheet
  - XSS: portswigger.net/web-security/cross-site-scripting · OWASP XSS Prevention Cheat Sheet
  - CSRF: portswigger.net/web-security/csrf · OWASP CSRF Prevention Cheat Sheet
  - Credential stuffing: portswigger.net/web-security/authentication · OWASP Authentication Cheat Sheet
  - Footer line: OWASP Top 10 (owasp.org/Top10) + PortSwigger Web Security Academy (free labs).
  Links are real `<a target="_blank">`, shown as short readable text; every URL checked with `curl -I` before commit.
- 5.5 checklist (was 4.7): replace the two attack rows with one "attacks → see 5.4 links" row and add one service-to-service row; stays 10 rows.

## Trims in familiar sections

| Slide | Why it can go |
|---|---|
| 2.1 HTTP forgets you | The "Your turn" before it already asks and answers this; the question now leads straight into the session-cookie slide. |
| 2.4 Base64 is not encryption | 2.3 decodes the token live and the "Your turn" (JWT readable?) answers it; move the "never put inside" line onto 2.3. |
| 2.7 Access + refresh token | Covered by the Do/Don't LIFETIME row; refresh tokens come back in 4.3 as "cached until expiry". |

Section 2 renumbers 2.2→2.1 … (eyebrows + cross-refs: 2.8 → 2.5, links from old attack slides disappear). Section 1 unchanged.

**Slide count:** 47 − 3 (trims) − 4 (attack slides + SQLi question) + 1 (attack cards) + 10 (S2S) = **51**. Time ≈ 45 − 3 − 5 + 1 + 10 ≈ **48 min**.

## Files

```
presentation/sections/04-service-to-service.html   NEW
presentation/sections/04-authz-attacks.html        → rename 05-authz-attacks.html, edit
presentation/sections/02-sessions-jwt.html         trims + renumber
presentation/index.html                            SECTIONS order
presentation/sections/00-outline.html              add 04 row, 05 row
presentation/css/deck.css                          s4 (s2s) block, attack-card block; remove CSS of deleted slides
presentation/auth-outline.md                       new §4, §5, trims, cut list (service-to-service no longer cut; mTLS concept-only)
presentation/notes/speaker-script.md               new entries, removed entries, renumber, time table
presentation/notes/kahoot-questions.md             replace 2 questions (XSS, base64) with 2 S2S ones (aud check, client credentials)
presentation/CLAUDE.md, README.md                  section list / interactive slides
```

## Steps

1. Agent A — new section 04 (HTML + its CSS block + index/outline entries). Agent B in parallel — trims in 02, attack cards + removals in 05, renumbers; puts any new CSS in a temporary `<style>` in its section (moved to deck.css by me) to avoid both editing deck.css at once.
2. Me — merge CSS, `renumber.py`, check links (`curl -I`), PDF review of every changed slide in both themes.
3. Agent C — outline, speaker script (Vietnamese), Kahoot, READMEs, after the slides are final.
4. Commits: `feat(deck): add service-to-service section` · `refactor(deck): trim familiar slides and lighten attacks` · `docs(deck): update outline, script and kahoot for s2s`.

## Test strategy

No automated tests for the deck (as before). Checks: script parse, no duplicate ids, footers 1–51 consistent, `?print` PDF read page by page, light theme spot checks, console clean, every external link returns 2xx/3xx.

## Risks

- **Too deep again**: S2S can drift into JWKS/key rotation/mesh internals. Keep to the table above; mTLS/mesh are one card each.
- **Renumbering ripples**: section 2 and section 4→5 numbers change; cross-refs in slides, script, Kahoot and the pending flow-animation plan must follow. Grep for `\b[245]\.\d\b` after the change.
- **Pending flow-animation plan** (`port-flow-animations.md`) targets 0.2, "new 2.6" and 3.3 — 2.x numbering changes here; that plan must be refreshed before it runs.
- **Links rot**: use stable top-level topic pages, verify at build time.
