# Authentication & Authorization — vntech intern talk

Slides for an intern-level talk on authentication and authorization by **Truc Le**.

- [`presentation/`](presentation/) — the deck (56 slides, ~53 min + Kahoot): introduction, passwords, sessions & JWT, Login with Google (OAuth 2.0 / OIDC through Claude's connectors), service-to-service (Client Credentials, GitHub Actions → AWS), permissions & attacks. Plain HTML/CSS/JS, no build step. See its [README](presentation/README.md) to run it locally.
- [`presentation/auth-outline.md`](presentation/auth-outline.md) — talk outline (Vietnamese), the source of truth for slide content.
- `.github/workflows/deploy-pages.yml` — publishes `presentation/` to GitHub Pages on every push to `main`.

Content is a simplified, intern-level cut of [spartan-khanhdo/auth-security-lecture](https://github.com/spartan-khanhdo/auth-security-lecture).
Styling and slide engine follow [spartan-trucle/vntech-load-balancer](https://github.com/spartan-trucle/vntech-load-balancer).
