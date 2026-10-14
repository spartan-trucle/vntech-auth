# Authentication & Authorization — vntech intern talk

Slides for an intern-level talk on authentication and authorization by **Truc Le**.

- [`presentation/`](presentation/) — the deck: plain HTML/CSS/JS, no build step. See its [README](presentation/README.md) to run it locally.
- [`demo/`](demo/) — "The Forger": a tiny Node + TypeScript login server (bcrypt, session cookie, JWT, roles), driven live from slide 5.4. See its [README](demo/README.md).
- [`presentation/auth-outline.md`](presentation/auth-outline.md) — talk outline (Vietnamese), the source of truth for slide content.
- `.github/workflows/deploy-pages.yml` — publishes `presentation/` to GitHub Pages on every push to `main`.

Content is a simplified, intern-level cut of [spartan-khanhdo/auth-security-lecture](https://github.com/spartan-khanhdo/auth-security-lecture).
Styling and slide engine follow [spartan-trucle/vntech-load-balancer](https://github.com/spartan-trucle/vntech-load-balancer).
