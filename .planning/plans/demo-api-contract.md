# Demo API contract — `demo/` ↔ `presentation/sections/05-demo.html`

Both sides build against this file. Do not change it without updating both.

## Runtime

- Node ≥ 22.6, runs `.ts` directly: every script is `node --experimental-strip-types src/<file>.ts …`. No build step. `tsc --noEmit` for `pnpm check`.
- Only runtime dependency: `bcryptjs`. Dev: `typescript`, `@types/node`, `@types/bcryptjs` (if needed).
- Server on `http://localhost:4000` (env `PORT`). JWT secret from env `JWT_SECRET`, default `dev-only-secret-change-me` (comment that it is a demo default).
- In-memory store, reseeded on every start.

## Seed users (bcrypt cost 10 so startup stays fast; slides say 12 in production)

| email | password | role |
|---|---|---|
| admin@demo.vn | admin123 | admin |
| editor@demo.vn | editor123 | editor |
| viewer@demo.vn | viewer123 | viewer |

## RBAC

```
viewer: ["profile:read"]
editor: ["profile:read", "posts:write"]
admin:  ["profile:read", "posts:write", "users:list"]
```
Code checks permissions (`can(role, "users:list")`), never role names.

## JWT

- HS256 only, hand-written with `node:crypto` (`createHmac`, base64url) in `src/jwt.ts`, ~30–40 lines, readable by interns.
- Claims: `sub` (email), `role`, `iat`, `exp` (iat + 15 min).
- `verify(token)` returns `{ ok: true, payload }` or `{ ok: false, reason }` where reason ∈
  `"malformed" | "alg not allowed" | "bad signature" | "expired"`.
- `alg` must equal `"HS256"` exactly — `none`, `HS512`, anything else → `"alg not allowed"`.
- Signature compare with `crypto.timingSafeEqual`.

## HTTP

CORS on every response: `Access-Control-Allow-Origin: <request Origin or *>`, `Access-Control-Allow-Credentials: true`, `Access-Control-Allow-Headers: Authorization, Content-Type`, `Access-Control-Allow-Methods: GET, POST, OPTIONS`, `Access-Control-Expose-Headers: X-Auth-Reason`. `OPTIONS` → 204.

All bodies JSON. Errors: `{ "error": string, "reason"?: string, "need"?: string }`; 401s also send header `X-Auth-Reason: <reason>`.

| Method | Path | Auth | Success | Failure |
|---|---|---|---|---|
| GET | `/__health` | — | `200 {"ok":true}` | — |
| POST | `/register` | — | `201 {"email","role":"viewer"}` | `400` missing fields / `409` exists |
| POST | `/login` `{email,password}` | — | `200 {"token","user":{"email","role"}}` + `Set-Cookie: sid=<random 32 hex>; HttpOnly; SameSite=Lax; Path=/` | `401 {"error":"Email or password is wrong"}` (same message for unknown email and wrong password) |
| POST | `/logout` | cookie | `204`, deletes session, clears cookie | — |
| GET | `/me` | Bearer JWT **or** `sid` cookie | `200 {"email","role","via":"jwt"\|"session"}` | `401 {"error":"Unauthorized","reason"}`; reason `"missing token"` when neither present, `"unknown session"` for a bad sid, else the JWT reason |
| GET | `/admin/users` | auth + `users:list` | `200 [{"email","role"}]` | `401` as above / `403 {"error":"Forbidden","need":"users:list"}` |
| GET | `/__db` | — (demo only) | `200 [{"email","role","passwordHash"}]` — shows `$2b$10$…`, never plaintext | — |

## CLI (`src/cli.ts`, via package.json scripts)

| Script | Does |
|---|---|
| `pnpm start` | start server detached, pid in `.run/server.pid`, log in `.run/server.log`; prints URL |
| `pnpm stop` | kill it |
| `pnpm status` | up/down + port |
| `pnpm users` | GET `/__db`, print a table (email, role, hash) |
| `pnpm jwt <email> [password]` | POST `/login` (default password = local part + `123`), print the token and its decoded payload |
| `pnpm dev` | run server in foreground |
| `pnpm test` | `node --experimental-strip-types --test test/*.test.ts` |
| `pnpm check` | `tsc --noEmit` |

Note: the script is `jwt`, not `login` — `pnpm login` is pnpm's own registry command. Scripts also pass `--disable-warning=ExperimentalWarning`.
