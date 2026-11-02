# Plan: Refresh tokens and revocation in section 2

Request (2026-11-02):

- Add refresh token lifetime best practices, the refresh token itself, and the two refresh flows (silent refresh, refresh on 401) to section 2.
- Show where each token is stored. The access token is stateless, so the server does not store it. The server stores only the refresh token.
- Explain the revocation problem and the token version fix.

Context: commit `38a6701` removed the old slide "2.7 Access token + refresh token". That commit trimmed sections 1 and 2 to make room for service-to-service. Today section 2 mentions refresh tokens in one bullet on 2.4 and one Do-and-avoid row. The outline lists "refresh token reuse detection / rotation" as cut.

## Slides (section 2 goes from 9 to 13 slides, deck 56 → 60)

Current slides: divider, ask, 2.1 cookie, 2.2 JWT, ask, 2.3 tamper, 2.4 session vs JWT, ask, 2.5 storage, 2.6 Do-and-avoid.

New order:

1. 2.1–2.4 unchanged. The 2.4 step-2 bullet stays as the hand-off: "the usual fix is a short `exp` plus a refresh token".
2. **2.5 Access token + refresh token: who stores what.** Two cards and a lifetime table.
   - Access token card: a JWT, typically 5–15 min, sent on every API call as `Authorization: Bearer …`. The server stores nothing. It checks the signature and `exp` and is done. That is what "stateless" means.
   - Refresh token card: a random opaque string, typically 7–30 days. The server stores it as a hash in a `refresh_tokens` table (`user_id`, `token_hash`, `expires_at`, `revoked_at`). Because a row exists, the server can delete it. The token is sent only to `POST /auth/refresh`.
   - Lifetime table, one row each:
     - access token: 5–15 min, not stored.
     - refresh idle timeout: about 7–14 days.
     - refresh absolute maximum: about 30–90 days. After that, the user logs in again.
     - rotation: each refresh returns a new refresh token, and the old row is marked used.
     - logout: delete the refresh token row.
   - The timeline chart from the old slide (`#s2-tl`) comes back: access renewed every 15 min, logout cuts the chain.
3. **2.6 The revocation problem**, stepped (`Charts.steps`).
   - Step 1, the problem: an admin bans a user, or the user clicks "log out of all devices". The refresh rows are deleted, but the access JWT already in hand still works until `exp`, for up to 15 more minutes. The server stores nothing about it, so there is nothing to delete.
   - Step 2, option A, which is to wait: keep `exp` short and accept the gap. This is enough for most apps.
   - Step 3, option B, token version: the `users` table gets a `token_version` column, and each access token carries it as a claim, for example `"tv": 3`. "Log out everywhere", password change, or role change increments the column to 4. On each request the server compares `tv` with the current value. If they differ, it returns 401.
   - Step 4, option C, a denylist: each token gets a `jti` (JWT ID, a unique ID per token). The server keeps revoked `jti` values in Redis until their `exp`, so it can kill one token instead of all of them.
   - Step 5, the trade-off: B and C add a lookup on every request, so the JWT is no longer fully stateless. Keep the lookup in a cache (Redis or in-memory with a short TTL).
4. **Your turn (open).** "Your access token expires while you are typing a long message. What must the app do so that you do not lose it?"
5. **2.7 Two ways to refresh**, stepped, two lanes side by side:
   - Silent refresh, which is proactive: a timer fires about 1 min before `exp`, calls `POST /auth/refresh` in the background, and the user sees nothing.
   - Refresh on 401, which is reactive: the API call gets 401, the app calls `/auth/refresh`, and the app retries the original request once. If the refresh also fails, the app goes to the login page.
   - Bottom line: most apps do both. The timer covers the normal case, and the 401 handler covers a sleeping laptop or a closed tab.
6. **2.8 The trap: five requests, one refresh.** Stepped sequence (`Charts.scene`): five API calls hit 401 at the same time. Done naively, five refresh calls go out, and with rotation calls 2–5 present an already used token, so the server logs the user out. The fix is single-flight: the first 401 starts the refresh, the other requests wait on the same promise and then retry. Includes a 12-line `fetch` wrapper example.
7. Ask (storage), then **2.9 Where the browser keeps it** (was 2.5). It gets one new line for the browser side: access token in memory or an `HttpOnly` cookie, refresh token in an `HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh` cookie, so it travels only to the refresh endpoint. Server-side storage stays on 2.5, so the two slides do not repeat each other.
8. **2.10 Do-and-avoid** (was 2.6) gets two new rows:
   - REFRESH: "every request refreshes on its own, retries forever" vs "one shared refresh, retry once, then go to login".
   - REVOKE: "store every access token in the DB" vs "short `exp` + `token_version` for log-out-everywhere".

"Silent refresh" here means the timer-based refresh. The older OIDC meaning is a hidden iframe with `prompt=none`. If the browser blocks third-party cookies, that method fails. The speaker script mentions it in one line only.

Claim names: `jti` is the standard JWT claim for a token ID (RFC 7519). Token version has no standard claim name. The slide uses `tv`. The slide does not use `tid`. Microsoft Entra ID uses `tid` for the tenant ID, and interns will meet it with that meaning in Azure tokens.

## Files

```
presentation/sections/02-sessions-jwt.html   4 new slides, renumber 2.5→2.9 and 2.6→2.10, timeline + steps scripts
presentation/css/deck.css                    small block for the 2.7 two-lane layout (tokens only)
presentation/sections/05-authz-attacks.html  check cross-references to section 2 numbers
presentation/sections/00-outline.html        section 02 description adds "refresh tokens, revocation"
presentation/auth-outline.md                 section 2 rewrite, remove "rotation" from the cut list, slide count
presentation/notes/speaker-script.md         4 new headings, renumber, timing table
presentation/notes/kahoot-questions.md       optional: swap in a refresh or revocation question
tools/renumber.py                            run, do not edit
```

## Steps

1. 2.5 slide + restored timeline chart.
2. 2.6 revocation stepped slide.
3. Your-turn slide + 2.7 stepped two-lane slide.
4. 2.8 single-flight slide, the 2.9 browser line, and the two Do-and-avoid rows. Renumber the eyebrows and run `tools/renumber.py`.
5. Outline, outline slide, speaker script, timing.
6. Check: 60 slides, unique ids, footers, `?print` PDF of section 2, light + dark, step-through with the arrow keys, no console errors.

Execution: one general-purpose agent for steps 1–5, because they all touch the same section file. I do step 6 and commit per step.

## Test strategy

The deck has no automated tests. Checks: script parse, headless DOM dump (slide count, ids), `?print` final states, manual step-through in the browser pane in both themes.

## Risks

- Time: about +6 min. Section 2 goes from 10 to about 16 min, and the talk from 53 to about 59 min before Q&A. That leaves little room in a 60-minute slot.
- Depth: rotation, token version, and single-flight are a step above intern level. If time is short, cut 2.8 first, then step 4 (denylist) of 2.6.
- Numbers: the lifetimes are common defaults, not a standard. The slide labels them "typical".
