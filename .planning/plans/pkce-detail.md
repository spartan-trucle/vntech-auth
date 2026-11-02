# Plan: PKCE in more detail in section 3 (short version)

Request (2026-11-02): write more detail about PKCE, based on the old course (`auth-security-lecture`, lecture `oauth`, units 8 and 12), and copy its image.

Decisions (user, 2026-11-02):

- "The image" is the old Mermaid sequence diagram "Authorization Code + PKCE Sequence Diagram". It is redrawn as a stepped SVG flow in the deck's style, not pasted as a screenshot.
- Keep it short: one new slide. Do not cut MFA.

Context: today PKCE gets one line on 3.3, a `code_challenge` line and a "PKCE required" bullet on 3.4, and a row on 3.5. The outline lists "PKCE chi tiết" as cut. This plan changes that entry to "PKCE: one slide only".

## Slide (section 3 goes from 9 to 10 slides, deck 61 → 62)

New order:

- divider, 3.1, 3.2, 3.3, 3.4 connectors
- **3.5 PKCE: a stolen code is useless** (new)
- 3.6 grant types (was 3.5)
- 3.7 OIDC (was 3.6)
- 3.8 MFA (was 3.7)
- 3.9 Do-and-avoid (was 3.8)

The new slide follows 3.4 because 3.4 ends with "every MCP client must use PKCE".

**3.5 PKCE: a stolen code is useless.** `Charts.scene()` + `steps()`, ids `s3-pk-*`.

- h2: "A phone app cannot hide a secret. PKCE proves that the app that started the login also finishes it."
- One problem line on top, from old unit 8: a mobile app, SPA, or MCP client runs on your device, so it cannot keep a `client_secret`. If a bad app catches the redirect code, it can trade the code for your tokens.
- Three lanes, from the old diagram: App (mobile, SPA, MCP client) · accounts.google.com · Google API. Four steps:
  1. The app makes a random `code_verifier` and keeps it. It sends `code_challenge = SHA-256(code_verifier)` with the redirect to `/authorize`.
  2. You log in and click Allow. Google stores the challenge and redirects back with `?code=…`.
  3. `POST /token` with `code` + `code_verifier`. Google checks `SHA-256(code_verifier) == code_challenge` and returns the tokens.
  4. A bad app with only the code: `POST /token` without the verifier gets `invalid_grant`.
- Caption, from the old slide: "The verifier never travels until the last step, and by then a stolen code is useless."
- No simulator and no live hashing. The challenge value is a fixed sample.

Small edits:

- 3.4 "PKCE required" bullet points to 3.5.
- 3.3 PKCE note points to 3.5.
- 3.6 grant types: the PKCE row's cross-reference changes to 3.5.
- No new Do-and-avoid row. The existing slide is already full.

## Files

```
presentation/sections/03-login-with-google.html   1 new slide, renumber 3.5–3.8 → 3.6–3.9, cross-references, scene script
presentation/css/deck.css                         small "section 03 · pkce" block (tokens only)
presentation/sections/*.html                      cross-references to 3.5–3.8 in other sections; footers via tools/renumber.py
presentation/auth-outline.md                      section 3, cut list, counts, time
presentation/notes/speaker-script.md              1 new heading, renumber, timing table
presentation/CLAUDE.md                            interactive slides list, cut list
```

## Steps

1. 3.5 stepped slide.
2. Cross-references, renumber eyebrows, `tools/renumber.py`.
3. Outline, speaker script, CLAUDE.md.
4. Check: 62 slides, unique ids, footers, `?print` PDF of section 3, light + dark, no console errors.

Execution: one general-purpose agent for steps 1–3. I do step 4 and commit.

## Risks

- Time: about +1.5 min. The talk goes to about 60–61 min before Q&A, with MFA kept.
- Accuracy: the slide does not claim that Google requires PKCE for every client.
