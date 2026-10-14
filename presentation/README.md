# Authentication & Authorization — slide deck

HTML slides for an intern-level talk: who you are vs what you can do, storing passwords, session cookies vs JWT, "Login with Google" (OAuth 2.0 + OpenID Connect + MFA), permissions and the four bugs interns ship most often, and a live JWT-forging demo.

Presenter: **Truc Le**.

## View online

The deck is deployed to this repo's GitHub Pages every time someone pushes to `main`.

## Run locally

You **must open the deck over HTTP**. Double-clicking `index.html` will not work.

```bash
cd presentation
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Export to PDF

Every slide prints at its last step.

- **Browser:** open the deck, press `Cmd+P` / `Ctrl+P`, choose *Save as PDF*, margins *None*.
- **Headless**, with the server running on port 8000:

  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
    --virtual-time-budget=8000 --no-pdf-header-footer --print-to-pdf=auth.pdf \
    "http://localhost:8000/?print"
  ```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `→` `Space` `Enter` `PageDown` | Next step |
| `←` `Backspace` `PageUp` | Previous step |
| `Home` / `End` | First / last slide |
| `O` | See all slides (click one to jump to it) |
| `T` | Switch light / dark theme |
| `F` | Full screen |
| `Esc` | Close the all-slides view |

## Interactive slides

- **2.3 · JWT decoder** — a real token split into header, payload and signature, decoded in the browser.
- **3.3 · Authorization Code flow** — step through "Login with Google" with `→`.
- **5.4 · Live** — talks to the login server in [`demo/`](../demo/) (`pnpm start` in `demo/` first). Edit the JWT payload on the slide and resend. Without the server it replays a recording.
