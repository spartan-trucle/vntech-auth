# Plan: "What is OIDC" slide in section 3

Request (2026-11-02): before the slide "“Login with Google” = OIDC + OAuth", add a slide that says what OIDC is and its basic concepts.

Order: this runs after the PKCE slide (`pkce-detail.md`) lands, because both edit `03-login-with-google.html`. After PKCE, the OIDC + OAuth slide is 3.7. The new slide becomes 3.7 and pushes it to 3.8.

## Slide: 3.7 · OIDC · OpenID Connect

- h2: "OAuth says what an app can do. OIDC adds who you are, on top of the same flow." (slide text)
- Problem line: OAuth gives the app an access token for an API. It does not tell the app who logged in. If an app uses an access token as proof of login, a token made for another app can fool it.
- Three cards, "OIDC adds three things to OAuth":
  1. `scope=openid` (plus `email`, `profile`) in the same `/authorize` request.
  2. An `id_token`: a signed JWT for your app, with `iss`, `sub`, `aud`, `exp`, `email`. It answers "who is this user", for this app only (`aud`).
  3. Standard endpoints: `/.well-known/openid-configuration` (where everything is), `/userinfo` (more profile), and the public keys that check the `id_token` signature.
- Two words on one line: OpenID Provider = Google, Microsoft, Apple, Okta, Auth0. Relying Party = your app.
- Bottom line: "Same redirect, same code, same `/token`. You get one more token back." This hands off to 3.8, which shows both buttons and the decoded `id_token`.
- No duplicate of 3.8's decoded token. 3.7 lists claim names only.
- Static slide with 3 `data-step` reveals (one per card). No new chart.

## Other edits

- Renumber 3.7–3.9 → 3.8–3.10. Fix cross-references in all sections, and run `tools/renumber.py` (deck 62 → 63).
- Update `auth-outline.md`.
- Update `speaker-script.md`: one heading, renumber, about +1 min.
- Add "OIDC" to the section 03 line in `00-outline.html`.

## Check

63 slides, unique ids, footers, `?print` PDF of the slide, light + dark.

## Risks

- Time: about +1 min. The talk goes to about 61–62 min before Q&A.
- Overlap with 3.8: 3.7 is concept only, and 3.8 keeps the example.
