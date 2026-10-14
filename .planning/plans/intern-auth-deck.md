# Plan — vntech-auth: Authentication & Authorization deck (Intern level)

Content spec: [`presentation/auth-outline.md`](../../presentation/auth-outline.md) (Vietnamese, source of truth).
Reference repo (structure, engine, style): `spartan-trucle/vntech-load-balancer`.
Content source: `spartan-khanhdo/auth-security-lecture` (`.planning/contents/*.md`).

## Decisions (confirmed with user)

- Format: plain HTML/CSS/JS deck, no build step, GitHub Pages deploy — same as the LB repo.
- Scope: sections 0–5 + 99 as in the outline; advanced topics cut (list in outline).
- Demo: `demo/` Node + TS login server, driven live from slide 5.4, recorded fallback.
- Repo: `spartan-trucle/vntech-auth`, public, presenter Truc Le only.
- Extras: Vietnamese outline + speaker script, Kahoot QR closing slide, same visual style (Tokyo Night / Day).

## Files

```
README.md
.github/workflows/deploy-pages.yml          copy from LB
presentation/
  index.html                                copy LB shell; new SECTIONS list; add auth icons to sprite (#ic-lock, #ic-key, #ic-shield, #ic-user, #ic-cookie, #ic-token)
  README.md, CLAUDE.md                      adapted from LB (audience = interns, outline file name)
  .nojekyll
  css/deck.css                              copy as-is; additions only for new components (jwt-parts coloring)
  js/deck.js, js/charts-lib.js, js/vendor/qrcode.js   copy as-is (charts-lib: keep flow()/steps(), drop LB-only helpers if unused)
  js/backdrop.js                            copy; swap packet glyphs for lock/key glyphs (cosmetic)
  img/truc-le.jpg, img/spartan-logo.svg     copy
  tools/renumber.py                         copy
  auth-outline.md                           ✅ written
  sections/00-cover.html                    new title/byline (Truc only), lock + token illustration
  sections/00-outline.html                  new list
  sections/00-introduction.html             0.1–0.4
  sections/01-passwords.html                1.1–1.6 (+ step animation: plaintext → SHA-256 → salted → bcrypt)
  sections/02-sessions-jwt.html             2.1–2.9 (+ in-browser JWT decoder on 2.3, tamper animation on 2.5)
  sections/03-login-with-google.html        3.1–3.6 (+ Authorization Code flow animation via Charts.steps())
  sections/04-authz-attacks.html            4.1–4.7
  sections/05-demo.html                     5.1–5.5 (live fetch to :4000, recorded fallback)
  sections/99-thanks.html                   Kahoot QR, copy from LB
  notes/speaker-script.md                   Vietnamese, per slide
  notes/kahoot-questions.md                 ~10 intern-level MCQs
demo/
  package.json (pnpm; scripts: start, stop, status, users, login, check), tsconfig.json, README.md, .gitignore
  src/server.ts       node:http, CORS for the deck, routes from outline 5.1
  src/jwt.ts          HS256 sign/verify with node:crypto, rejects alg≠HS256
  src/auth.ts         requireAuth / requirePermission, RBAC table, in-memory users seeded (admin, editor, viewer)
  src/cli.ts          start/stop/status/users/login
```

## Steps (each ≤ half a day)

1. **Scaffold** — create repo layout, copy engine/style/tools/workflow from LB, empty sections list, verify the blank deck loads over `python3 -m http.server`. Commit `chore(deck): scaffold deck from vntech-load-balancer`.
2. **Demo server (TDD)** — write `node:test` tests first for `jwt.ts` (sign→verify ok, tampered payload → fail, `alg:none` → fail, expired → fail) and for routes (401 no token, 403 viewer on admin, 200 admin). Then implement. Commit `feat(demo): add login server with jwt and rbac`.
3. **Sections 00 + 01** — cover, outline, intro, passwords. Commit per section.
4. **Section 02** — sessions & JWT, including in-browser decoder. Commit.
5. **Section 03** — Login with Google + OAuth flow animation. Commit.
6. **Section 04** — AuthZ & attacks. Commit.
7. **Section 05 + 99** — demo slides wired to `demo/`, recorded fallback, Kahoot slide. Commit.
8. **Notes** — Vietnamese speaker script + Kahoot questions. Run `tools/renumber.py`. Commit.
9. **Verify** — open every slide in the browser pane (light + dark), step through every `data-step`, check 375px doesn't matter (deck is 16:9) but nothing overflows at 1280×720; run demo live and offline; print-to-PDF smoke test.
10. **Publish** — `gh repo create spartan-trucle/vntech-auth --public`, push `main`, enable Pages (Actions source). **Ask before this step.**

## Execution

- Steps 3–8 are independent per section → run as parallel `general-purpose` subagents, each given: the outline section, LB `presentation/CLAUDE.md` slide conventions, one LB section file as a style example, and the matching source lecture file. (The be-/fe- executor agents are Kotlin/Loanbud-React specific and don't fit a static deck.)
- Steps 1, 2, 9, 10 run in this session.
- Commits: title only, user's git identity.

## Test strategy

- Demo: `node --test` unit + route tests (written first); `pnpm check` (tsc).
- Deck: no automated tests in the LB repo either. Manual verification in the browser pane per step 9; console must be error-free; `renumber.py` output consistent.

## Risks

- **Content drift to "too deep"** — subagents copy detail from the source lectures. Mitigation: outline is the contract; review each section against the "cut" list before merging.
- **Charts-lib coupling** — LB's `charts-lib.js` helpers are LB-specific (servers, coins). Reuse `steps()`/`flow()` for OAuth flow; anything else written in-section.
- **Live demo from GitHub Pages** can't reach localhost → recorded fallback required (same as LB).
- **bcryptjs dependency** — only third-party runtime dep; acceptable (pure JS). Alternative: `node:crypto.scrypt` with zero deps, but then the code doesn't match the "use bcrypt" slide.
- **Public repo** — no secrets: demo JWT secret is a clearly-labelled dev constant read from env with a default.
